
import { Rollable } from 'lootastic';
import { RNG } from 'rot-js/dist/rot';
import { Allegiance, BaseClass, calculateSkillXPRequiredForLevel, Hostility,
  IItemDefinition,
  INPCDefinition, IRNGDungeonConfig, IRNGDungeonCreature, IRNGDungeonMetaConfig,
  ItemClass, ItemSlot, MonsterClass, Skill, Stat } from '../../../interfaces';

export class RNGDungeonNPCGenerator {

  constructor(
    private readonly rng: RNG,
    private readonly mapMeta: IRNGDungeonMetaConfig,
    private readonly config: IRNGDungeonConfig,
    private readonly addSpoilerLog: (message: string) => void,
    private items: IItemDefinition[]
  ) {}

  // pick valid creature sets for this map
  pickCreatureSets(): string[] {
    const scenario = this.rng.getItem(this.config.scenarioConfigs);
    const { creatureSets, name } = scenario;

    this.addSpoilerLog(`Monster Scenario is "${name}".`);

    const pickedCreatureSets: string[] = [];
    creatureSets.forEach(({ options }) => {
      const validSets = options.filter(x => !pickedCreatureSets.includes(x.creatures.name));
      const picked = this.rng.getItem(validSets);

      if (!picked) return;

      pickedCreatureSets.push(picked.creatures.name);
    });

    return pickedCreatureSets;
  }

