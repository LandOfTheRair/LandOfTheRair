import type {
  ArmorClass,
  IItem,
  IItemDefinition,
  IRNGDungeonConfig,
  IRNGDungeonMetaConfig,
  IRNGItemScenario,
  StatBlock,
  WeaponClass,
} from '@lotr/interfaces';
import { ItemClass, RNGItemType, Stat, WeaponClasses } from '@lotr/interfaces';
import { isNumber, set } from 'lodash';
import type { Rollable } from 'lootastic';
import type { RNG } from 'rot-js';

export class RNGDungeonItemGenerator {
  constructor(
    private readonly rng: typeof RNG,
    private readonly mapMeta: IRNGDungeonMetaConfig,
    private readonly config: IRNGDungeonConfig,
    private readonly addSpoilerLog: (message: string) => void,
    private itemDefBases: IItemDefinition[],
  ) {}

  getItems(): IItemDefinition[] {
    const themes: Record<string, IRNGItemScenario> = {
      All: this.rng.getItem(
        this.config.itemScenarios.filter((x) => !x.requiresTypes),
      ) as IRNGItemScenario,
    };

    // pick item themes
    for (let i = 0; i < this.mapMeta.itemProps.numScenarios; i++) {
      const chosenItemType = this.rng.getItem(
        Object.values(RNGItemType).filter((x) => !themes[x]),
      );

      if (!chosenItemType) continue;

      const chosenTheme = this.rng.getItem(
        this.config.itemScenarios.filter(
          (x) =>
            x.name !== themes.All!.name &&
            (x.requiresTypes?.includes(chosenItemType) ?? true),
        ),
      );

      if (chosenItemType && chosenTheme) {
        themes[chosenItemType] = chosenTheme;
      }

      this.addSpoilerLog(
        `Item Scenario "${chosenTheme!.name ?? 'unknown'}" applied to "${chosenItemType}" items.`,
      );
    }

    const takenSprites: number[] = [];

    // rings start with prots
    const ringStatBoosts: Partial<StatBlock> = {};
    const ringStats = [
      Stat.FireResist,
      Stat.IceResist,
      Stat.WaterResist,
      Stat.LightningResist,
      Stat.EnergyResist,
      Stat.PoisonResist,
      Stat.PoisonResist,
      Stat.DiseaseResist,
      Stat.NecroticResist,
    ];

    const betterRingStats = [Stat.MagicalResist, Stat.PhysicalResist];

    const isBetter = this.rng.getItem([...Array(9).fill(false), true]);

    const ringStat = isBetter
      ? this.rng.getItem(betterRingStats)
      : this.rng.getItem(ringStats);

    if (ringStat) {
      ringStatBoosts[ringStat] = isBetter
        ? this.mapMeta.itemProps.baseGeneralResist
        : this.mapMeta.itemProps.baseSpecificResist;
    }

    this.addSpoilerLog(
      `Rings (if found) will reduce incoming ${ringStat?.split('Resist')[0] ?? 'unknown'} damage.`,
    );

    // amulets start with boosts
    const amuletStatBoosts: Partial<StatBlock> = {};
    const amuletStats = [
      Stat.FireBoostPercent,
      Stat.IceBoostPercent,
      Stat.NecroticBoostPercent,
      Stat.EnergyBoostPercent,
      Stat.WaterBoostPercent,
      Stat.LightningBoostPercent,
      Stat.PoisonBoostPercent,
      Stat.DiseaseBoostPercent,
      Stat.SonicBoostPercent,
      Stat.HealingBoostPercent,
      Stat.PhysicalBoostPercent,
      Stat.MagicalBoostPercent,
    ];

    const amuletStat = this.rng.getItem(amuletStats);
    if (amuletStat) {
      amuletStatBoosts[amuletStat] = this.mapMeta.itemProps.baseBoostPercent;
    }

    this.addSpoilerLog(
      `Amulets (if found) will bolster outgoing ${amuletStat?.split('Boost')[0] ?? 'unknown'} damage.`,
    );

    // earrings spawn with a random trait at a certain level
    const allPossibleTraits = this.itemDefBases
      .filter((x) => x.itemClass === ItemClass.Scroll)
      .map((x) => x.trait?.name);

    const chosenTrait = this.rng.getItem(allPossibleTraits);

    this.addSpoilerLog(
      `Earrings (if found) will improve the rune "${chosenTrait}".`,
    );

    // apply themes
    this.itemDefBases.forEach((itemDef) => {
      // make sure this has an item def before we go crazy overwriting it
      const itemDefConfig = this.config.itemConfigs[itemDef.itemClass];
      if (!itemDefConfig) return;

      itemDef.baseMods = {};

      const allThemes: Set<string> = new Set();

      const scenarioThemeMult = this.mapMeta.itemProps.scenarioMultiplier;

      // apply stats: global and otherwise
      ['All', ...(itemDefConfig.type ?? [])].forEach((type) => {
        const theme = themes[type as keyof typeof themes];

        if (!theme) return;

        itemDef.baseMods!.stats = itemDef.baseMods!.stats || {};

        allThemes.add(theme.name);

        // apply stats
        Object.keys(theme.statChanges).forEach((mod) => {
          const originMod = mod;

          if (
            (WeaponClasses.includes(itemDef.itemClass as WeaponClass) ||
              itemDef.itemClass === ItemClass.Shield) &&
            mod === Stat.ArmorClass
          ) {
            mod = Stat.WeaponArmorClass;
          }

          let statValue = itemDef.baseMods!.stats![mod as Stat] ?? 0;
          statValue +=
            (theme.statChanges[originMod as Stat] ?? 0) * scenarioThemeMult;

          itemDef.baseMods!.stats![mod as Stat] = statValue;
        });

        // apply returning etc
        if (theme.topLevelChanges) {
          Object.keys(theme.topLevelChanges).forEach((mod) => {
            const topLevelChange = theme.topLevelChanges![mod as keyof IItem];
            if (!topLevelChange) return;

            const change = isNumber(topLevelChange)
              ? topLevelChange * scenarioThemeMult
              : topLevelChange;

            set(itemDef.baseMods!, mod, change);
          });
        }
      });

      // apply trait descriptions
      const allThemesArray = Array.from(allThemes);
      const descAddon =
        allThemesArray.length > 1
          ? allThemesArray.slice(0, -1).join(', ') +
            ' and ' +
            allThemesArray.slice(-1)
          : allThemesArray[0];

      itemDef.baseMods.desc = `${itemDef.desc}, inscribed with the runes of ${descAddon}`;

      // "Powerful"
      if (itemDef.quality === 3) {
        Object.keys(itemDef.baseMods.stats!).forEach((statMod) => {
          if (!isNumber(itemDef.baseMods!.stats![statMod as Stat])) return;
          const canFloor =
            (itemDef.baseMods!.stats![statMod as Stat] ?? 0) % 1 === 0;

          itemDef.baseMods!.stats![statMod as Stat] =
            (itemDef.baseMods!.stats![statMod as Stat] ?? 0) * 1.5;
          if (canFloor) {
            itemDef.baseMods!.stats![statMod as Stat] = Math.floor(
              itemDef.baseMods!.stats![statMod as Stat] ?? 0,
            );
          }
        });
      }

      // "Legendary"
      if (itemDef.quality === 5) {
        Object.keys(itemDef.baseMods.stats!).forEach((statMod) => {
          if (!isNumber(itemDef.baseMods!.stats![statMod as Stat])) return;
          const canFloor =
            (itemDef.baseMods!.stats![statMod as Stat] ?? 0) % 1 === 0;

          itemDef.baseMods!.stats![statMod as Stat] =
            (itemDef.baseMods!.stats![statMod as Stat] ?? 0) * 2;
          if (canFloor) {
            itemDef.baseMods!.stats![statMod as Stat] = Math.floor(
              itemDef.baseMods!.stats![statMod as Stat] ?? 0,
            );
          }
        });
      }

      // items need a level requirement
      itemDef.baseMods.requirements = {
        level: this.mapMeta.creatureProps.level,
      };

      const sprite = this.rng.getItem(
        itemDefConfig.sprites.filter((x) => !takenSprites.includes(x)),
      );
      if (sprite) {
        itemDef.baseMods.sprite = sprite;

        takenSprites.push(sprite);
      }

      // add item base stats
      if (
        WeaponClasses.includes(itemDef.itemClass as WeaponClass) ||
        [ItemClass.Gloves, ItemClass.Claws, ItemClass.Boots].includes(
          itemDef.itemClass as ArmorClass,
        )
      ) {
        itemDef.baseMods.tier = this.mapMeta.itemProps.baseTier;
      }

      if (itemDef.itemClass === ItemClass.Arrow) {
        itemDef.baseMods.tier = this.mapMeta.itemProps.baseArrowTier;
      }

      // base armor class
      if (itemDef.itemClass === ItemClass.Tunic) {
        itemDef.baseMods.stats![Stat.ArmorClass] =
          this.mapMeta.itemProps.baseArmorClass;
      }

      if (itemDef.itemClass === ItemClass.Fur) {
        itemDef.baseMods.stats![Stat.ArmorClass] =
          this.mapMeta.itemProps.baseArmorClass + 3;
      }

      if (itemDef.itemClass === ItemClass.Breastplate) {
        itemDef.baseMods.stats![Stat.ArmorClass] =
          this.mapMeta.itemProps.baseArmorClass + 5;
      }

      if (itemDef.itemClass === ItemClass.Scaleplate) {
        itemDef.baseMods.stats![Stat.ArmorClass] =
          this.mapMeta.itemProps.baseArmorClass + 7;
      }

      if (itemDef.itemClass === ItemClass.Fullplate) {
        itemDef.baseMods.stats![Stat.ArmorClass] =
          this.mapMeta.itemProps.baseArmorClass + 10;
      }

      // weapon armor class - shield
      if (itemDef.itemClass === ItemClass.Shield) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] =
          this.mapMeta.itemProps.baseShieldArmorClass;
      }

      // weapon armor class - weapons
      if (itemDef.itemClass === ItemClass.Shortsword) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] =
          this.mapMeta.itemProps.baseWeaponArmorClass;
      }

      if (itemDef.itemClass === ItemClass.Longsword) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] =
          this.mapMeta.itemProps.baseWeaponArmorClass + 3;
      }

      if (itemDef.itemClass === ItemClass.Broadsword) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] =
          this.mapMeta.itemProps.baseWeaponArmorClass + 5;
      }

      if (
        itemDef.itemClass === ItemClass.Mace ||
        itemDef.itemClass === ItemClass.Greatmace
      ) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] =
          this.mapMeta.itemProps.baseWeaponArmorClass + 7;
      }

      if (itemDef.itemClass === ItemClass.Halberd) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] =
          this.mapMeta.itemProps.baseWeaponArmorClass + 10;
      }

      if (itemDef.itemClass === ItemClass.Ring) {
        Object.keys(ringStatBoosts).forEach(
          (key) =>
            (itemDef.baseMods!.stats![key as Stat] =
              ringStatBoosts[key as Stat]),
        );
      }

      if (itemDef.itemClass === ItemClass.Amulet) {
        Object.keys(amuletStatBoosts).forEach(
          (key) =>
            (itemDef.baseMods!.stats![key as Stat] =
              amuletStatBoosts[key as Stat]),
        );
      }

      if (itemDef.itemClass === ItemClass.Earring && chosenTrait) {
        itemDef.baseMods.trait = {
          name: chosenTrait,
          level: this.mapMeta.itemProps.maxTraitLevel,
        };
      }
    });

    // sprite cleanup just in case
    this.itemDefBases.forEach((itemDef) => {
      const itemDefConfig = this.config.itemConfigs[itemDef.itemClass];
      if (!itemDefConfig) return;

      itemDef.baseMods = itemDef.baseMods || {};

      if (itemDef.baseMods.sprite) return;

      const sprite = this.rng.getItem(itemDefConfig.sprites);
      if (!isNumber(sprite)) return;

      itemDef.baseMods.sprite = sprite;
    });

    return this.itemDefBases;
  }

  getMapDroptable(
    items: IItemDefinition[],
    bonusItems: Rollable[],
  ): Rollable[] {
    const rollables: Rollable[] = [];
    const potentialItems = items.filter((x) => !x.name.includes('Punching'));

    for (let i = 0; i < this.mapMeta.itemProps.mapDropItems; i++) {
      const validItems = potentialItems.filter(
        (x) =>
          x.itemClass !== ItemClass.Scroll &&
          x.itemClass !== ItemClass.Gem &&
          !rollables.map((r) => r.result).includes(x.name),
      );

      if (validItems.length === 0) {
        console.error('Solokar', 'No valid items found for map drop table!');
        continue;
      }

      const item = this.rng.getItem(validItems);
      if (!item) continue;

      let maxChance = 50;

      if (item.quality === 3) maxChance = 500;
      if (item.quality === 5) maxChance = 5000;

      rollables.push({ chance: 1, maxChance, result: item.name });
    }

    for (let i = 0; i < 3; i++) {
      const validItems = potentialItems.filter(
        (x) =>
          x.itemClass === ItemClass.Gem &&
          !rollables.map((r) => r.result).includes(x.name),
      );

      if (validItems.length === 0) {
        console.error(
          'Solokar',
          'No valid scroll gems found for map drop table!',
        );
        continue;
      }

      const item = this.rng.getItem(validItems);
      if (!item) continue;

      rollables.push({ chance: 1, maxChance: 200, result: item.name });
    }

    for (let i = 0; i < 3; i++) {
      const validItems = potentialItems.filter(
        (x) =>
          x.itemClass === ItemClass.Scroll &&
          !rollables.map((r) => r.result).includes(x.name),
      );

      if (validItems.length === 0) {
        console.error(
          'Solokar',
          'No valid scroll items found for map drop table!',
        );
        continue;
      }

      const item = this.rng.getItem(validItems);
      if (!item) continue;

      rollables.push({ chance: 1, maxChance: 200, result: item.name });
    }

    if (bonusItems?.length > 0) {
      rollables.push(...bonusItems);
    }

    return rollables;
  }
}
