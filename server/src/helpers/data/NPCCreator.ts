
import { Injectable } from 'injection-js';
import uuid from 'uuid/v4';

import { species } from 'fantastical';
import { clamp, cloneDeep, isNumber, isString, merge, random, sample, zipObject } from 'lodash';
import { Parser } from 'muud';

import { Alignment, Allegiance, BehaviorType, Currency, Hostility,
  IAIBehavior, initializeNPC, INPC, INPCDefinition, ItemSlot, LearnedSpell, MonsterClass, Rollable, Skill, Stat } from '../../interfaces';
import * as AllBehaviors from '../../models/world/ai/behaviors';
import { CharacterHelper } from '../character/CharacterHelper';
import { DialogActionHelper } from '../character/DialogActionHelper';
import { ItemHelper } from '../character/ItemHelper';
import { DiceRollerHelper, LootHelper } from '../game/tools';

import { BaseService } from '../../models/BaseService';
import { trickOrTreat } from '../../models/world/ai/ai-commands';
import { ItemCreator } from './ItemCreator';
import { ContentManager } from './ContentManager';

// functions related to CREATING an NPC
// not to be confused with NPCHelper which is for HELPER FUNCTIONS that MODIFY NPCs

@Injectable()
export class NPCCreator extends BaseService {

  constructor(
    private characterHelper: CharacterHelper,
    private diceRollerHelper: DiceRollerHelper,
    private lootHelper: LootHelper,
    private itemCreator: ItemCreator,
    private itemHelper: ItemHelper,
    private dialogActionHelper: DialogActionHelper,
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get the real item for base information lookup
  public getNPCDefinition(npcId: string): INPCDefinition {
    return this.content.getNPCDefinition(npcId);
  }

  // actually make a character from an npc id
  public createCharacterFromNPC(npcId: string): INPC & { dialogParser?: Parser } {
    const npc = this.getNPCDefinition(npcId);
    if (!npc) throw new Error(`NPC ${npcId} does not exist and cannot be created.`);

    return this.createCharacterFromNPCDefinition(npc);
  }

  // create character from npc def - also useful for greens
  public createCharacterFromNPCDefinition(npcDef: INPCDefinition): INPC & { dialogParser?: Parser } {
    const baseChar: INPC & { dialogParser?: Parser } = initializeNPC({});
    baseChar.uuid = uuid();
    baseChar.name = this.getNPCName(npcDef);
    baseChar.npcId = npcDef.npcId;
    baseChar.sprite = this.chooseSpriteFrom(npcDef.sprite);
    baseChar.affiliation = npcDef.affiliation ?? '';
    baseChar.allegiance = npcDef.allegiance ?? Allegiance.Enemy;
    baseChar.alignment = npcDef.alignment ?? Alignment.Evil;
    baseChar.hostility = npcDef.hostility ?? Hostility.OnHit;
    baseChar.noCorpseDrop = npcDef.noCorpseDrop ?? false;
    baseChar.noItemDrop = npcDef.noItemDrop ?? false;
    baseChar.drops = cloneDeep(npcDef.drops) ?? [];
    baseChar.copyDrops = npcDef.copyDrops ?? [];
    baseChar.dropPool = npcDef.dropPool ?? undefined;
    baseChar.triggers = npcDef.triggers ?? {};
    baseChar.aquaticOnly = npcDef.aquaticOnly ?? false;
    baseChar.maxWanderRandomlyDistance = npcDef.maxWanderRandomlyDistance ?? 0;
    baseChar.tansFor = npcDef.tansFor ?? '';

    this.setLevel(baseChar, npcDef);

    const items = cloneDeep(npcDef.items || {});

    const rightHandItemChoice = this.chooseItem(items?.equipment?.rightHand);

    const rightHandItem = rightHandItemChoice ? this.itemHelper.getItemDefinition(rightHandItemChoice) : null;

    // set the right hand if we load one
    if (rightHandItemChoice) {
      baseChar.items.equipment[ItemSlot.RightHand] = this.loadItem(rightHandItemChoice);
    }

    // if we didnt load a right hand, or it's not two handed, or it can shoot
    if (!rightHandItem || rightHandItem && (!rightHandItem.twoHanded || rightHandItem.canShoot)) {
      const potentialLeftHand = this.chooseItem(items?.equipment?.leftHand);

      if (potentialLeftHand) {
        const leftHandItem = this.itemHelper.getItemDefinition(potentialLeftHand);

        // check if the left hand is ammo
        if (leftHandItem.shots && rightHandItem && rightHandItem.canShoot) {
          baseChar.items.equipment[ItemSlot.LeftHand] = this.loadItem(potentialLeftHand);

        // check if it can't shoot (ie, is ammo) and we don't have a right hand, or it's not two handed (useful for shields and others)
        } else if (!leftHandItem.shots && (!rightHandItem || (rightHandItem && !rightHandItem.twoHanded))) {
          baseChar.items.equipment[ItemSlot.LeftHand] = this.loadItem(potentialLeftHand);
        }
      }
    }

    if (items?.equipment) {
      const equipment = items?.equipment ?? {};

      Object.keys(equipment).forEach((slot: string) => {
        if (slot === ItemSlot.LeftHand || slot === ItemSlot.RightHand) return;

        const item = this.chooseItem(equipment[slot]);
        if (!item) return;

        baseChar.items.equipment[slot] = this.loadItem(item);
      });
    }

    if (items?.sack) {
      baseChar.items.sack.items = (items?.sack ?? [])
        .filter(i => this.shouldLoadContainerItem(i))
        .map(i => this.loadItem(i.result))
        .filter(Boolean);
    }

    if (items?.belt) {
      baseChar.items.belt.items = (items?.belt ?? [])
        .filter(i => this.shouldLoadContainerItem(i))
        .map(i => this.loadItem(i.result))
        .filter(Boolean);
    }

    baseChar.allegianceReputation = npcDef.allegianceReputation as Record<Allegiance, number>;
    baseChar.stats = { ...npcDef.stats || {} };
    baseChar.skills = { ...npcDef.skills || {} };
    baseChar.allegianceMods = [...npcDef.repMod || []];
    baseChar.monsterClass = npcDef.monsterClass;
    baseChar.monsterGroup = npcDef.monsterGroup;
    baseChar.giveXp = { ...npcDef.giveXp || { min: 1, max: 100 } };
    baseChar.skillOnKill = npcDef.skillOnKill;

    // set base from global if needed (stats)
    if (baseChar.stats[Stat.STR] === 0) {
      const setStats: Stat[] = [
        Stat.STR, Stat.AGI, Stat.DEX,
        Stat.INT, Stat.WIS, Stat.WIL,
        Stat.CON, Stat.CHA, Stat.LUK
      ];

      setStats.forEach(stat => {
        const globalSetStat = this.content.challengeData.global.stats.allStats[baseChar.level];
        baseChar.stats[stat] = globalSetStat;
      });
    }

    // set base from global if needed (skills)
    // martial is set to 1 (or the correct number) if any skills are set
    if (baseChar.skills[Skill.Martial] === 0) {
      Object.values(Skill).forEach(skill => {
        const globalSetSkill = this.content.challengeData.global.stats.allSkills[baseChar.level];
        baseChar.skills[skill] = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(globalSetSkill);
      });
    }

    // otherStats is a straight override
    Object.keys(npcDef.otherStats || {}).forEach(stat => {
      baseChar.stats[stat] = npcDef.otherStats?.[stat] ?? 0;
    });

    if (baseChar.hostility === Hostility.Never) {
      const statSet = Math.max(5, (baseChar.level || 1) / 3);

      const buffStats: Stat[] = [
        Stat.STR, Stat.AGI, Stat.DEX,
        Stat.INT, Stat.WIS, Stat.WIL,
        Stat.CON, Stat.CHA, Stat.LUK
      ];

      buffStats.forEach(stat => {
        this.game.characterHelper.gainPermanentStat(baseChar, stat as Stat, statSet);
      });

      Object.values(Skill).forEach(skill => {
        baseChar.skills[skill] = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(statSet);
      });

      baseChar.monsterClass ??= MonsterClass.Humanoid;
    }

    const challengeRating = clamp(npcDef.cr ?? 0, -10, 10);
    const crLevel = clamp(baseChar.level, 1, this.game.configManager.MAX_LEVEL);

    const globalCRDF = this.game.contentManager.challengeData.global.cr[challengeRating]?.damageFactor ?? 1;
    const globalLvlDF = this.game.contentManager.challengeData.global.stats.damageFactor[crLevel] ?? 1;
    baseChar.stats[Stat.DamageFactor] = globalCRDF * globalLvlDF;

    if (baseChar.skills[Skill.Thievery] === 0) {
      baseChar.skills[Skill.Thievery] = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(Math.floor(baseChar.level / 2));
    }

    if (npcDef.giveXp) {
      if (npcDef.giveXp.min === -1 || npcDef.giveXp.max === -1) {
        const { min: lvlMin, max: lvlMax } = this.game.contentManager.challengeData.global.stats.giveXp[crLevel];
        baseChar.giveXp.min = lvlMin;
        baseChar.giveXp.max = lvlMax;
      }
    }

    if (npcDef.gold) {
      let { min, max } = npcDef.gold;

      if (npcDef.gold.min === -1 || npcDef.gold.max === -1) {
        const { min: lvlMin, max: lvlMax } = this.game.contentManager.challengeData.global.stats.gold[crLevel];
        min = lvlMin;
        max = lvlMax;
      }

      baseChar.currency[Currency.Gold] = random(min, max);
    }

    if (npcDef.hp) {
      let { min, max } = npcDef.hp;

      // build based on the level
      if (npcDef.hp.min === -1 || npcDef.hp.max === -1) {
        const { min: lvlMin, max: lvlMax } = this.game.contentManager.challengeData.global.stats.hp[crLevel];
        min = lvlMin;
        max = lvlMax;
      }

      baseChar.hp.maximum = random(min, max);
      baseChar.stats[Stat.HP] = baseChar.hp.maximum;
    }

    if (npcDef.mp) {
      baseChar.mp.maximum = random(npcDef.mp.min, npcDef.mp.max);
      baseChar.stats[Stat.MP] = baseChar.mp.maximum;
    }

    baseChar.usableSkills = cloneDeep(npcDef.usableSkills || []);
    if (!baseChar.usableSkills.find(s => (s as unknown as string) === 'Charge' || s.result === 'Charge')) {
      baseChar.usableSkills.push({ result: 'Attack', chance: 1 });
    }

    baseChar.usableSkills = baseChar.usableSkills.map((skill: Rollable|string) => {
      if ((skill as Rollable).result) return skill as Rollable;
      return { result: skill as unknown as string, chance: 1 };
    });

    // learn all spells so they can be cast
    baseChar.usableSkills.forEach(({ result }) => {
      baseChar.learnedSpells[result.toLowerCase()] = LearnedSpell.FromTraits;
    });

    baseChar.traitLevels = npcDef.traitLevels || {};

    // green npcs never drop items
    if (baseChar.hostility === Hostility.Never) baseChar.traitLevels.DeathGrip = 10;

    (npcDef.baseEffects || []).forEach(effect => {
      const effectData = {
        extra: effect.extra,
        duration: effect.endsAt
      };

      this.game.effectHelper.addEffect(baseChar, '', effect.name, { effect: effectData });
    });

    this.characterHelper.recalculateEverything(baseChar);

    this.characterHelper.healToFull(baseChar);
    this.characterHelper.manaToFull(baseChar);

    if (baseChar.allegiance !== Allegiance.NaturalResource) {
      const parser = this.createNPCDialogParser(baseChar, npcDef);
      baseChar.dialogParser = parser;
    }

    this.assignNPCBehavior(baseChar, npcDef);

    this.attemptCreatingPotions(baseChar);

    return baseChar;
  }

  // attempt to give the NPC potions to heal themselves with
  private attemptCreatingPotions(npc: INPC) {
    if (npc.monsterClass !== MonsterClass.Humanoid) return;

    let potentialMaxPotions = 0;
    if (npc.level > 25) potentialMaxPotions++;
    if (npc.level > 40) potentialMaxPotions++;

    const numPotions = random(0, potentialMaxPotions);

    for (let i = 0; i < numPotions; i++) {
      const potion = this.game.itemCreator.getSimpleItem('Instant Heal Bottle');
      this.game.inventoryHelper.addItemToSack(npc, potion);
    }
  }

  public getNPCName(npc: INPCDefinition): string {

    if (isString(npc.name)) return npc.name as unknown as string;

    // if the npc has a static name
    if (npc.name) {
      if (this.game.diceRollerHelper.XInOneHundred(99)) return npc.name[0];
      return sample(npc.name) ?? 'unknown';
    }

    switch (npc.monsterClass) {
    case MonsterClass.Dragon:    return species.dragon();
    case MonsterClass.Beast:     return species.ogre();
    case MonsterClass.Undead:    return species.human();
    }

    switch (npc.allegiance) {
    case Allegiance.Pirates:     return species.dwarf();
    case Allegiance.Royalty:     return species.highelf();
    case Allegiance.Townsfolk:   return species.human();
    case Allegiance.Underground: return species.cavePerson();
    case Allegiance.Wilderness:  return species.fairy();
    case Allegiance.Adventurers: return species.gnome();
    }

    if (this.game.diceRollerHelper.XInOneHundred(1)) {
      return sample(this.game.contentManager.npcNamesData) as string;
    }

    return species.human();
  }

  // attributes buff npcs in random ways
  public addAttribute(npc: INPC): void {
    const { attribute, stats, effects } = sample(this.game.contentManager.attributeStatsData) as any;
    npc.name = `${attribute} ${npc.name}`;

    const attrMult = this.game.contentManager.getGameSetting('npcgen', 'attrMult') ?? 2;

    npc.level += attrMult;
    npc.skillOnKill *= attrMult;
    npc.giveXp.min *= attrMult;
    npc.giveXp.max *= attrMult;

    stats.forEach(({ stat, boost }) => {
      this.game.characterHelper.gainPermanentStat(npc, stat as Stat, boost);
    });

    effects.forEach(effect => {
      const effectData = {
        extra: effect.extra || {},
        duration: -1
      };

      this.game.effectHelper.addEffect(npc, '', effect.name, { effect: effectData });
    });
  }

  // elite npcs are random and stronger
  public makeElite(npc: INPC): void {
    npc.name = `elite ${npc.name}`;

    const buffStats: Stat[] = [
      Stat.STR, Stat.AGI, Stat.DEX,
      Stat.INT, Stat.WIS, Stat.WIL,
      Stat.CON, Stat.CHA, Stat.LUK,
      Stat.HP, Stat.MP,
      Stat.HPRegen, Stat.MPRegen
    ];

    buffStats.forEach(stat => {
      this.game.characterHelper.gainPermanentStat(npc, stat as Stat, Math.round(this.game.characterHelper.getBaseStat(npc, stat) / 3));
    });

    const eliteLevelBonusDivisor = this.game.contentManager.getGameSetting('npcgen', 'eliteLevelBonusDivisor') ?? 10;
    const eliteMult = this.game.contentManager.getGameSetting('npcgen', 'eliteMult') ?? 4;

    npc.level += Math.min(1, Math.floor(npc.level / eliteLevelBonusDivisor));
    npc.skillOnKill *= eliteMult;
    npc.currency[Currency.Gold] = (npc.currency[Currency.Gold] || 0) * eliteMult;
    npc.giveXp.min *= eliteMult;
    npc.giveXp.max *= eliteMult;
  }

  private setLevel(npc: INPC, npcDef: INPCDefinition): void {
    npc.level = npcDef.level || 1;

    const levelFuzzMinLevel = this.game.contentManager.getGameSetting('npcgen', 'levelFuzzMinLevel') ?? 10;
    const levelFuzz = this.game.contentManager.getGameSetting('npcgen', 'levelFuzz') ?? 2;

    // npcs that are > lv 10 can have their level fuzzed a bit
    if (npc.level > levelFuzzMinLevel) npc.level += random(-levelFuzz, levelFuzz);
  }

  private shouldLoadContainerItem(itemName: string|any): boolean {
    if (isString(itemName)) return true;

    if (itemName.chance && itemName.name) {
      if (itemName.chance < 0) return true;

      if (this.diceRollerHelper.XInOneHundred(itemName.chance)) return true;
    }

    return true;
  }

  private chooseItem(choices?: string|string[]|any[]|Rollable[]|Rollable): string {
    if (!choices) return '';
    if (isString(choices)) return choices as string;

    const chosenItem = this.lootHelper.chooseWithReplacement(choices as string[]|any[], 1);
    if (chosenItem && chosenItem[0] && chosenItem[0] !== 'none') return chosenItem[0] as string;

    return '';
  }

  private loadItem(itemName: string) {
    return this.itemCreator.getSimpleItem(itemName);
  }

  private chooseSpriteFrom(choices: number|number[]) {
    if (isNumber(choices)) return choices;
    if (!choices || !(choices as number[]).length) return 0;
    return sample(choices) ?? 0;
  }

  private createNPCDialogParser(npc: INPC, npcDef: INPCDefinition): Parser {
    const parser = new Parser();

    trickOrTreat(this.game, npc, parser);

    if (!npcDef.dialog) return parser;

    Object.keys(npcDef.dialog.keyword || {}).forEach(keyword => {
      const actions = npcDef.dialog?.keyword[keyword].actions ?? [];

      const logicCallback: any = ({ env }) => {
        if (!env || !env.player) return;

        const retMessages: string[] = [];

        for (const action of actions) {
          const { messages, shouldContinue } = this.dialogActionHelper.handleAction(action, npc, env.player);
          retMessages.push(...messages);

          if (!shouldContinue) return retMessages;
        }

        this.game.movementHelper.faceTowards(npc, env.player);
        this.game.worldManager.getMap(npc.map)?.state.triggerNPCUpdateInRadius(npc.x, npc.y);

        return retMessages;
      };

      parser.addCommand(keyword)
        .setSyntax([keyword])
        .setLogic(logicCallback);
    });

    return parser;
  }

  private assignNPCBehavior(npc: INPC, npcDef: INPCDefinition): void {
    if (!npcDef.behaviors) return;

    const behaviors: IAIBehavior[] = [];

    const behaviorTypes: Record<BehaviorType, any> = {
      [BehaviorType.Crier]: AllBehaviors.CrierBehavior,
      [BehaviorType.Trainer]: AllBehaviors.TrainerBehavior,
      [BehaviorType.Vendor]: AllBehaviors.VendorBehavior,
      [BehaviorType.Peddler]: AllBehaviors.PeddlerBehavior,
      [BehaviorType.Identifier]: AllBehaviors.IdentifierBehavior,
      [BehaviorType.Tanner]: AllBehaviors.TannerBehavior,
      [BehaviorType.Culinarian]: AllBehaviors.CulinarianBehavior,
      [BehaviorType.Alchemist]: AllBehaviors.AlchemistBehavior,
      [BehaviorType.Banker]: AllBehaviors.BankerBehavior,
      [BehaviorType.Encruster]: AllBehaviors.EncrusterBehavior,
      [BehaviorType.Smith]: AllBehaviors.SmithBehavior,
      [BehaviorType.Magician]: AllBehaviors.MagicianBehavior,
      [BehaviorType.Steelrose]: AllBehaviors.SteelroseBehavior,
      [BehaviorType.Succorer]: AllBehaviors.SuccorerBehavior,
      [BehaviorType.Upgrader]: AllBehaviors.UpgraderBehavior,
      [BehaviorType.HallOfHeroes]: AllBehaviors.HallOfHeroesBehavior,
      [BehaviorType.HPDoc]: AllBehaviors.HPDocBehavior,
      [BehaviorType.MPDoc]: AllBehaviors.MPDocBehavior,
      [BehaviorType.Binder]: AllBehaviors.BinderBehavior,
      [BehaviorType.ItemModder]: AllBehaviors.ItemModderBehavior,
      [BehaviorType.Cosmetic]: AllBehaviors.CosmeticBehavior,
      [BehaviorType.Buffer]: AllBehaviors.BufferBehavior,
      [BehaviorType.Resetter]: AllBehaviors.ResetterBehavior,
      [BehaviorType.AXPSwapper]: AllBehaviors.AXPSwapperBehavior,
      [BehaviorType.FurUpgrader]: AllBehaviors.FurUpgraderBehavior,
      [BehaviorType.ExitWarper]: AllBehaviors.ExitWarperBehavior,
      [BehaviorType.SpoilerLogger]: AllBehaviors.SpoilerLoggerBehavior,
      [BehaviorType.RNGArtificer]: AllBehaviors.RNGArtificerBehavior,
      [BehaviorType.TreasureClaimer]: AllBehaviors.TreasureClaimerBehavior,
      [BehaviorType.HalloweenCandy]: AllBehaviors.HalloweenCandyBehavior,
      [BehaviorType.ThanksgivingFood]: AllBehaviors.ThanksgivingFoodBehavior,
      [BehaviorType.ThanksgivingGuns]: AllBehaviors.ThanksgivingGunsBehavior,
      [BehaviorType.ThanksgivingTurkey]: AllBehaviors.ThanksgivingTurkeyBehavior,
      [BehaviorType.ChristmasSanta]: AllBehaviors.ChristmasSantaBehavior,
    };

    npcDef.behaviors.forEach(behavior => {
      behavior = cloneDeep(behavior);

      const initBehavior = behaviorTypes[behavior.type];
      if (!initBehavior) {
        throw new Error(`Could not find npc behavior type ${behavior.type}`);
      }
      const behaviorInst: IAIBehavior = new initBehavior();

      if (behavior.props) {
        const propsObj = zipObject(behavior.props, behavior.props.map(x => npcDef.extraProps[x]));

        merge(behavior, propsObj);
      }

      behaviorInst.init(this.game, npc, (npc as any).dialogParser, behavior);

      behaviors.push(behaviorInst);
    });

    npc.behaviors = behaviors;
  }

}
