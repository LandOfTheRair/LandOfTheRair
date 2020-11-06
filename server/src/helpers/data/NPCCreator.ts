
import { Injectable } from 'injection-js';
import uuid from 'uuid/v4';

import { species } from 'fantastical';
import { isNumber, isString, random, sample } from 'lodash';
import { Parser } from 'muud';

import { Alignment, Allegiance, BaseService, CoreStat, Currency, Hostility,
  initializeNPC, INPC, INPCDefinition, ItemSlot, MonsterClass, Rollable } from '../../interfaces';
import { CharacterHelper, ItemHelper } from '../character';
import { DialogActionHelper } from '../character/DialogActionHelper';
import { DiceRollerHelper, LootHelper } from '../game/tools';
import { ContentManager } from './ContentManager';
import { ItemCreator } from './ItemCreator';

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
    const baseChar: INPC & { dialogParser?: Parser } = initializeNPC({});
    baseChar.uuid = uuid();
    baseChar.name = this.getNPCName(npcDef);
    baseChar.npcId = npcDef.npcId;
    baseChar.sprite = this.chooseSpriteFrom(npcDef.sprite);
    baseChar.affiliation = npcDef.affiliation ?? '';
    baseChar.allegiance = npcDef.allegiance ?? Allegiance.Enemy;
    baseChar.alignment = npcDef.alignment ?? Alignment.Evil;
    baseChar.hostility = npcDef.hostility ?? Hostility.OnHit;

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
        .map(i => this.loadItem(this.chooseItem(i)))
        .filter(Boolean);
    }

    if (npcDef.items?.belt) {
      baseChar.items.belt.items = (npcDef.items?.belt ?? [])
        .filter(i => this.shouldLoadContainerItem(i))
        .map(i => this.loadItem(this.chooseItem(i)))
        .filter(Boolean);
    }

    if (npcDef.gold) {
      baseChar.currency[Currency.Gold] = random(npcDef.gold.min, npcDef.gold.max);
    }

    if (npcDef.hp) {
      baseChar.hp.maximum = random(npcDef.hp.min, npcDef.hp.max);
    }

    if (npcDef.mp) {
      baseChar.mp.maximum = random(npcDef.mp.min, npcDef.mp.max);
    }

    baseChar.usableSkills = npcDef.usableSkills || [];
    if (!baseChar.usableSkills.find(s => (s as unknown as string) === 'Charge' || s.result === 'Charge')) {
      baseChar.usableSkills.push({ result: 'Attack', chance: 1 });
    }

    baseChar.usableSkills = baseChar.usableSkills.map((skill: Rollable|string) => {
      if ((skill as Rollable).result) return skill as Rollable;
      return { result: skill as unknown as string, chance: 1 };
    });

    // TODO: check npcDef.baseEffects

    this.characterHelper.calculateStatTotals(baseChar);

    this.characterHelper.healToFull(baseChar);
    this.characterHelper.manaToFull(baseChar);

    const parser = this.createNPCDialogParser(baseChar, npcDef);
    baseChar.dialogParser = parser;

    this.assignNPCBehavior(baseChar, npcDef);

    return baseChar;
  }

  public getNPCName(npc: INPCDefinition): string {
    if (npc.name) return npc.name;

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

    return species.human();
  }

  // elite npcs are random and stronger
  public makeElite(npc: INPC): void {
    npc.name = `elite ${npc.name}`;
    Object.values(CoreStat).forEach(stat => {
      this.game.characterHelper.gainPermanentStat(npc, stat as CoreStat, Math.round((npc.stats?.[stat] ?? 0) / 3));
    });

    npc.level += Math.min(1, Math.floor(npc.level / 10));
    npc.skillOnKill *= 4;
    npc.currency[Currency.Gold] = (npc.currency[Currency.Gold] || 0) * 3;
    npc.giveXp.min *= 4;
    npc.giveXp.max *= 4;
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

      parser.addCommand(keyword)
        .setSyntax([keyword])
        .setLogic(({ env }) => {
          const retMessages: string[] = [];

          for (const action of actions) {
            const { messages, shouldContinue } = this.dialogActionHelper.handleAction(action, npc, env.player);
            retMessages.push(...messages);

            if (!shouldContinue) return retMessages;
          }

          return retMessages;
        });
    });

    return parser;
  }

  private assignNPCBehavior(npc: INPC, npcDef: INPCDefinition): void {
    if (!npcDef.behaviors) return;
  }

}
