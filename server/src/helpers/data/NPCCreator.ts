
import { Injectable } from 'injection-js';
import uuid from 'uuid/v4';

import { species } from 'fantastical';
import { cloneDeep, isNumber, isString, random, sample } from 'lodash';
import { Parser } from 'muud';

import { Alignment, Allegiance, BehaviorType, Currency, Hostility,
  IAIBehavior, initializeNPC, INPC, INPCDefinition, ItemSlot, LearnedSpell, MonsterClass, Rollable, Skill, Stat } from '../../interfaces';
import * as AllBehaviors from '../../models/world/ai/behaviors';
import { CharacterHelper } from '../character/CharacterHelper';
import { DialogActionHelper } from '../character/DialogActionHelper';
import { ItemHelper } from '../character/ItemHelper';
import { DiceRollerHelper, LootHelper } from '../game/tools';
import { ContentManager } from './ContentManager';
import { ItemCreator } from './ItemCreator';

import * as npcNames from '../../../content/_output/npcnames.json';
import { BaseService } from '../../models/BaseService';

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
  private getNPCDefinition(npcId: string): INPCDefinition {
    return this.content.getNPCDefinition(npcId);
  }

  // actually make a character from an npc id
  public createCharacterFromNPC(npcId: string): INPC & { dialogParser?: Parser } {
    const npc = this.getNPCDefinition(npcId);

    return this.createCharacterFromNPCDefinition(npc);
  }

  // create character from npc def - also useful for greens
  public createCharacterFromNPCDefinition(npcDef: INPCDefinition): INPC & { dialogParser?: Parser } {
    npcDef = cloneDeep(npcDef);

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
    baseChar.drops = npcDef.drops ?? [];
    baseChar.copyDrops = npcDef.copyDrops ?? [];
    baseChar.dropPool = npcDef.dropPool ?? null;
    baseChar.triggers = npcDef.triggers || {};
    baseChar.maxWanderRandomlyDistance = npcDef.maxWanderRandomlyDistance ?? 0;

    this.setLevel(baseChar, npcDef);

    const rightHandItemChoice = this.chooseItem(npcDef.items?.equipment?.rightHand);

    const rightHandItem = rightHandItemChoice ? this.itemHelper.getItemDefinition(rightHandItemChoice) : null;

    // set the right hand if we load one
    if (rightHandItemChoice) {
      baseChar.items.equipment[ItemSlot.RightHand] = this.loadItem(rightHandItemChoice);
    }

    // if we didnt load a right hand, or it's not two handed, or it can shoot
    if (!rightHandItem || rightHandItem && (!rightHandItem.twoHanded || rightHandItem.canShoot)) {
      const potentialLeftHand = this.chooseItem(npcDef.items?.equipment?.leftHand);

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

    if (npcDef.items?.equipment) {
      const equipment = npcDef.items?.equipment ?? {};

      Object.keys(equipment).forEach((slot: string) => {
        if (slot === ItemSlot.LeftHand || slot === ItemSlot.RightHand) return;

        const item = this.chooseItem(equipment[slot]);
        if (!item) return;

        baseChar.items.equipment[slot] = this.loadItem(item);
      });
    }

    if (npcDef.items?.sack) {
      baseChar.items.sack.items = (npcDef.items?.sack ?? [])
        .filter(i => this.shouldLoadContainerItem(i))
        .map(i => this.loadItem(i.result))
        .filter(Boolean);
    }

    if (npcDef.items?.belt) {
      baseChar.items.belt.items = (npcDef.items?.belt ?? [])
        .filter(i => this.shouldLoadContainerItem(i))
        .map(i => this.loadItem(i.result))
        .filter(Boolean);
    }

    baseChar.allegianceReputation = npcDef.allegianceReputation as Record<Allegiance, number>;
    baseChar.stats = npcDef.stats || {};
    baseChar.skills = npcDef.skills || {};
    baseChar.allegianceMods = npcDef.repMod || [];

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
    }

    if (baseChar.skills[Skill.Thievery] === 0) {
      baseChar.skills[Skill.Thievery] = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(Math.floor(baseChar.level / 2));
    }

    if (npcDef.gold) {
      baseChar.currency[Currency.Gold] = random(npcDef.gold.min, npcDef.gold.max);
    }

    if (npcDef.hp) {
      baseChar.hp.maximum = random(npcDef.hp.min, npcDef.hp.max);
      baseChar.stats[Stat.HP] = baseChar.hp.maximum;
    }

    if (npcDef.mp) {
      baseChar.mp.maximum = random(npcDef.mp.min, npcDef.mp.max);
      baseChar.stats[Stat.MP] = baseChar.mp.maximum;
    }

    baseChar.usableSkills = npcDef.usableSkills || [];
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

    const parser = this.createNPCDialogParser(baseChar, npcDef);
    baseChar.dialogParser = parser;

    this.assignNPCBehavior(baseChar, npcDef);

    return baseChar;
  }

  public getNPCName(npc: INPCDefinition): string {

    if (isString(npc.name)) return npc.name as unknown as string;

    // if the npc has a static name
    if (npc.name) {
      if (this.game.diceRollerHelper.XInOneHundred(99)) return npc.name[0];
      return sample(npc.name);
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
      return sample((npcNames as any).default || npcNames);
    }

    return species.human();
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

    npc.level += Math.min(1, Math.floor(npc.level / 10));
    npc.skillOnKill *= 4;
    npc.currency[Currency.Gold] = (npc.currency[Currency.Gold] || 0) * 3;
    npc.giveXp.min *= 4;
    npc.giveXp.max *= 4;
  }

  private setLevel(npc: INPC, npcDef: INPCDefinition): void {
    npc.level = npcDef.level || 1;

    // npcs that are > lv 10 can have their level fuzzed a bit
    if (npc.level > 10) npc.level += random(-2, 2);
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
    return sample(choices);
  }

  private createNPCDialogParser(npc: INPC, npcDef: INPCDefinition): Parser {
    const parser = new Parser();
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

        this.game.directionHelper.setDirRelativeTo(npc, env.player);
        this.game.worldManager.getMap(npc.map).state.triggerNPCUpdateInRadius(npc.x, npc.y);

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
      [BehaviorType.Identifier]: AllBehaviors.IdentifierBehavior
    };

    npcDef.behaviors.forEach(behavior => {
      const initBehavior = behaviorTypes[behavior.type];
      const behaviorInst = new initBehavior();
      behaviorInst.init(this.game, npc, (npc as any).dialogParser, behavior, npcDef.extraProps);

      behaviors.push(behaviorInst);
    });

    npc.behaviors = behaviors;
  }

}
