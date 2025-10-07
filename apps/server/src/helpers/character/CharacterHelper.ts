import { Injectable } from 'injection-js';
import { clamp, isString, random } from 'lodash';

import { effectStatBonuses, getEffect, hasEffect } from '@lotr/effects';
import type {
  ICharacter,
  IItemEffect,
  INPC,
  IPlayer,
  ISimpleItem,
} from '@lotr/interfaces';
import {
  EquipHash,
  GivesBonusInHandItemClasses,
  ItemClass,
  ItemSlot,
  LearnedSpell,
  Skill,
  Stat,
} from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

import {
  getSkillLevel,
  getStat,
  hasHeldItem,
  heal,
  isDead,
  isPet,
  isPlayer,
  mana,
} from '@lotr/characters';
import { cleanNumber } from '@lotr/shared';
import type { Player } from '../../models';

@Injectable()
export class CharacterHelper extends BaseService {
  public init() {}

  // get the primary spell casting stat for a character
  public castStat(char: ICharacter): Stat {
    return this.game.contentManager.getClassConfigSetting<'castStat'>(
      char.baseClass,
      'castStat',
    );
  }

  // take an item from either hand
  public takeItemFromEitherHand(char: ICharacter, item: string): void {
    if (hasHeldItem(char, item, 'left')) {
      this.setEquipmentSlot(char, ItemSlot.LeftHand, undefined);
    }
    if (hasHeldItem(char, item, 'right')) {
      this.setEquipmentSlot(char, ItemSlot.RightHand, undefined);
    }
  }

  // set the characters equipment slot to something, undefined = unequip
  public setEquipmentSlot(
    char: ICharacter,
    slot: ItemSlot,
    item: ISimpleItem | undefined,
  ): void {
    const oldItem = char.items.equipment[slot];

    if (oldItem) {
      const { equipEffect, itemClass, corpseUsername } =
        this.game.itemHelper.getItemProperties(oldItem, [
          'equipEffect',
          'itemClass',
          'corpseUsername',
        ]);

      if (equipEffect) {
        const oldEffectCount = this.equipmentEffectCount(
          char,
          equipEffect.name,
        );
        if (oldEffectCount <= 1) {
          this.game.effectHelper.removeEffectByName(char, equipEffect.name);
        }
      }

      if (corpseUsername && itemClass === ItemClass.Corpse) {
        this.game.corpseManager.movePlayerCorpseOntoMap(oldItem, char);
      }
    }

    char.items.equipment[slot] = item;

    if (item) {
      const { itemClass, equipEffect, corpseUsername } =
        this.game.itemHelper.getItemProperties(item, [
          'itemClass',
          'equipEffect',
          'corpseUsername',
        ]);

      if (itemClass === ItemClass.Corpse) {
        if (corpseUsername) {
          this.game.corpseManager.markPlayerCorpseHeld(item, char);
        }
        return;
      }

      if (equipEffect) {
        this.tryToCastEquipmentEffects(char);
      }

      this.game.itemHelper.tryToBindItem(char, item);
    }

    this.game.characterHelper.recalculateEverything(char);
  }

  public tryDance(char: ICharacter): void {
    const danceLevel = this.game.traitHelper.traitLevelValue(
      char,
      'DivineDancing',
    );
    if (danceLevel === 0) return;

    this.game.movementHelper.moveWithPathfinding(char, {
      xDiff: random(-danceLevel, danceLevel),
      yDiff: random(-danceLevel, danceLevel),
    });
  }

  public dropHand(char: ICharacter, hand: 'left' | 'right'): void {
    const item = char.items.equipment[`${hand}Hand`];
    if (!item) return;

    const {
      state,
      x: dropX,
      y: dropY,
    } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(
      char,
      char.x,
      char.y,
    );

    state.addItemToGround(dropX, dropY, item);

    if (hand === 'left') {
      this.setLeftHand(char, undefined);
    } else if (hand === 'right') {
      this.setRightHand(char, undefined);
    }
  }

