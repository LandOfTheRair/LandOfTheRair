
import { Injectable } from 'injection-js';
import { clamp } from 'lodash';

import { BaseClass, EquipHash, GivesBonusInHandItemClasses, Hostility,
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

  // check if the character can currently act
  public canAct(char: ICharacter): boolean {
    const stunned = this.game.effectHelper.getEffect(char, 'Stun');
    const chilled = this.game.effectHelper.getEffect(char, 'Chilled');

    const isStunned = stunned?.effectInfo.isFrozen;
    const isChilled = chilled?.effectInfo.isFrozen;

    return !isStunned && !isChilled;
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
    if (hp === 0) return;

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

  // get the primary spell casting stat for a character
  public castStat(char: ICharacter): Stat {
    const stats: Record<BaseClass, Stat> = {
      [BaseClass.Healer]: Stat.WIS,
      [BaseClass.Mage]: Stat.INT,
      [BaseClass.Thief]: Stat.INT,
      [BaseClass.Warrior]: Stat.STR,
      [BaseClass.Traveller]: Stat.LUK
    };

    return stats[char.baseClass];
  }

  // check if this player is holding something
  public hasHeldItem(char: ICharacter, item: string, hand: 'left'|'right' = 'right'): boolean {
    const ref = char.items.equipment[`${hand}Hand`];
    return !!(ref && ref.name === item && (!ref.mods.owner || ref.mods.owner === (char as IPlayer).username));
  }

  public hasHeldItemInEitherHand(char: ICharacter, item: string): boolean {
    return this.hasHeldItem(char, item, 'right') || this.hasHeldItem(char, item, 'left');
  }

  public hasHeldItems(char: ICharacter, item1: string, item2: string): boolean {
    return (this.hasHeldItem(char, item1, 'right') && this.hasHeldItem(char, item2, 'left'))
        || (this.hasHeldItem(char, item2, 'right') && this.hasHeldItem(char, item1, 'left'));
  }

  // take an item from either hand
  public takeItemFromEitherHand(char: ICharacter, item: string): void {
    if (this.hasHeldItem(char, item, 'left'))  this.setEquipmentSlot(char, ItemSlot.LeftHand, undefined);
    if (this.hasHeldItem(char, item, 'right')) this.setEquipmentSlot(char, ItemSlot.RightHand, undefined);
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
      const { itemClass, equipEffect } = this.game.itemHelper.getItemProperties(item, ['itemClass', 'equipEffect']);
      if (itemClass === ItemClass.Corpse) return;

      if (equipEffect) {
        this.tryToCastEquipmentEffects(char);
      }

      this.game.itemHelper.tryToBindItem(char, item);
    }

    this.game.characterHelper.recalculateEverything(char);
  }

  // drop your hands on the ground
  public dropHands(char: ICharacter): void {
    if (this.game.traitHelper.rollTraitValue(char, 'DeathGrip')) return;

    const { state, x: dropX, y: dropY } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(char, char.x, char.y);

    if (char.items.equipment[ItemSlot.RightHand]) {
      state.addItemToGround(dropX, dropY, char.items.equipment[ItemSlot.RightHand] as ISimpleItem);
      this.setRightHand(char, undefined);
    }

    if (char.items.equipment[ItemSlot.LeftHand]) {
      state.addItemToGround(dropX, dropY, char.items.equipment[ItemSlot.LeftHand] as ISimpleItem);
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
    if ((char as INPC).owner && target === (char as INPC).owner) return;
    if ((target as INPC).owner && char === (target as INPC).owner) return;

    // boost by both sides threat multiplier
    const amountMult = 1 + this.getStat(char, Stat.ThreatMultiplier) + this.getStat(target, Stat.ThreatMultiplier);
    amount *= amountMult;

    if (this.game.effectHelper.hasEffect(char, 'Invisibility')) {
      this.game.effectHelper.removeEffectByName(char, 'Invisibility');
    }

    if (this.game.effectHelper.hasEffect(target, 'Shadowmeld')) {
      this.game.effectHelper.removeEffectByName(target, 'Shadowmeld');
    }

    const modifyAgro = (agroChar: ICharacter, agroTarget: ICharacter, modAmount: number) => {
      agroChar.agro[agroTarget.uuid] = (agroChar.agro[agroTarget.uuid] || 0) + modAmount;

      if (agroChar.agro[agroTarget.uuid] <= 0) {
        delete agroChar.agro[agroTarget.uuid];
      }
    };

    modifyAgro(char, target, amount);
    modifyAgro(target, char, amount);

    if (this.isPlayer(char) && !this.isPlayer(target)) {
      this.game.partyHelper.getAllPartyMembersInRange(char as IPlayer).forEach(otherPlayer => {
        modifyAgro(target, otherPlayer, 1);
        modifyAgro(otherPlayer, target, 1);
      });
    }

    if (this.isPlayer(target) && !this.isPlayer(char)) {
      this.game.partyHelper.getAllPartyMembersInRange(target as IPlayer).forEach(otherPlayer => {
        modifyAgro(char, otherPlayer, 1);
        modifyAgro(otherPlayer, char, 1);
      });
    }

  }

  // clear agro for a particular char
  public clearAgro(char: ICharacter, target: ICharacter) {
    delete char.agro[target.uuid];

    if (this.isPlayer(target) && !this.isPlayer(char)) {
      this.game.partyHelper.getAllPartyMembersInRange(target as IPlayer).forEach(otherPlayer => {
        delete char.agro[otherPlayer.uuid];
      });
    }
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
    if ((target as INPC).owner) return false;
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

    const oneStats = [Stat.CHA, Stat.CON, Stat.DEX, Stat.INT, Stat.WIL, Stat.WIS, Stat.STR, Stat.AGI, Stat.LUK];
    const minimum = (oneStats.includes(stat) ? 1 : 0);

    const curStat = character.stats[stat] ?? minimum;

    // cannot cannot go lower than 1
    if (curStat - value < minimum) return false;

    // lose the stat if we can
    character.stats[stat] = (character.stats[stat] ?? minimum) - value;

    return true;

  }

  // recalculate everything, basically when equipment changes usually
  public recalculateEverything(character: ICharacter): void {
    this.recalculateTraits(character);
    this.recalculateLearnedSpells(character);
    this.calculateStatTotals(character);
    this.checkEncumberance(character);
  }

  // check if this character is encumbered
  public checkEncumberance(character: ICharacter): void {

    // only players can be encumbered
    if (!this.isPlayer(character)) return;

    // warrior, healer, traveller can wear heavy armor
    if ([BaseClass.Warrior, BaseClass.Healer, BaseClass.Traveller].includes(character.baseClass)) return;

    // lightenarmor trait means no encumber as well
    if (this.game.traitHelper.traitLevelValue(character, 'LightenArmor')) return;

    let castEncumber = false;
    Object.values(character.items.equipment).forEach(item => {
      const isHeavy = this.game.itemHelper.getItemProperty(item, 'isHeavy');
      if (!isHeavy) return;

      castEncumber = true;
    });

    if (castEncumber) {
      this.game.effectHelper.addEffect(character, '', 'Encumbered');

    } else if (this.game.effectHelper.hasEffect(character, 'Encumbered')) {
      this.game.effectHelper.removeEffectByName(character, 'Encumbered');

    }
  }

  // recalculate what spells we know based on traits and items
  public recalculateLearnedSpells(character: ICharacter): void {

    const fromFate = Object.keys(character.learnedSpells).filter(x => character.learnedSpells[x] === LearnedSpell.FromFate);

    character.learnedSpells = {};

    const learnSpell = (spell: string, learnFrom: LearnedSpell) => {
      const curLearnedStatus = character.learnedSpells[spell.toLowerCase()];
      if (curLearnedStatus === LearnedSpell.FromTraits) return;

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

    // get benefits from inscribed rune scrolls
    if (this.isPlayer(character)) {
      (character as IPlayer).runes.forEach(rune => {
        if (!rune) return;

        const item = this.game.itemHelper.getItemDefinition(rune);
        if (!item.trait) return;

        character.allTraits[item.trait.name] = character.allTraits[item.trait.name] || 0;
        character.allTraits[item.trait.name] += item.trait.level ?? 0;
      });
    }
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
        stats[stat] += (traitRef.statsGiven[stat] ?? 0) * (this.game.traitHelper.traitLevel(character, trait) ?? 0);
      });
    });

    // handle reflective coating - boost spell reflect
    const reflectiveBoost = this.game.traitHelper.traitLevelValue(character, 'ReflectiveCoating');
    if (reflectiveBoost > 0) {
      stats[Stat.SpellReflectChance] = stats[Stat.SpellReflectChance] ?? 0;

      const leftHand = character.items.equipment[ItemSlot.LeftHand];
      const rightHand = character.items.equipment[ItemSlot.RightHand];

      if (leftHand && this.game.itemHelper.getItemProperty(leftHand, 'itemClass') === ItemClass.Shield) {
        stats[Stat.SpellReflectChance] += reflectiveBoost;
      }

      if (rightHand && this.game.itemHelper.getItemProperty(rightHand, 'itemClass') === ItemClass.Shield) {
        stats[Stat.SpellReflectChance] += reflectiveBoost;
      }
    }

    // handle unarmored savant - set base mitigation
    const savantBoost = this.game.traitHelper.traitLevelValue(character, 'UnarmoredSavant');
    if (savantBoost > 0) {
      stats[Stat.Mitigation] = stats[Stat.Mitigation] ?? 0;

      const item = character.items.equipment[ItemSlot.Armor];
      const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');

      if (!item || [ItemClass.Cloak, ItemClass.Robe, ItemClass.Fur].includes(itemClass)) {
        stats[Stat.Mitigation] += savantBoost;

        // adjust for fur being a base 10 already
        if (itemClass === ItemClass.Fur) stats[Stat.Mitigation] -= 10;
      }
    }

    return stats;
  }

  // calculate the total stats for a character from their current loadout
  public calculateStatTotals(character: ICharacter): void {

    const oldPerception = character.totalStats[Stat.Perception];
    const oldStealth = character.totalStats[Stat.Stealth];

    let bonusStats = {};

    if (this.isPlayer(character)) {
      bonusStats = (character as IPlayer).quests.questStats;
    }

    // reset stats to the base values
    character.totalStats = Object.assign({}, character.stats);
    character.totalStats[Stat.Move] = character.totalStats[Stat.Move] ?? 3;

    const addStat = (stat: Stat, bonus: number) => {
      character.totalStats[stat] = character.totalStats[stat] || 0;
      character.totalStats[stat]! += (bonus ?? 0);
      character.totalStats[stat] = Math.max(character.totalStats[stat]!, 0);
    };

    // add quest completion bonuses
    Object.keys(bonusStats).forEach(stat => {
      addStat(stat as Stat, bonusStats[stat]);
    });

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

      // shields don't work in right hand unless you have the trait
      if (itemClass === ItemClass.Shield
      && itemSlot === ItemSlot.RightHand
      && !this.game.traitHelper.traitLevel(character, 'Shieldbearer')) return;

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
    character.totalStats[Stat.Move] = clamp(character.totalStats[Stat.Move], 0, 4);

    // if we're a player and our perception changes, we do a full visual update
    const state = this.game.worldManager.getMap(character.map)?.state;
    if (!state) return;

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
    const baseHPRegen = 1 + this.getStat(character, Stat.HPRegen);
    return Math.max(baseHPRegen, baseHPRegen + Math.max(0, this.getStat(character, Stat.CON) - 21));
  }

  // thieves and warriors have different mpregen setups
  public getMPRegen(character: ICharacter): number {

    // thieves not in combat regen faster
    if (character.baseClass === BaseClass.Thief) {

      // hidden or singing thieves have no regen
      if (this.game.effectHelper.hasEffect(character, 'Hidden') || this.game.effectHelper.hasEffect(character, 'Singing')) return 0;

      // thieves in combat get less regen than out of
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
    if (this.game.effectHelper.hasEffect(char, 'Encumbered')) stealth /= 2;

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
    const shadowSheathMultiplier = Math.max(0, 1 - this.game.traitHelper.traitLevelValue(char, 'ShadowSheath'));

    return Math.floor(totalReduction * shadowSheathMultiplier);
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
        delete character.spellChannel;
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
    return this.learnedState(character, spell) !== LearnedSpell.Unlearned;
  }

  // get the specific learned state for a spell
  public learnedState(character: ICharacter, spell: string): LearnedSpell {
    return (character.learnedSpells[spell.toLowerCase()] ?? LearnedSpell.Unlearned);
  }

  // whether or not this particular character knows how to cast a spell/ability
  public hasLearnedFromItem(character: ICharacter, spell: string): boolean {
    return character.learnedSpells[spell] === LearnedSpell.FromItem;
  }

  public forceSpellLearnStatus(character: ICharacter, spell: string, state: LearnedSpell): void {
    character.learnedSpells[spell] = state;
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

  // add a pet
  public addPet(owner: ICharacter, pet: INPC): void {
    pet.owner = owner;

    owner.pets = owner.pets || [];
    owner.pets.push(pet);
  }

  // remove a pet
  public removePet(owner: ICharacter, pet: INPC): void {
    delete pet.owner;

    owner.pets = owner.pets || [];
    owner.pets = owner.pets.filter(x => x !== pet);
  }

}
