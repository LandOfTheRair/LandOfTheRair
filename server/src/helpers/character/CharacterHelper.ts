
import { Injectable } from 'injection-js';
import { clamp } from 'lodash';

import { BaseClass, Currency, EquipHash, GivesBonusInHandItemClasses, Hostility,
  ICharacter, IItemEffect, INPC, IPlayer, ISimpleItem, ItemClass, ItemSlot, LearnedSpell, Skill, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

import * as AllegianceStats from '../../../content/_output/allegiancestats.json';
import * as HideReduction from '../../../content/_output/hidereductions.json';
import { Player } from '../../models';

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
    char.hp.current = this.game.userInputHelper.cleanNumber(char.hp.current, 1, { floor: true });
  }

  public manaDamage(char: ICharacter, mp: number): void {
    this.mana(char, -mp);
  }

  public mana(char: ICharacter, mp: number): void {
    char.mp.current = clamp(char.mp.current + mp, char.mp.minimum, char.mp.maximum);
    char.mp.current = this.game.userInputHelper.cleanNumber(char.mp.current, 1, { floor: true });
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

  // check if the person has an empty hand
  public hasEmptyHand(char: ICharacter): boolean {
    return !(char.items.equipment[ItemSlot.RightHand] && char.items.equipment[ItemSlot.LeftHand]);
  }

  // get an empty hand for the character
  public getEmptyHand(char: ICharacter): ItemSlot | null {
    if (!char.items.equipment[ItemSlot.RightHand]) return ItemSlot.RightHand;
    if (!char.items.equipment[ItemSlot.LeftHand])  return ItemSlot.LeftHand;
    return null;
  }

  public hasCurrency(char: ICharacter, total: number, currency: Currency = Currency.Gold): boolean {
    return (char.currency[currency] || 0) >= total;
  }

  // gain currency for a player
  public gainCurrency(char: ICharacter, currencyGained: number, currency: Currency = Currency.Gold): void {
    currencyGained = this.game.userInputHelper.cleanNumber(currencyGained, 0, { floor: true });
    char.currency[currency] = Math.max(Math.floor((char.currency[currency] ?? 0) + currencyGained), 0);

  }

  // lose currency for a player (either by taking it, or spending it)
  public loseCurrency(player: ICharacter, currencyLost: number, currency: Currency = Currency.Gold): void {
    this.gainCurrency(player, -currencyLost, currency);
  }

  // set the characters equipment slot to something, undefined = unequip
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
        this.game.messageHelper.sendLogMessageToPlayer(char, { message: `The ${(itemClass || 'item').toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.` });

        if (tellsBind) {
          this.game.messageHelper.sendLogMessageToRadius(char, 4, { message: `*** ${char.name} has looted ${desc}.` });
        }
      }
    }
  }

  // drop your hands on the ground
  public dropHands(char: ICharacter): void {
    if (this.game.diceRollerHelper.XInOneHundred(this.game.traitHelper.traitLevelValue(char, 'DeathGrip'))) return;

    const { state } = this.game.worldManager.getMap(char.map);

    if (char.items.equipment[ItemSlot.RightHand]) {
      state.addItemToGround(char.x, char.y, char.items.equipment[ItemSlot.RightHand] as ISimpleItem);
      this.setRightHand(char, undefined);
    }

    if (char.items.equipment[ItemSlot.LeftHand]) {
      state.addItemToGround(char.x, char.y, char.items.equipment[ItemSlot.LeftHand] as ISimpleItem);
      this.setLeftHand(char, undefined);
    }
  }

  // set right hand to something
  public setRightHand(char: ICharacter, item: ISimpleItem | undefined) {
    this.setEquipmentSlot(char, ItemSlot.RightHand, item);
  }

  // set left hand to something
  public setLeftHand(char: ICharacter, item: ISimpleItem | undefined) {
    this.setEquipmentSlot(char, ItemSlot.LeftHand, item);
  }

  // check if a char has agro with a different char
  public hasAgro(char: ICharacter, target: ICharacter): boolean {
    return target.agro[char.uuid] > 0;
  }

  // add agro for a different char
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

  // clear agro for a particular char
  public clearAgro(char: ICharacter, target: ICharacter) {
    delete char.agro[target.uuid];
  }

  // begin engaging in combat
  public engageInCombat(char: ICharacter) {
    char.combatTicks = 5;
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

    // recalculate stats
    this.calculateStatTotals(character);

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

  // recalculate everything, basically when equipment changes usually
  public recalculateEverything(character: ICharacter): void {
    this.recalculateTraits(character);
    this.recalculateLearnedSpells(character);
    this.calculateStatTotals(character);
  }

  // recalculate what spells we know based on traits and items
  public recalculateLearnedSpells(character: ICharacter): void {

    const fromFate = Object.keys(character.learnedSpells).filter(x => character.learnedSpells[x] === LearnedSpell.FromFate);

    character.learnedSpells = {};

    const learnSpell = (spell: string, learnFrom: LearnedSpell) => {
      if (character.learnedSpells[spell.toLowerCase()]) return;

      character.learnedSpells[spell.toLowerCase()] = learnFrom;
    };

    // check all traits for spells
    Object.keys(character.allTraits).forEach(trait => {
      const traitRef = this.game.traitHelper.getTraitData(trait);
      if (!traitRef || !traitRef.spellGiven) return;

      learnSpell(traitRef.spellGiven, LearnedSpell.FromTraits);
    });

    // check all items
    Object.keys(character.items.equipment).forEach(itemSlot => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // no spells if we can't technically use the item
      if (this.isPlayer(character) && !this.game.itemHelper.canGetBenefitsFromItem(character as IPlayer, item)) return;

      // check if it has an effect, and if we can use that effect
      const { useEffect } = this.game.itemHelper.getItemProperties(item, ['useEffect']);

      if (useEffect && useEffect.uses) {
        learnSpell(useEffect.name, LearnedSpell.FromItem);
      }
    });

    // re-learn fated spells last
    fromFate.forEach(spell => learnSpell(spell, LearnedSpell.FromFate));
  }

  // recalculate all traits that exist for this character
  public recalculateTraits(character: ICharacter): void {
    character.allTraits = {};

    // base traits from self/learned
    if (this.isPlayer(character)) {
      Object.assign(character.allTraits, this.game.traitHelper.getAllLearnedTraits(character as IPlayer));
    } else {
      Object.assign(character.allTraits, (character as INPC).traitLevels);
    }

    // traits from equipment
    Object.keys(character.items.equipment).forEach(itemSlot => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // no bonus if we can't technically use the item
      if (this.isPlayer(character) && !this.game.itemHelper.canGetBenefitsFromItem(character as IPlayer, item)) return;

      // only some items give bonuses in hands
      const { itemClass, trait } = this.game.itemHelper.getItemProperties(item, ['itemClass', 'trait']);
      if ([ItemSlot.RightHand, ItemSlot.LeftHand].includes(itemSlot as ItemSlot)
      && !GivesBonusInHandItemClasses.includes(itemClass as ItemClass)) return;

      if (trait) {
        character.allTraits[trait.name] = character.allTraits[trait.name] || 0;
        character.allTraits[trait.name] += trait.level;
      }
    });
  }

  // get the total stats from traits
  public getStatValueAddFromTraits(character: ICharacter): Partial<Record<Stat, number>> {
    const stats = {};

    Object.keys(character.allTraits).forEach(trait => {
      const traitRef = this.game.traitHelper.getTraitData(trait);
      if (!traitRef || !traitRef.statsGiven) return;

      Object.keys(traitRef.statsGiven).forEach(stat => {
        if (!traitRef.statsGiven?.[stat]) return;

        stats[stat] = stats[stat] || 0;
        stats[stat] += traitRef.statsGiven[stat] * this.game.traitHelper.traitLevel(character, trait);
      });
    });

    return stats;
  }

  // calculate the total stats for a character from their current loadout
  public calculateStatTotals(character: ICharacter): void {

    const oldPerception = character.totalStats[Stat.Perception];
    const oldStealth = character.totalStats[Stat.Stealth];

    // reset stats to the base values
    character.totalStats = Object.assign({}, character.stats);

    const addStat = (stat: Stat, bonus: number) => {
      character.totalStats[stat] = character.totalStats[stat] || 0;
      character.totalStats[stat]! += bonus;
    };

    // add hidden allegiance bonuses
    (AllegianceStats[character.allegiance] || []).forEach(({ stat, value }) => {
      addStat(stat, value);
    });

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

    // get trait/effect stats
    const traitStatBoosts = this.getStatValueAddFromTraits(character);
    const effectStatBoosts = this.game.effectHelper.effectStatBonuses(character);

    const addStatsFromHash = (hash) => {
      Object.keys(hash).forEach(stat => {
        character.totalStats[stat] = character.totalStats[stat] || 0;
        character.totalStats[stat] += hash[stat];
      });
    };

    addStatsFromHash(traitStatBoosts);
    addStatsFromHash(effectStatBoosts);

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

    // if we're a player and our perception changes, we do a full visual update
    const { state } = this.game.worldManager.getMap(character.map);

    if (this.isPlayer(character) && oldPerception !== character.totalStats[Stat.Perception]) {
      state.triggerFullUpdateForPlayer(character as Player);
    }

    // update stealth to do hide reductions
    if ((character.totalStats[Stat.Stealth] ?? 0) > 0) {
      character.totalStats[Stat.Stealth] = Math.max(0, (character.totalStats[Stat.Stealth] ?? 0) - this.getStealthPenalty(character));

      // if the stealth is different we gotta trigger an update
      if (oldStealth !== character.totalStats[Stat.Stealth]) {
        state.triggerPlayerUpdateInRadius(character.x, character.y);
      }
    }

    // TODO: adjust pet stats
  }

  // get the current currency value for a character
  public getCurrency(character: ICharacter, currency: Currency = Currency.Gold): number {
    return character.currency[currency] ?? 0;
  }

  // get a specific stat value from a character
  public getStat(character: ICharacter, stat: Stat): number {
    const value = character.totalStats[stat] ?? 0;
    if (value === 0 && stat === Stat.DamageFactor) return 1;
    return value;
  }

  // get a specific base stat value from a character
  public getBaseStat(character: ICharacter, stat: Stat): number {
    return character.stats[stat] ?? 0;
  }

  // hp regen is a min of 1, affected by a con modifier past 21
  public getHPRegen(character: ICharacter): number {
    return Math.max(1, this.getStat(character, Stat.HPRegen) + Math.max(0, this.getStat(character, Stat.CON) - 21));
  }

  // thieves and warriors have different mpregen setups
  public getMPRegen(character: ICharacter): number {

    // thieves not in combat regen faster
    if (character.baseClass === BaseClass.Thief) {
      if (character.combatTicks <= 0) return 10;
      return 1;
    }

    // warriors are the inverse of thieves
    if (character.baseClass === BaseClass.Warrior) {
      if (character.combatTicks <= 0) return -3;
      return 3;
    }

    return this.getStat(character, Stat.MPRegen);
  }

  // get the stealth value for a character
  public getStealth(char: ICharacter): number {
    let stealth = this.getSkillLevel(char, Skill.Thievery) + char.level + this.getStat(char, Stat.AGI);
    if (char.baseClass === BaseClass.Thief) stealth *= 1.5;

    return stealth;
  }

  public getStealthPenalty(char: ICharacter): number {

    const leftHandClass = char.items.equipment[ItemSlot.LeftHand]
                        ? this.game.itemHelper.getItemProperty(char.items.equipment[ItemSlot.LeftHand], 'itemClass')
                        : null;

    const rightHandClass = char.items.equipment[ItemSlot.RightHand]
                         ? this.game.itemHelper.getItemProperty(char.items.equipment[ItemSlot.RightHand], 'itemClass')
                         : null;

    const totalReduction = (HideReduction[leftHandClass]) || 0 + (HideReduction[rightHandClass] || 0);

    return totalReduction;
  }

  // get perception value for a character
  public getPerception(char: ICharacter): number {
    let perception = this.getStat(char, Stat.Perception) + char.level + this.getStat(char, Stat.WIS);
    if (char.baseClass === BaseClass.Thief) perception *= 1.5;

    return perception;
  }

  // tick the character - do regen
  public tick(character: ICharacter, tick: number): void {
    if (this.isDead(character)) return;

    if (character.combatTicks > 0) {
      character.combatTicks--;
    }

    if (character.spellChannel) {
      character.spellChannel.ticks--;
      if (character.spellChannel.ticks <= 0) {
        character.spellChannel.callback();
      }
    }

    if (tick % 5 === 0) {
      const hpRegen = this.getHPRegen(character);
      const mpRegen = this.getMPRegen(character);

      if (character.hp.current + hpRegen > 0) this.heal(character, hpRegen);
      this.mana(character, mpRegen);
    }
  }

  // get the skill level for the character
  public getSkillLevel(character: ICharacter, skill: Skill) {
    return this.game.calculatorHelper.calcSkillLevelForCharacter(character, skill)
         + this.getStat(character, `${skill.toLowerCase()}Bonus` as Stat);
  }

  // check gear and try to cast effects
  public tryToCastEquipmentEffects(character: ICharacter) {
    Object.keys(character.items.equipment).forEach(itemSlot => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      const { equipEffect, itemClass } = this.game.itemHelper.getItemProperties(item, ['equipEffect', 'itemClass']);
      if (!equipEffect) return;

      if (EquipHash[itemClass as ItemClass] && EquipHash[itemClass as ItemClass] !== itemSlot) return;

      this.game.effectHelper.addEffect(character, '', equipEffect.name, { effect: { duration: -1, extra: { persistThroughDeath: true } } });
    });
  }

  // whether or not this particular character knows how to cast a spell/ability
  public hasLearned(character: ICharacter, spell: string): boolean {
    return (character.learnedSpells[spell] ?? LearnedSpell.Unlearned) !== LearnedSpell.Unlearned;
  }

  // whether or not this particular character knows how to cast a spell/ability
  public hasLearnedFromItem(character: ICharacter, spell: string): boolean {
    return character.learnedSpells[spell] === LearnedSpell.FromItem;
  }

  // try to break items that have a limited number of uses
  public abuseItemsForLearnedSkillAndGetEffect(character: ICharacter, spell: string): IItemEffect | undefined {
    if (character.learnedSpells[spell.toLowerCase()] !== LearnedSpell.FromItem) return;

    let foundItem!: ISimpleItem;
    let foundSlot!: ItemSlot;
    let foundEffect!: IItemEffect;

    Object.keys(character.items.equipment).forEach(slot => {
      if (foundSlot || foundEffect || foundItem) return;

      const item = character.items.equipment[slot];
      if (!item) return;

      const { useEffect, itemClass } = this.game.itemHelper.getItemProperties(item, ['useEffect', 'itemClass']);
      if (!useEffect || useEffect.name.toLowerCase() !== spell.toLowerCase() || itemClass === ItemClass.Bottle) return;

      foundSlot = slot as ItemSlot;
      foundItem = item;
      foundEffect = useEffect;
    });

    if (foundSlot && foundEffect && foundItem) {
      this.game.itemHelper.tryToBreakItem(character, foundItem, foundSlot);
    }

    return foundEffect;
  }

}