  // drop your hands on the ground
  public dropHands(char: ICharacter): void {
    if (isPlayer(char)) {
      const value =
        this.game.traitHelper.traitLevelValue(char, 'DeathGrip') +
        this.game.traitHelper.traitLevelValue(char, 'AncientGrip');
      if (this.game.diceRollerHelper.XInOneHundred(value)) return;
    }

    this.dropHand(char, 'left');
    this.dropHand(char, 'right');
  }

  // set right hand to something
  public setRightHand(char: ICharacter, item: ISimpleItem | undefined) {
    this.setEquipmentSlot(char, ItemSlot.RightHand, item);
  }

  // set left hand to something
  public setLeftHand(char: ICharacter, item: ISimpleItem | undefined) {
    this.setEquipmentSlot(char, ItemSlot.LeftHand, item);
  }

  // add agro for a different char
  public addAgro(char: ICharacter, target: ICharacter, amount: number) {
    if ((char as INPC).owner && target === (char as INPC).owner) return;
    if ((target as INPC).owner && char === (target as INPC).owner) return;
    if (
      (char as INPC).monsterGroup &&
      (target as INPC).monsterGroup &&
      (char as INPC).monsterGroup === (target as INPC).monsterGroup
    ) {
      return;
    }

    // boost by both sides threat multiplier
    const amountMult =
      1 +
      getStat(char, Stat.ThreatMultiplier) +
      getStat(target, Stat.ThreatMultiplier);
    amount *= amountMult;

    if (hasEffect(char, 'Invisibility')) {
      this.game.effectHelper.removeEffectByName(char, 'Invisibility');
    }

    if (hasEffect(char, 'Shadowmeld')) {
      this.game.effectHelper.removeEffectByName(char, 'Shadowmeld');
    }

    const modifyAgro = (
      agroChar: ICharacter,
      agroTarget: ICharacter,
      modAmount: number,
    ) => {
      agroChar.agro[agroTarget.uuid] =
        (agroChar.agro[agroTarget.uuid] || 0) + modAmount;

      if (agroChar.agro[agroTarget.uuid] <= 0) {
        delete agroChar.agro[agroTarget.uuid];
      }
    };

    modifyAgro(char, target, amount);
    modifyAgro(target, char, amount);

    if (isPlayer(char) && !isPlayer(target)) {
      this.game.partyHelper
        .getAllPartyMembersInRange(char as IPlayer)
        .forEach((otherPlayer) => {
          modifyAgro(target, otherPlayer, 1);
          modifyAgro(otherPlayer, target, 1);
        });
    }

    if (isPlayer(target) && !isPlayer(char)) {
      this.game.partyHelper
        .getAllPartyMembersInRange(target as IPlayer)
        .forEach((otherPlayer) => {
          modifyAgro(char, otherPlayer, 1);
          modifyAgro(otherPlayer, char, 1);
        });
    }

    if (isPet(char)) {
      const owner = (char as INPC).owner;
      if (owner) {
        this.addAgro(owner, target, amount);
      }
    }
  }

  // clear agro for a particular char
  public clearAgro(char: ICharacter, target: ICharacter) {
    delete char.agro[target.uuid];

    if (isPlayer(target) && !isPlayer(char)) {
      this.game.partyHelper
        .getAllPartyMembersInRange(target as IPlayer)
        .forEach((otherPlayer) => {
          delete char.agro[otherPlayer.uuid];
        });
    }
  }

  // gain a permanent stat (from a bottle, or some other source)
  public gainPermanentStat(
    character: ICharacter,
    stat: Stat,
    value = 1,
  ): boolean {
    const cleanValue = cleanNumber(value, 0);

    // hp/mp always go up with no limit
    if (stat === Stat.HP || stat === Stat.MP) {
      character.stats[stat] = (character.stats[stat] ?? 1) + cleanValue;
      return true;
    }

    const curStat = character.stats[stat] ?? 1;

    const hardBaseCap = this.game.configManager.MAX_STATS;

    // cannot exceed the hard cap
    if (curStat + cleanValue > hardBaseCap) return false;

    // but if we're under it, we boost
    character.stats[stat] = (character.stats[stat] ?? 1) + cleanValue;

    // recalculate stats
    this.calculateStatTotals(character);

    return true;
  }