  // build an npc definition from a creature definition
  getNPCDefFromCreatureDef(def: IRNGDungeonCreature, { faction, monsterGroup, isLegendary }): INPCDefinition {

    let level = this.mapMeta.creatureProps.level ?? 4;
    if (def.isLegendary) level = this.mapMeta.creatureProps.legendaryLevel ?? 5;

    const npc: Partial<INPCDefinition> = {
      npcId: `${this.mapMeta.name} ${def.name}`,
      sprite: def.sprite,
      name: [def.name],
      allegiance: faction,
      baseClass: def.baseClass || BaseClass.Traveller,
      monsterGroup,
      items: {
        equipment: {
          [ItemSlot.Hands]: [{ result: this.mapMeta.itemProps.npcPunchItem, chance: 1 }]
        }
      },
      level,
      hostility: faction === Allegiance.Enemy ? Hostility.Always : Hostility.Faction,
      hp: { min: 100, max: 100 },
      mp: { min: 0, max: 0 },
      gold: { min: 100, max: 100 },
      giveXp: { min: 100, max: 100 },
      repMod: [],
      skillOnKill: 1,
      skills: {},
      stats: {},
      traitLevels: {},
      usableSkills: [] as Rollable[],
      baseEffects: [],
      copyDrops: [
        { result: 'equipment.armor',      chance: -1 },
        { result: 'equipment.leftHand',   chance: -1 },
        { result: 'equipment.rightHand',  chance: -1 },
        { result: 'equipment.robe1',      chance: -1 },
      ]
    };

    const isTannable = def.monsterClass && [MonsterClass.Beast, MonsterClass.Dragon].includes(def.monsterClass);

    // give them their hard-earned items or whatever
    if (npc.items?.equipment) {
      if (def.armorType) {
        npc.items.equipment[ItemSlot.Armor] = [
          { result: `${this.mapMeta.name} Basic ${def.armorType}`,        chance: this.mapMeta.itemProps.basicWeight },
          { result: `${this.mapMeta.name} Powerful ${def.armorType}`,     chance: this.mapMeta.itemProps.powerfulWeight },
          { result: `${this.mapMeta.name} Legendary ${def.armorType}`,    chance: this.mapMeta.itemProps.legendaryWeight }
        ];
      }

      if (def.weaponType) {
        npc.items.equipment[ItemSlot.RightHand] = [
          { result: `${this.mapMeta.name} Basic ${def.weaponType}`,       chance: this.mapMeta.itemProps.basicWeight },
          { result: `${this.mapMeta.name} Powerful ${def.weaponType}`,    chance: this.mapMeta.itemProps.powerfulWeight },
          { result: `${this.mapMeta.name} Legendary ${def.weaponType}`,   chance: this.mapMeta.itemProps.legendaryWeight }
        ];
      }

      if (def.offhandType) {
        npc.items.equipment[ItemSlot.LeftHand] = [
          { result: `${this.mapMeta.name} Basic ${def.offhandType}`,      chance: this.mapMeta.itemProps.basicWeight },
          { result: `${this.mapMeta.name} Powerful ${def.offhandType}`,   chance: this.mapMeta.itemProps.powerfulWeight },
          { result: `${this.mapMeta.name} Legendary ${def.offhandType}`,  chance: this.mapMeta.itemProps.legendaryWeight }
        ];
      }

      // if not beast/dragon, add cloak
      if (!isTannable && def.armorType) {
        npc.items.equipment[ItemSlot.Robe1] = [
          { result: 'none',                                   chance: this.mapMeta.itemProps.basicWeight },
          { result: `${this.mapMeta.name} Basic Cloak`,       chance: this.mapMeta.itemProps.basicWeight },
          { result: `${this.mapMeta.name} Powerful Cloak`,    chance: this.mapMeta.itemProps.powerfulWeight },
          { result: `${this.mapMeta.name} Legendary Cloak`,   chance: this.mapMeta.itemProps.legendaryWeight },
          { result: `${this.mapMeta.name} Basic Robe`,        chance: this.mapMeta.itemProps.basicWeight },
          { result: `${this.mapMeta.name} Powerful Robe`,     chance: this.mapMeta.itemProps.powerfulWeight },
          { result: `${this.mapMeta.name} Legendary Robe`,    chance: this.mapMeta.itemProps.legendaryWeight }
        ];
      }
    }

    if (isLegendary) {
      npc.dropPool = {
        choose: {
          min: 1,
          max: 1
        },
        items: this.items
          .filter(x => x.itemClass !== ItemClass.Scroll
                    && x.name.includes('Legendary'))
          .map(x => ({ result: x.name, chance: 1 }))
      };
    }

    if (def.monsterClass) {
      if (isTannable) {
        npc.tanSkillRequired = this.mapMeta.itemProps.tanSkillRequired;
      }

      npc.monsterClass = def.monsterClass;
      npc.baseEffects = this.config.creatureAttributes[def.monsterClass].map(x => ({ ...x, endsAt: -1 })) || [];
    }

    // set stats
    [Stat.STR, Stat.AGI, Stat.DEX, Stat.INT, Stat.WIS, Stat.WIL, Stat.CON, Stat.CHA, Stat.LUK].forEach(stat => {
      npc.stats![stat] = def.isLegendary ? this.mapMeta.creatureProps.legendaryBaseStat : this.mapMeta.creatureProps.baseStat;
    });

    // set skills
    Object.keys(Skill).forEach(skill => {
      const skillLevel = def.isLegendary ? this.mapMeta.creatureProps.legendaryBaseSkill : this.mapMeta.creatureProps.baseSkill;
      npc.skills![skill] = calculateSkillXPRequiredForLevel(skillLevel);
    });

    // set other calculable properties
    npc.skillOnKill = Math.floor(1.5 * (level ?? 20));

    if (npc.hp) {
      npc.hp.max = npc.hp.min = Math.max(
        10000,
        Math.floor((8000 * level) - 100000)
      ) * (def.isLegendary ? 20 : 1);
    }

    if (npc.mp && def.baseClass && [BaseClass.Healer, BaseClass.Mage].includes(def.baseClass)) {
      npc.mp.max = npc.mp.min = Math.max(
        10000,
        Math.floor((8000 * level) - 100000)
      ) * (def.isLegendary ? 20 : 1);
    }

    if (npc.giveXp) {
      npc.giveXp.max = Math.max(
        1000,
        Math.floor((3200 * level) - 22000)
      ) * (def.isLegendary ? 10 : 1);

      npc.giveXp.min = Math.floor(npc.giveXp.max * 0.75);
    }

    if (npc.gold) {
      npc.gold.max = 700 * level * (def.isLegendary ? 25 : 1);
      npc.gold.min = Math.floor(npc.gold.max * 0.75);
    }

    // further post-processing
    Object.keys(def.statChanges || {}).forEach(statChange => {
      if (!def.statChanges?.[statChange]) return;

      npc.stats![statChange] = npc.stats![statChange] || 0;
      npc.stats![statChange] += def.statChanges[statChange] * this.mapMeta.creatureProps.statScale;
    });

    // add skills
    const potentialSkills = ['Attack', 'Charge'];
    if (def.guaranteedSkills) potentialSkills.push(...def.guaranteedSkills);

    if (npc.baseClass && npc.baseClass !== BaseClass.Traveller) {

      // always choose an important one where possible (base skills)
      const importantChoices = this.config.creatureSkills[npc.baseClass].filter(x => !potentialSkills.includes(x.name) && x.importantSpell);

      if (importantChoices.length > 0) {
        const spell = this.rng.getItem(importantChoices);
        potentialSkills.push(spell.name);

        if (spell.grants) potentialSkills.push(spell.grants);
      }

      // choose extra skills
      for (let i = 0; i < this.mapMeta.creatureProps.bonusCreatureSkillChoices; i++) {
        const validSkills = this.config.creatureSkills[npc.baseClass].filter(x => !potentialSkills.includes(x.name));

        if (validSkills.length === 0) continue;

        const spell = this.rng.getItem(validSkills);
        potentialSkills.push(spell.name);

        if (spell.grants) potentialSkills.push(spell.grants);
      }
    }

    npc.usableSkills = potentialSkills.map(skill => ({ chance: 1, result: skill }));

    // add traits
    if (npc.traitLevels) {
      def.guaranteedTraits?.forEach(trait => {
        npc.traitLevels![trait] = 1;
      });

      if (npc.baseClass && npc.baseClass !== BaseClass.Traveller) {
        const bonusTraits: string[] = [];

        for (let i = 0; i < this.mapMeta.creatureProps.bonusCreatureTraitChoices; i++) {
          const validTraits = this.config.creatureTraits[npc.baseClass].filter(x => !bonusTraits.includes(x.name));

          if (validTraits.length === 0) continue;

          const trait = this.rng.getItem(validTraits);
          bonusTraits.push(trait.name);

          npc.traitLevels[trait.name] = 1;
        }
      }
    }

    // add faction rep (simply, every faction hates everything they are not)
    [
      Allegiance.Enemy, Allegiance.Adventurers,
      Allegiance.Pirates, Allegiance.Royalty,
      Allegiance.Townsfolk, Allegiance.Underground,
      Allegiance.Wilderness
    ].forEach(allegiance => {
      if (allegiance === faction) return;

      npc.allegianceReputation = npc.allegianceReputation || {};
      npc.allegianceReputation[allegiance] = -500;
    });

    return npc as INPCDefinition;
  }

