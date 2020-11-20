
import { Injectable } from 'injection-js';
import { clamp } from 'lodash';

import { BaseService, EquipHash, GivesBonusInHandItemClasses, Hostility,
  ICharacter, INPC, IPlayer, ISimpleItem, ItemClass, ItemSlot, Skill, Stat } from '../../interfaces';

@Injectable()
export class CharacterHelper extends BaseService {

  public init() {}

  // check if the character is dead
  public isDead(char: ICharacter): boolean {
    return char.hp.current <= 0 || this.game.effectHelper.hasEffect(char, 'Dead');
  }

  public healToFull(char: ICharacter): void {
    this.heal(char, char.hp.maximum);
  }

  public manaToFull(char: ICharacter): void {
    this.mana(char, char.mp.maximum);
  }

  public damage(char: ICharacter, hp: number): void {
    this.heal(char, -hp);
  }

  public heal(char: ICharacter, hp: number): void {
    char.hp.current = clamp(char.hp.current + hp, char.hp.minimum, char.hp.maximum);
    if (isNaN(char.hp.current)) char.hp.current = 1;
  }

  public manaDamage(char: ICharacter, hp: number): void {
    this.mana(char, -hp);
  }

  public mana(char: ICharacter, mp: number): void {
    char.mp.current = clamp(char.mp.current + mp, char.mp.minimum, char.mp.maximum);
    if (isNaN(char.mp.current)) char.mp.current = 0;
  }

  // check if this player is holding sometihng
  public hasHeldItem(char: ICharacter, item: string, hand: 'left'|'right' = 'right'): boolean {
    const ref = char.items.equipment[`${hand}Hand`];
    return (ref && ref.name === item && ref.mods.owner === (char as IPlayer).username);
  }

  public hasHeldItems(char: ICharacter, item1: string, item2: string): boolean {
    return (this.hasHeldItem(char, item1, 'right') && this.hasHeldItem(char, item2, 'left'))
        || (this.hasHeldItem(char, item2, 'right') && this.hasHeldItem(char, item1, 'left'));
  }

  public setEquipmentSlot(char: ICharacter, slot: ItemSlot, item: ISimpleItem | undefined): void {
    const oldItem = char.items.equipment[slot];

    if (oldItem) {
      const wearEffect = this.game.itemHelper.getItemProperty(oldItem, 'equipEffect');
      if (wearEffect) {
        this.game.effectHelper.removeEffectByName(char, wearEffect.name);
      }
    }

    char.items.equipment[slot] = item;

    if (item) {
      const { binds, desc, tellsBind, itemClass, owner, equipEffect } = this.game.itemHelper.getItemProperties(item, ['binds', 'tellsBind', 'itemClass', 'owner', 'desc', 'equipEffect']);
      if (itemClass === ItemClass.Corpse) return;

      if (equipEffect) {
        this.tryToCastEquipmentEffects(char);
      }

      if (binds && (char as IPlayer).username && !owner) {
        this.game.itemHelper.setItemProperty(item, 'owner', (char as IPlayer).username);
        this.game.messageHelper.sendLogMessageToPlayer(char, { message: `The ${itemClass.toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.` });

        if (tellsBind) {
          this.game.messageHelper.sendLogMessageToRadius(char, 4, { message: `*** ${char.name} has looted ${desc}.` });
        }
      }
    }
  }

  public dropHands(char: ICharacter): void {
    const { state } = this.game.worldManager.getMap(char.map);

    if (char.items.equipment[ItemSlot.RightHand]) {
      state.addItemToGround(char.x, char.y, char.items.equipment[ItemSlot.RightHand] as ISimpleItem);
      this.setRightHand(char, undefined);
    }

    if (char.items.equipment[ItemSlot.LeftHand]) {
      state.addItemToGround(char.x, char.y, char.items.equipment[ItemSlot.LeftHand] as ISimpleItem);
      this.setRightHand(char, undefined);
    }
  }

  public setRightHand(char: ICharacter, item: ISimpleItem | undefined) {
    this.setEquipmentSlot(char, ItemSlot.RightHand, item);
  }

  public setLeftHand(char: ICharacter, item: ISimpleItem | undefined) {
    this.setEquipmentSlot(char, ItemSlot.LeftHand, item);
  }

  public addAgro(char: ICharacter, target: ICharacter, amount: number) {
    char.agro[target.uuid] = (char.agro[target.uuid] || 0) + amount;
    target.agro[char.uuid] = (target.agro[char.uuid] || 0) + amount;

    if (char.agro[target.uuid] <= 0) {
      delete char.agro[target.uuid];
    }
    if (target.agro[char.uuid] <= 0) {
      delete target.agro[char.uuid];
    }

  }

  public clearAgro(char: ICharacter, target: ICharacter) {
    delete char.agro[target.uuid];
  }

  public engageInCombat(char: ICharacter) {
    char.combatTicks = 10;
  }

  // check if a character is a player
  public isPlayer(character: ICharacter): boolean {
    return !!(character as IPlayer).username;
  }

  // check if we can gain skill from this target
  public canGainSkillFromTarget(target: ICharacter): boolean {
    if (!target) return false;
    if ((target as INPC).hostility === Hostility.Never) return false;
    if ((target as INPC).owner === Hostility.Never) return false;
    return true;
  }