  // lose a permanent stat (from any reason)
  public losePermanentStat(
    character: ICharacter,
    stat: Stat,
    value = 1,
  ): boolean {
    const oneStats = [
      Stat.CHA,
      Stat.CON,
      Stat.DEX,
      Stat.INT,
      Stat.WIL,
      Stat.WIS,
      Stat.STR,
      Stat.AGI,
      Stat.LUK,
    ];
    const minimum = oneStats.includes(stat) ? 1 : 0;

    const curStat = character.stats[stat] ?? minimum;

    // cannot cannot go lower than 1
    if (curStat - value < minimum) return false;

    // lose the stat if we can
    character.stats[stat] = (character.stats[stat] ?? minimum) - value;

    return true;
  }

  private addTraitLevel(
    character: ICharacter,
    trait: string,
    traitLevel: number,
  ): void {
    if (!trait) return;

    character.allTraits[trait] ??= 0;
    character.allTraits[trait] += traitLevel;
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
    if (!isPlayer(character)) return;

    const canBeEncumbered =
      this.game.contentManager.getClassConfigSetting<'canBeEncumbered'>(
        character.baseClass,
        'canBeEncumbered',
      );

    // some classes can wear heavy armor
    if (!canBeEncumbered) {
      return;
    }

    // lightenarmor trait means no encumber as well, also clear encumber in rare cases that it matters
    if (this.game.traitHelper.traitLevelValue(character, 'LightenArmor')) {
      this.game.effectHelper.removeEffectByName(character, 'Encumbered');
      return;
    }

    let castEncumber = false;
    Object.values(character.items.equipment).forEach((item) => {
      const isHeavy = this.game.itemHelper.getItemProperty(item, 'isHeavy');
      if (!isHeavy) return;

      castEncumber = true;
    });

    if (castEncumber) {
      this.game.effectHelper.addEffect(character, '', 'Encumbered');
    } else if (hasEffect(character, 'Encumbered')) {
      this.game.effectHelper.removeEffectByName(character, 'Encumbered');
    }
  }

  // recalculate what spells we know based on traits and items
  public recalculateLearnedSpells(character: ICharacter): void {
    const fromFate = Object.keys(character.learnedSpells).filter(
      (x) => character.learnedSpells[x] === LearnedSpell.FromFate,
    );

    character.learnedSpells = {};

    const learnSpell = (spell: string, learnFrom: LearnedSpell) => {
      const curLearnedStatus = character.learnedSpells[spell.toLowerCase()];
      if (curLearnedStatus === LearnedSpell.FromTraits) return;

      character.learnedSpells[spell.toLowerCase()] = learnFrom;
    };

    // check all traits for spells
    Object.keys(character.allTraits ?? {}).forEach((trait) => {
      const traitRef = this.game.traitHelper.getTraitData(
        trait,
        `RLS:${character.name}`,
      );
      if (!traitRef || !traitRef.spellGiven) return;

      learnSpell(traitRef.spellGiven, LearnedSpell.FromTraits);
    });

    // check all items
    Object.keys(character.items.equipment).forEach((itemSlot) => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // no spells if we can't technically use the item
      if (
        isPlayer(character) &&
        !this.game.itemHelper.canGetBenefitsFromItem(character as IPlayer, item)
      ) {
        return;
      }

      // check if it has an effect, and if we can use that effect
      const { useEffect } = this.game.itemHelper.getItemProperties(item, [
        'useEffect',
      ]);

      if (useEffect && useEffect.uses) {
        learnSpell(useEffect.name, LearnedSpell.FromItem);
      }
    });