  // get NPC definitions for this map
  getCreatures(): INPCDefinition[][] {
    const creatureSets = this.pickCreatureSets();

    const res = creatureSets.map(setName => {
      const { creatures, factions } = this.config.creatureGroupings[setName];
      const faction = this.rng.getItem(factions);

      const legendaryCreature = this.rng.getItem(creatures.filter(x => x.isLegendary));
      const chosenCreatures = legendaryCreature ? [legendaryCreature.name] : [];

      for (let i = 0; i < this.mapMeta.creatureProps.creaturesPerSet; i++) {
        const validCreatures = creatures.filter(x => !chosenCreatures.includes(x.name));
        const picked = this.rng.getItem(validCreatures);
        chosenCreatures.push(picked.name);
      }

      const creatureDefs = chosenCreatures.map(creatureName => {
        if (!this.config.creatures[creatureName]) {
          console.error(new Error(`Creature ${creatureName} does not have a valid creature entry.`));
          return null;
        }

        const npcDef = this.getNPCDefFromCreatureDef(this.config.creatures[creatureName], {
          faction,
          isLegendary: this.config.creatures[creatureName].isLegendary,
          monsterGroup: setName
        });

        return npcDef;
      }).filter(Boolean);

      return creatureDefs;

    });

    return res as INPCDefinition[][];
  }
}