  // gain a permanent stat (from a bottle, or some other source)
  public gainPermanentStat(character: ICharacter, stat: Stat, value = 1): boolean {

    // hp/mp always go up with no limit
    if (stat === Stat.HP || stat === Stat.MP) {
      character.stats[stat] = (character.stats[stat] ?? 1) + value;
      return true;
    }

    const curStat = character.stats[stat] ?? 1;

    const hardBaseCap = this.game.configManager.MAX_STATS;

    // cannot exceed the hard cap
    if (curStat + value > hardBaseCap) return false;

    // but if we're under it, we boost
    character.stats[stat] = (character.stats[stat] ?? 1) + value;
    return true;

  }

  // lose a permanent stat (from any reason)
  public losePermanentStat(character: ICharacter, stat: Stat, value = 1): boolean {

    const curStat = character.stats[stat] ?? 1;

    // cannot cannot go lower than 1
    if (curStat - value < 1) return false;

    // lose the stat if we can
    character.stats[stat] = (character.stats[stat] ?? 1) - value;

    return true;

  }

  // calculate the total stats for a character from their current loadout
  public calculateStatTotals(character: ICharacter): void {
    character.totalStats = Object.assign({}, character.stats);

    const addStat = (stat: Stat, bonus: number) => {
      character.totalStats[stat] = character.totalStats[stat] || 0;
      character.totalStats[stat]! += bonus;
    };

    // calculate stats from gear
    Object.keys(character.items.equipment).forEach(itemSlot => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // no bonus if we can't technically use the item
      if (this.isPlayer(character) && !this.game.itemHelper.canGetBenefitsFromItem(character as IPlayer, item)) return;

      // only some items give bonuses in hands
      const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');
      if ([ItemSlot.RightHand, ItemSlot.LeftHand].includes(itemSlot as ItemSlot)
      && !GivesBonusInHandItemClasses.includes(itemClass)) return;

      Object.values(Stat).forEach(stat => {
        const bonus = this.game.itemHelper.getStat(item, stat);
        addStat(stat, bonus);
      });
    });

    // set hp/mp
    if (character.totalStats.hp) {
      character.hp.maximum = character.totalStats.hp;
      character.hp.current = Math.min(character.hp.current, character.hp.maximum);
    }

    if (character.totalStats.mp) {
      character.mp.maximum = character.totalStats.mp;
      character.mp.current = Math.min(character.mp.current, character.mp.maximum);
    }

    // can't move more than one screen at a time
    character.totalStats[Stat.Move] = clamp(character.stats[Stat.Move] || 3, 0, 4);

    const statBoosts = this.game.effectHelper.effectStatBonuses(character);
    Object.keys(statBoosts).forEach(stat => {
      character.totalStats[stat] = character.totalStats[stat] || 0;
      character.totalStats[stat] += statBoosts[stat];
    });

    // TODO: adjust stealth / perception
    // TODO: trait bonuses
    // TODO: adjust pet stats
  }

  // get a specific stat value from a character
  public getStat(character: ICharacter, stat: Stat): number {
    return character.totalStats[stat] ?? 0;
  }

  // get a specific base stat value from a character
  public getBaseStat(character: ICharacter, stat: Stat): number {
    return character.stats[stat] ?? 0;
  }

  // tick the character - do regen
  public tick(character: ICharacter): void {
    if (this.isDead(character)) return;

    const hpRegen = Math.max(1, this.getStat(character, Stat.HPRegen) + Math.max(0, this.getStat(character, Stat.CON) - 21));
    const mpRegen = this.getStat(character, Stat.MPRegen);

    if (character.hp.current + hpRegen > 0) this.heal(character, hpRegen);
    this.mana(character, mpRegen);
  }

  // get the skill level for the character
  public getSkillLevel(character: ICharacter, skill: Skill) {
    return this.game.calculatorHelper.calcSkillLevelForCharacter(character, skill) + this.getStat(character, `${skill}Bonus` as Stat);
  }

  // gain skill for a character
  public gainSkill(character: ICharacter, skill: Skill, skillGained: number): void {
    if (!skill) skill = Skill.Martial;

    // TODO: modify skillGained for sub
    if (isNaN(skillGained)) throw new Error(`Skill gained for ${character.name} is NaN!`);

    character.skills[skill.toLowerCase()] = Math.max((character.skills[skill.toLowerCase()] ?? 0) + skillGained);
    character.skills[skill.toLowerCase()] = Math.min(character.skills[skill.toLowerCase()], this.game.configManager.MAX_SKILL_EXP);
  }

  // check gear and try to cast effects
  public tryToCastEquipmentEffects(character: ICharacter) {
    Object.keys(character.items.equipment).forEach(itemSlot => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      const { equipEffect, itemClass } = this.game.itemHelper.getItemProperties(item, ['equipEffect', 'itemClass']);
      if (!equipEffect) return;

      if (EquipHash[itemClass] && EquipHash[itemClass] !== itemSlot) return;

      this.game.effectHelper.addEffect(character, '', equipEffect.name, { effect: { duration: -1, extra: { persistThroughDeath: true } } });
    });
  }

}
