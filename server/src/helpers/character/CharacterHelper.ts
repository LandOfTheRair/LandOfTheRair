
import { Injectable } from 'injection-js';
import { clamp } from 'lodash';

import { BaseService, EquipHash, GivesBonusInHandItemClasses, Hostility,
  ICharacter, IItemEffect, INPC, IPlayer, ISimpleItem, ItemClass, ItemSlot, LearnedSpell, Skill, Stat } from '../../interfaces';

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

  // check if the person has an empty hand
  public hasEmptyHand(char: ICharacter): boolean {
    return !(char.items.equipment[ItemSlot.RightHand] && char.items.equipment[ItemSlot.LeftHand]);
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
        this.game.messageHelper.sendLogMessageToPlayer(char, { message: `The ${(itemClass || 'item').toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.` });

        if (tellsBind) {
          this.game.messageHelper.sendLogMessageToRadius(char, 4, { message: `*** ${char.name} has looted ${desc}.` });
        }
      }
    }
  }

  public dropHands(char: ICharacter): void {
    if (this.game.diceRollerHelper.XInOneHundred(this.game.traitHelper.traitLevelValue(char, 'DeathGrip'))) return;

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

    // reset stats to the base values
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

    if (character.combatTicks > 0) {
      character.combatTicks--;
    }

    if (character.spellChannel) {
      character.spellChannel.ticks--;
      if (character.spellChannel.ticks <= 0) {
        character.spellChannel.callback();
      }
    }

    const hpRegen = Math.max(1, this.getStat(character, Stat.HPRegen) + Math.max(0, this.getStat(character, Stat.CON) - 21));
    const mpRegen = this.getStat(character, Stat.MPRegen);

    if (character.hp.current + hpRegen > 0) this.heal(character, hpRegen);
    this.mana(character, mpRegen);
  }

  // get the skill level for the character
  public getSkillLevel(character: ICharacter, skill: Skill) {
    return this.game.calculatorHelper.calcSkillLevelForCharacter(character, skill) + this.getStat(character, `${skill}Bonus` as Stat);
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