    // re-learn fated spells last
    fromFate.forEach((spell) => learnSpell(spell, LearnedSpell.FromFate));
  }

  // recalculate all traits that exist for this character
  public recalculateTraits(character: ICharacter): void {
    character.allTraits = {};

    let learnedTraits = {};

    // base traits from self/learned
    if (isPlayer(character)) {
      learnedTraits = this.game.traitHelper.getAllLearnedTraits(
        character as IPlayer,
      );
    } else {
      learnedTraits = (character as INPC).traitLevels ?? {};
    }

    Object.keys(learnedTraits).forEach((traitKey) => {
      this.addTraitLevel(character, traitKey, learnedTraits[traitKey]);
    });

    // traits from equipment
    Object.keys(character.items.equipment).forEach((itemSlot) => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // no bonus if we can't technically use the item
      if (
        isPlayer(character) &&
        !this.game.itemHelper.canGetBenefitsFromItem(character as IPlayer, item)
      ) {
        return;
      }

      // only some items give bonuses in hands
      const { itemClass, trait } = this.game.itemHelper.getItemProperties(
        item,
        ['itemClass', 'trait'],
      );
      if (
        [ItemSlot.RightHand, ItemSlot.LeftHand].includes(
          itemSlot as ItemSlot,
        ) &&
        !GivesBonusInHandItemClasses.includes(itemClass as ItemClass)
      ) {
        return;
      }

      if (trait) {
        this.addTraitLevel(character, trait.name, trait.level);
      }
    });

    // get benefits from inscribed rune scrolls
    if (isPlayer(character)) {
      (character as IPlayer).runes.forEach((rune) => {
        if (!rune) return;

        try {
          const item = this.game.itemHelper.getItemDefinition(rune);
          if (!item?.trait) return;

          this.addTraitLevel(character, item.trait.name, item.trait.level);
        } catch {}
      });
    }
  }

  // get the total stats from traits
  public getStatValueAddFromTraits(
    character: ICharacter,
  ): Partial<Record<Stat, number>> {
    const stats = {};

    Object.keys(character.allTraits ?? {}).forEach((trait) => {
      const traitRef = this.game.traitHelper.getTraitData(
        trait,
        `GSVAFT:${character.name}`,
      );
      if (!traitRef || !traitRef.statsGiven) return;

      Object.keys(traitRef.statsGiven).forEach((stat) => {
        if (!traitRef.statsGiven?.[stat]) return;

        stats[stat] = stats[stat] || 0;
        stats[stat] +=
          (traitRef.statsGiven[stat] ?? 0) *
          (this.game.traitHelper.traitLevel(character, trait) ?? 0);
      });
    });

    // handle reflective coating - boost spell reflect
    const reflectiveBoost = this.game.traitHelper.traitLevelValue(
      character,
      'ReflectiveCoating',
    );
    if (reflectiveBoost > 0) {
      stats[Stat.SpellReflectChance] = stats[Stat.SpellReflectChance] ?? 0;

      const leftHand = character.items.equipment[ItemSlot.LeftHand];
      const rightHand = character.items.equipment[ItemSlot.RightHand];

      if (
        leftHand &&
        this.game.itemHelper.getItemProperty(leftHand, 'itemClass') ===
          ItemClass.Shield
      ) {
        stats[Stat.SpellReflectChance] += reflectiveBoost;
      }

      if (
        rightHand &&
        this.game.itemHelper.getItemProperty(rightHand, 'itemClass') ===
          ItemClass.Shield
      ) {
        stats[Stat.SpellReflectChance] += reflectiveBoost;
      }
    }

    // handle unarmored savant - set base mitigation
    const savantBoost = this.game.traitHelper.traitLevelValue(
      character,
      'UnarmoredSavant',
    );
    if (savantBoost > 0) {
      stats[Stat.Mitigation] = stats[Stat.Mitigation] ?? 0;

      // if you have a main hand item, your bonus is cut in half
      const mainHandItemMultiplier = character.items.equipment[
        ItemSlot.RightHand
      ]
        ? 0.5
        : 1;

      const item = character.items.equipment[ItemSlot.Armor];
      const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');

      if (
        !item ||
        [ItemClass.Cloak, ItemClass.Robe, ItemClass.Fur].includes(itemClass)
      ) {
        stats[Stat.Mitigation] += savantBoost * mainHandItemMultiplier;

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

    if (isPlayer(character)) {
      bonusStats = (character as IPlayer).quests.questStats;
    }

    const defaultMove =
      this.game.contentManager.getGameSetting('character', 'defaultMove') ?? 3;

    // reset stats to the base values
    character.totalStats = Object.assign({}, character.stats);
    character.totalStats[Stat.Move] =
      character.totalStats[Stat.Move] ?? defaultMove;

    const addStat = (stat: Stat, bonus: number) => {
      character.totalStats[stat] = character.totalStats[stat] || 0;
      character.totalStats[stat]! += bonus ?? 0;
      character.totalStats[stat] = Math.max(character.totalStats[stat]!, 0);
    };

    // add quest completion bonuses
    Object.keys(bonusStats).forEach((stat) => {
      addStat(stat as Stat, bonusStats[stat]);
    });

    // add hidden allegiance bonuses
    const allegianceStats = this.game.contentManager.allegianceStatsData;
    (allegianceStats[character.allegiance] || []).forEach(({ stat, value }) => {
      addStat(stat, value);
    });

    // calculate stats from gear
    Object.keys(character.items.equipment).forEach((itemSlot) => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      // no bonus if we can't technically use the item
      if (
        isPlayer(character) &&
        !this.game.itemHelper.canGetBenefitsFromItem(character as IPlayer, item)
      ) {
        return;
      }

      // only some items give bonuses in hands
      const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');
      if (
        [ItemSlot.RightHand, ItemSlot.LeftHand].includes(
          itemSlot as ItemSlot,
        ) &&
        !GivesBonusInHandItemClasses.includes(itemClass)
      ) {
        return;
      }

      // shields don't work in right hand unless you have the trait
      if (
        itemClass === ItemClass.Shield &&
        itemSlot === ItemSlot.RightHand &&
        !this.game.traitHelper.traitLevel(character, 'Shieldbearer')
      ) {
        return;
      }

      Object.values(Stat).forEach((stat) => {
        const bonus = this.game.itemHelper.getStat(item, stat);
        addStat(stat, bonus);
      });
    });

    // get trait/effect stats
    const traitStatBoosts = this.getStatValueAddFromTraits(character);
    const effectStatBoosts = effectStatBonuses(character);

    const addStatsFromHash = (hash) => {
      Object.keys(hash).forEach((stat) => {
        character.totalStats[stat] = character.totalStats[stat] || 0;
        character.totalStats[stat] += hash[stat];
      });
    };

    addStatsFromHash(traitStatBoosts);
    addStatsFromHash(effectStatBoosts);

    // set hp/mp
    if (character.totalStats.hp) {
      character.hp.maximum = character.totalStats.hp;
      character.hp.current = Math.min(
        character.hp.current,
        character.hp.maximum,
      );
    }

    if (character.totalStats.mp) {
      character.mp.maximum = character.totalStats.mp;
      character.mp.current = Math.min(
        character.mp.current,
        character.mp.maximum,
      );
    }

    // can't move more than one screen at a time
    const maxMove =
      this.game.contentManager.getGameSetting('character', 'maxMove') ?? 4;
    character.totalStats[Stat.Move] = clamp(
      character.totalStats[Stat.Move] ?? 0,
      0,
      maxMove,
    );

    // if we're a player and our perception changes, we do a full visual update
    const state = this.game.worldManager.getMap(character.map)?.state;
    if (!state) return;

    if (
      isPlayer(character) &&
      oldPerception !== character.totalStats[Stat.Perception]
    ) {
      state.triggerFullUpdateForPlayer(character as Player);
    }

    // update stealth to do hide reductions
    if ((character.totalStats[Stat.Stealth] ?? 0) > 0) {
      character.totalStats[Stat.Stealth] = Math.max(
        0,
        (character.totalStats[Stat.Stealth] ?? 0) -
          this.getStealthPenalty(character),
      );

      // if the stealth is different we gotta trigger an update
      if (oldStealth !== character.totalStats[Stat.Stealth]) {
        state.triggerPlayerUpdateInRadius(character.x, character.y);
      }
    }
  }

  // hp regen is a min of 1, affected by a con modifier past 21
  public getHPRegen(character: ICharacter): number {
    const baseHPRegen = 1 + getStat(character, Stat.HPRegen);
    const hpRegenSlidingCon =
      this.game.contentManager.getGameSetting(
        'character',
        'hpRegenSlidingCon',
      ) ?? 21;
    return Math.max(
      baseHPRegen,
      baseHPRegen +
        Math.max(0, getStat(character, Stat.CON) - hpRegenSlidingCon),
    );
  }

  // thieves and warriors have different mpregen setups
  public getMPRegen(character: ICharacter): number {
    const base = getStat(character, Stat.MPRegen);
    let boost = 0;

    const usesMana = this.game.contentManager.getClassConfigSetting<'usesMana'>(
      character.baseClass,
      'usesMana',
    );

    // healers and mages get a boost because their primary function is spellcasting
    if (usesMana) {
      boost =
        this.game.contentManager.getGameSetting(
          'character',
          'defaultCasterMPRegen',
        ) ?? 10;
    }

    const regensLikeThief =
      this.game.contentManager.getClassConfigSetting<'regensLikeThief'>(
        character.baseClass,
        'regensLikeThief',
      );

    // thieves not in combat regen faster
    if (regensLikeThief) {
      // hidden thieves can regen stealth slightly faster based on their mpregen
      if (hasEffect(character, 'Hidden')) {
        const hiddenRegen = Math.max(
          0,
          Math.floor(
            base *
              this.game.traitHelper.traitLevelValue(
                character,
                'ReplenishingShadows',
              ),
          ),
        );

        return hiddenRegen;
      }

      // singing thieves have a way to get their stealth back
      if (hasEffect(character, 'Singing')) return 0;

      // thieves in combat get 10 base regen + 20% of their mp regen for every RR level
      if (character.combatTicks <= 0) {
        const regenStealth =
          Math.max(
            0,
            Math.floor(
              base *
                this.game.traitHelper.traitLevelValue(
                  character,
                  'ReplenishingReverberation',
                ),
            ),
          ) +
          (this.game.contentManager.getGameSetting(
            'character',
            'thiefOOCRegen',
          ) ?? 10);

        return regenStealth;
      }

      return (
        this.game.contentManager.getGameSetting('character', 'thiefICRegen') ??
        1
      );
    }

    const regensLikeWarrior =
      this.game.contentManager.getClassConfigSetting<'regensLikeWarrior'>(
        character.baseClass,
        'regensLikeWarrior',
      );

    // warriors are the inverse of thieves
    if (regensLikeWarrior) {
      if (character.combatTicks <= 0) {
        return (
          this.game.contentManager.getGameSetting(
            'character',
            'warriorOOCRegen',
          ) ?? -3
        );
      }
      return (
        this.game.contentManager.getGameSetting(
          'character',
          'warriorICRegen',
        ) ?? 3
      );
    }

    return base + boost;
  }

  // get the stealth value for a character
  public getStealth(char: ICharacter): number {
    let stealth =
      getSkillLevel(char, Skill.Thievery) +
      char.level +
      getStat(char, Stat.AGI);

    const hasStealthBonus =
      this.game.contentManager.getClassConfigSetting<'hasStealthBonus'>(
        char.baseClass,
        'hasStealthBonus',
      );

    if (hasStealthBonus) {
      stealth *=
        this.game.contentManager.getGameSetting(
          'character',
          'thiefStealthMultiplier',
        ) ?? 1.5;
    }

    if (hasEffect(char, 'Encumbered')) {
      stealth /=
        this.game.contentManager.getGameSetting(
          'character',
          'stealthEncumberDivisor',
        ) ?? 2;
    }

    return Math.floor(stealth);
  }

  public getStealthPenalty(char: ICharacter): number {
    const leftHandClass = char.items.equipment[ItemSlot.LeftHand]
      ? this.game.itemHelper.getItemProperty(
          char.items.equipment[ItemSlot.LeftHand],
          'itemClass',
        )
      : null;

    const rightHandClass = char.items.equipment[ItemSlot.RightHand]
      ? this.game.itemHelper.getItemProperty(
          char.items.equipment[ItemSlot.RightHand],
          'itemClass',
        )
      : null;

    const hideReductions = this.game.contentManager.hideReductionsData;
    const totalReduction =
      hideReductions[leftHandClass] ||
      0 + (hideReductions[rightHandClass] || 0);
    const shadowSheathMultiplier = Math.max(
      0,
      1 - this.game.traitHelper.traitLevelValue(char, 'ShadowSheath'),
    );

    return Math.floor(totalReduction * shadowSheathMultiplier);
  }

  // get perception value for a character
  public getPerception(char: ICharacter): number {
    let perception =
      getStat(char, Stat.Perception) + char.level + getStat(char, Stat.WIS);

    const hasPerceptionBonus =
      this.game.contentManager.getClassConfigSetting<'hasPerceptionBonus'>(
        char.baseClass,
        'hasPerceptionBonus',
      );

    if (hasPerceptionBonus) perception *= 1.5;

    return perception;
  }

  // tick the character - do regen
  public tick(character: ICharacter, tick: number): void {
    if (isDead(character)) return;

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

      if (character.hp.current + hpRegen > 0) heal(character, hpRegen);
      mana(character, mpRegen);
    }
  }

  // check if there exists an equipment effect on a character
  public equipmentEffectCount(character: ICharacter, effect: string): number {
    return Object.keys(character.items.equipment).filter((itemSlot) => {
      const item = character.items.equipment[itemSlot];
      if (!item) return false;

      const equipEffect = this.game.itemHelper.getItemProperty(
        item,
        'equipEffect',
      );
      if (!equipEffect) return;

      return equipEffect.name === effect;
    }).length;
  }

  // check gear and try to cast effects
  public tryToCastEquipmentEffects(character: ICharacter) {
    Object.keys(character.items.equipment).forEach((itemSlot) => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      const { equipEffect, itemClass } = this.game.itemHelper.getItemProperties(
        item,
        ['equipEffect', 'itemClass'],
      );
      if (!equipEffect) return;

      if (
        EquipHash[itemClass as ItemClass] &&
        EquipHash[itemClass as ItemClass] !== itemSlot
      ) {
        return;
      }

      if (!this.game.itemHelper.canGetBenefitsFromItem(character, item)) return;

      const existingEffect = getEffect(character, equipEffect.name);
      if (existingEffect && existingEffect.endsAt === -1) return;

      const effectData = this.game.effectManager.getEffectData(
        equipEffect.name,
        'TTCEE',
      );

      if (effectData.effect.extra.unique) {
        const query = isString(effectData.effect.extra.unique)
          ? effectData.effect.extra.unique
          : equipEffect.name;
        const hasSimilar = this.game.effectHelper.hasSimilarEffects(
          character,
          query,
        );

        if (hasSimilar) return;
      }

      this.game.effectHelper.addEffect(character, '', equipEffect.name, {
        effect: {
          duration: -1,
          extra: {
            potency: equipEffect.potency ?? 1,
            persistThroughDeath: true,
          },
        },
      });
    });
  }

  // try to break items that have a limited number of uses
  public abuseItemsForLearnedSkillAndGetEffect(
    character: ICharacter,
    spell: string,
  ): IItemEffect | undefined {
    if (
      character.learnedSpells[spell.toLowerCase()] !== LearnedSpell.FromItem
    ) {
      return;
    }

    let foundItem!: ISimpleItem;
    let foundSlot!: ItemSlot;
    let foundEffect!: IItemEffect;

    Object.keys(character.items.equipment).forEach((slot) => {
      if (foundSlot || foundEffect || foundItem) return;

      const item = character.items.equipment[slot];
      if (!item) return;

      const { useEffect, itemClass } = this.game.itemHelper.getItemProperties(
        item,
        ['useEffect', 'itemClass'],
      );
      if (
        !useEffect ||
        useEffect.name.toLowerCase() !== spell.toLowerCase() ||
        itemClass === ItemClass.Bottle
      ) {
        return;
      }

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
