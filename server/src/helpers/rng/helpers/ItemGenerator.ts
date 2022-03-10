
import { isNumber } from 'lodash';
import { Rollable } from 'lootastic';
import { RNG } from 'rot-js/dist/rot';
import { IItemDefinition, IRNGDungeonConfig, IRNGDungeonMetaConfig,
  ItemClass, RNGItemType, Stat, WeaponClass, WeaponClasses } from '../../../interfaces';

export class RNGDungeonItemGenerator {

  constructor(
    private readonly rng: RNG,
    private readonly mapMeta: IRNGDungeonMetaConfig,
    private readonly config: IRNGDungeonConfig,
    private readonly addSpoilerLog: (message: string) => void,
    private itemDefBases: IItemDefinition[]
  ) {}

  getItems(): IItemDefinition[] {
    const themes = {
      All: this.rng.getItem(this.config.itemScenarios.filter(x => !x.requiresTypes))
    };

    // pick item themes
    for (let i = 0; i < this.mapMeta.itemProps.numScenarios; i++) {
      const chosenItemType = this.rng.getItem(Object.values(RNGItemType).filter(x => !themes[x]));
      const chosenTheme = this.rng.getItem(this.config.itemScenarios.filter(x => x.name !== themes.All.name
                                                                              && (x.requiresTypes?.includes(chosenItemType) ?? true)));

      themes[chosenItemType] = chosenTheme;

      this.addSpoilerLog(`Item Scenario "${chosenTheme.name}" applied to "${chosenItemType}" items.`);
    }

    const takenSprites: number[] = [];

    // rings start with prots
    const ringStatBoosts = {};
    const ringStats = [
      Stat.FireResist, Stat.IceResist, Stat.WaterResist,
      Stat.EnergyResist, Stat.PoisonResist, Stat.PoisonResist,
      Stat.DiseaseResist, Stat.NecroticResist
    ];

    const betterRingStats = [Stat.MagicalResist, Stat.PhysicalResist];

    const isBetter = this.rng.getItem([...Array(9).fill(false), true]);

    const ringStat = isBetter ? this.rng.getItem(betterRingStats) : this.rng.getItem(ringStats);
    ringStatBoosts[ringStat] = isBetter ? this.mapMeta.itemProps.baseGeneralResist : this.mapMeta.itemProps.baseSpecificResist;

    this.addSpoilerLog(`Rings (if found) will reduce incoming ${ringStat.split('Resist')[0]} damage.`);

    // amulets start with boosts
    const amuletStatBoosts = {};
    const amuletStats = [
      Stat.FireBoostPercent, Stat.IceBoostPercent, Stat.NecroticBoostPercent,
      Stat.EnergyBoostPercent, Stat.PoisonBoostPercent, Stat.DiseaseBoostPercent,
      Stat.SonicBoostPercent, Stat.HealingBoostPercent, Stat.PhysicalBoostPercent,
      Stat.MagicalBoostPercent
    ];

    const amuletStat = this.rng.getItem(amuletStats);

    amuletStatBoosts[amuletStat] = this.mapMeta.itemProps.baseBoostPercent;

    this.addSpoilerLog(`Amulets (if found) will bolster outgoing ${amuletStat.split('Boost')[0]} damage.`);

    // earrings spawn with a random trait at a certain level
    const allPossibleTraits = this.itemDefBases
      .filter(x => x.itemClass === ItemClass.Scroll
                && !x.binds
                && x.trait?.level === this.mapMeta.itemProps.traitLevel)
      .map(x => x.trait?.name);

    const chosenTrait = this.rng.getItem(allPossibleTraits);

    this.addSpoilerLog(`Earrings (if found) will improve the rune "${chosenTrait}".`);

    // apply themes
    this.itemDefBases.forEach(itemDef => {

      // make sure this has an item def before we go crazy overwriting it
      const itemDefConfig = this.config.itemConfigs[itemDef.itemClass];
      if (!itemDefConfig) return;

      itemDef.baseMods = { };

      const allThemes: Set<string> = new Set();

      // apply stats: global and otherwise
      ['All', ...itemDefConfig.type].forEach(type => {
        if (!themes[type]) return;

        itemDef.baseMods!.stats = itemDef.baseMods!.stats || {};

        const theme = themes[type];
        allThemes.add(theme.name);

        // apply stats
        Object.keys(theme.statChanges).forEach(mod => {
          const originMod = mod;

          if ((WeaponClasses.includes(itemDef.itemClass as WeaponClass) || itemDef.itemClass === ItemClass.Shield)
          && mod === Stat.ArmorClass) {
            mod = Stat.WeaponArmorClass;
          }

          itemDef.baseMods!.stats![mod] = itemDef.baseMods!.stats![mod] ?? 0;
          itemDef.baseMods!.stats![mod] += theme.statChanges[originMod];
        });

        // apply returning etc
        if (theme.topLevelChanges) {
          Object.keys(theme.topLevelChanges).forEach(mod => {
            itemDef.baseMods![mod] = theme.topLevelChanges[mod];
          });
        }

      });

      // apply trait descriptions
      const allThemesArray = Array.from(allThemes);
      const descAddon = allThemesArray.length > 1
        ? allThemesArray.slice(0, -1).join(', ') + ' and ' + allThemesArray.slice(-1)
        : allThemesArray[0];

      itemDef.baseMods.desc = `${itemDef.desc}, inscribed with the runes of ${descAddon}`;

      // "Powerful"
      if (itemDef.quality === 3) {
        Object.keys(itemDef.baseMods.stats!).forEach(statMod => {
          if (!isNumber(itemDef.baseMods!.stats![statMod])) return;
          const canFloor = itemDef.baseMods!.stats![statMod] % 1 === 0;

          itemDef.baseMods!.stats![statMod] = itemDef.baseMods!.stats![statMod] * 1.5;
          if (canFloor) {
            itemDef.baseMods!.stats![statMod] = Math.floor(itemDef.baseMods!.stats![statMod]);
          };
        });
      }

      // "Legendary"
      if (itemDef.quality === 5) {
        Object.keys(itemDef.baseMods.stats!).forEach(statMod => {
          if (!isNumber(itemDef.baseMods!.stats![statMod])) return;
          const canFloor = itemDef.baseMods!.stats![statMod] % 1 === 0;

          itemDef.baseMods!.stats![statMod] = itemDef.baseMods!.stats![statMod] * 2;
          if (canFloor) {
            itemDef.baseMods!.stats![statMod] = Math.floor(itemDef.baseMods!.stats![statMod]);
          };
        });
      }

      const sprite = this.rng.getItem(itemDefConfig.sprites.filter(x => !takenSprites.includes(x)));
      itemDef.baseMods.sprite = sprite;

      takenSprites.push(sprite);

      // add item base stats
      if (WeaponClasses.includes(itemDef.itemClass as WeaponClass)) {
        itemDef.baseMods.tier = this.mapMeta.itemProps.baseTier;
      }

      // base armor class
      if (itemDef.itemClass === ItemClass.Tunic) {
        itemDef.baseMods.stats![Stat.ArmorClass] = this.mapMeta.itemProps.baseArmorClass;
      }

      if (itemDef.itemClass === ItemClass.Fur) {
        itemDef.baseMods.stats![Stat.ArmorClass] = this.mapMeta.itemProps.baseArmorClass + 3;
      }

      if (itemDef.itemClass === ItemClass.Breastplate) {
        itemDef.baseMods.stats![Stat.ArmorClass] = this.mapMeta.itemProps.baseArmorClass + 5;
      }

      if (itemDef.itemClass === ItemClass.Scaleplate) {
        itemDef.baseMods.stats![Stat.ArmorClass] = this.mapMeta.itemProps.baseArmorClass + 7;
      }

      if (itemDef.itemClass === ItemClass.Fullplate) {
        itemDef.baseMods.stats![Stat.ArmorClass] = this.mapMeta.itemProps.baseArmorClass + 10;
      }

      // weapon armor class - shield
      if (itemDef.itemClass === ItemClass.Shield) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] = this.mapMeta.itemProps.baseShieldArmorClass;
      }

      // weapon armor class - weapons
      if (itemDef.itemClass === ItemClass.Shortsword) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] = this.mapMeta.itemProps.baseWeaponArmorClass;
      }

      if (itemDef.itemClass === ItemClass.Longsword) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] = this.mapMeta.itemProps.baseWeaponArmorClass + 3;
      }

      if (itemDef.itemClass === ItemClass.Broadsword) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] = this.mapMeta.itemProps.baseWeaponArmorClass + 5;
      }

      if (itemDef.itemClass === ItemClass.Mace || itemDef.itemClass === ItemClass.Greatmace) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] = this.mapMeta.itemProps.baseWeaponArmorClass + 7;
      }

      if (itemDef.itemClass === ItemClass.Halberd) {
        itemDef.baseMods.stats![Stat.WeaponArmorClass] = this.mapMeta.itemProps.baseWeaponArmorClass + 10;
      }

      if (itemDef.itemClass === ItemClass.Ring) {
        Object.keys(ringStatBoosts).forEach(key => itemDef.baseMods!.stats![key] = ringStatBoosts[key]);
      }

      if (itemDef.itemClass === ItemClass.Amulet) {
        Object.keys(amuletStatBoosts).forEach(key => itemDef.baseMods!.stats![key] = amuletStatBoosts[key]);
      }

      if (itemDef.itemClass === ItemClass.Earring) {
        itemDef.baseMods.trait = { name: chosenTrait, level: this.mapMeta.itemProps.traitLevel };
      }
    });

    return this.itemDefBases;
  }

  getMapDroptable(items: IItemDefinition[]): Rollable[] {
    const rollables: Rollable[] = [];
    const potentialItems = items.filter(x => !x.name.includes('Punching'));

    for (let i = 0; i < this.mapMeta.itemProps.mapDropItems; i++) {
      const validItems = potentialItems.filter(x => x.itemClass !== ItemClass.Scroll
                                                 && x.itemClass !== ItemClass.Gem
                                                 && !rollables.map(r => r.result).includes(x.name));
      const item = this.rng.getItem(validItems);

      let maxChance = 50;

      if (item.quality === 3) maxChance = 500;
      if (item.quality === 5) maxChance = 5000;

      rollables.push({ chance: 1, maxChance, result: item.name });
    }

    for (let i = 0; i < 3; i++) {
      const validItems = potentialItems.filter(x => x.itemClass === ItemClass.Gem
                                                 && !rollables.map(r => r.result).includes(x.name));
      const item = this.rng.getItem(validItems);

      rollables.push({ chance: 1, maxChance: 200, result: item.name });
    }

    for (let i = 0; i < 3; i++) {
      const validItems = potentialItems.filter(x => x.itemClass === ItemClass.Scroll
                                                 && !x.binds
                                                 && x.trait?.level === this.mapMeta.itemProps.traitLevel
                                                 && !rollables.map(r => r.result).includes(x.name));
      const item = this.rng.getItem(validItems);

      rollables.push({ chance: 1, maxChance: 200, result: item.name });
    }

    return rollables;
  }
}
