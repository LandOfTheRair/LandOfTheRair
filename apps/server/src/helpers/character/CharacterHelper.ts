import { Injectable } from 'injection-js';
import { clamp, isString, random } from 'lodash';

import {
  effectCountEquipment,
  effectStatBonuses,
  getEffect,
  hasEffect,
} from '@lotr/effects';
import type {
  ICharacter,
  ICharacterHelper,
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
  Stat,
} from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

import {
  characterStatValueFromTraits,
  getStat,
  hasHeldItem,
  heal,
  isDead,
  isPet,
  isPlayer,
  mana,
  recalculateLearnedSpells,
  recalculateTraits,
  regenHPGet,
  regenMPGet,
  stealthPenaltyGet,
} from '@lotr/characters';
import {
  coreAllegianceStats,
  itemCanGetBenefitsFrom,
  itemGetStat,
  itemPropertiesGet,
  itemPropertyGet,
  settingClassConfigGet,
  settingGameGet,
  settingGetMaxStats,
  traitLevel,
  traitLevelValue,
} from '@lotr/content';
import { rollInOneHundred } from '@lotr/rng';
import { cleanNumber } from '@lotr/shared';
import type { Player } from '../../models';

@Injectable()
export class CharacterHelper extends BaseService implements ICharacterHelper {
  public init() {}

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
      const { equipEffect, itemClass, corpseUsername } = itemPropertiesGet(
        oldItem,
        ['equipEffect', 'itemClass', 'corpseUsername'],
      );

      if (equipEffect) {
        const oldEffectCount = effectCountEquipment(char, equipEffect.name);
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
      const { itemClass, equipEffect, corpseUsername } = itemPropertiesGet(
        item,
        ['itemClass', 'equipEffect', 'corpseUsername'],
      );

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
    const danceLevel = traitLevelValue(char, 'DivineDancing');
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
        traitLevelValue(char, 'DeathGrip') +
        traitLevelValue(char, 'AncientGrip');
      if (rollInOneHundred(value)) return;
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

    if (amount < 0) return;

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

    const hardBaseCap = settingGetMaxStats();

    // cannot exceed the hard cap
    if (curStat + cleanValue > hardBaseCap) return false;

    // but if we're under it, we boost
    character.stats[stat] = (character.stats[stat] ?? 1) + cleanValue;

    // recalculate stats
    this.characterStatTotalsCalculate(character);

    return true;
  }

  // recalculate everything, basically when equipment changes usually
  public recalculateEverything(character: ICharacter): void {
    recalculateTraits(character);
    recalculateLearnedSpells(character);
    this.characterStatTotalsCalculate(character);
    this.checkEncumberance(character);
  }

  // check if this character is encumbered
  public checkEncumberance(character: ICharacter): void {
    // only players can be encumbered
    if (!isPlayer(character)) return;

    const canBeEncumbered = settingClassConfigGet<'canBeEncumbered'>(
      character.baseClass,
      'canBeEncumbered',
    );

    // some classes can wear heavy armor
    if (!canBeEncumbered) {
      return;
    }

    // lightenarmor trait means no encumber as well, also clear encumber in rare cases that it matters
    if (traitLevelValue(character, 'LightenArmor')) {
      this.game.effectHelper.removeEffectByName(character, 'Encumbered');
      return;
    }

    let castEncumber = false;
    Object.values(character.items.equipment).forEach((item) => {
      const isHeavy = itemPropertyGet(item, 'isHeavy');
      if (!isHeavy) return;

      castEncumber = true;
    });

    if (castEncumber) {
      this.game.effectHelper.addEffect(character, '', 'Encumbered');
    } else if (hasEffect(character, 'Encumbered')) {
      this.game.effectHelper.removeEffectByName(character, 'Encumbered');
    }
  }

  // calculate the total stats for a character from their current loadout
  public characterStatTotalsCalculate(character: ICharacter): void {
    const oldPerception = character.totalStats[Stat.Perception];
    const oldStealth = character.totalStats[Stat.Stealth];

    let bonusStats = {};

    if (isPlayer(character)) {
      bonusStats = (character as IPlayer).quests.questStats;
    }

    const defaultMove = settingGameGet('character', 'defaultMove') ?? 3;

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
    const allegianceStats = coreAllegianceStats();
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
        !itemCanGetBenefitsFrom(character as IPlayer, item)
      ) {
        return;
      }

      // only some items give bonuses in hands
      const itemClass = itemPropertyGet(item, 'itemClass');
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
        !traitLevel(character, 'Shieldbearer')
      ) {
        return;
      }

      Object.values(Stat).forEach((stat) => {
        const bonus = itemGetStat(item, stat);
        addStat(stat, bonus);
      });
    });

    // get trait/effect stats
    const traitStatBoosts = characterStatValueFromTraits(character);
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
    const maxMove = settingGameGet('character', 'maxMove') ?? 4;
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
          stealthPenaltyGet(character),
      );

      // if the stealth is different we gotta trigger an update
      if (oldStealth !== character.totalStats[Stat.Stealth]) {
        state.triggerPlayerUpdateInRadius(character.x, character.y);
      }
    }
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
      const hpRegen = regenHPGet(character);
      const mpRegen = regenMPGet(character);

      if (character.hp.current + hpRegen > 0) heal(character, hpRegen);
      mana(character, mpRegen);
    }
  }

  // check gear and try to cast effects
  public tryToCastEquipmentEffects(character: ICharacter) {
    Object.keys(character.items.equipment).forEach((itemSlot) => {
      const item = character.items.equipment[itemSlot];
      if (!item) return;

      const { equipEffect, itemClass } = itemPropertiesGet(item, [
        'equipEffect',
        'itemClass',
      ]);
      if (!equipEffect) return;

      if (
        EquipHash[itemClass as ItemClass] &&
        EquipHash[itemClass as ItemClass] !== itemSlot
      ) {
        return;
      }

      if (!itemCanGetBenefitsFrom(character, item)) return;

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

      const { useEffect, itemClass } = itemPropertiesGet(item, [
        'useEffect',
        'itemClass',
      ]);
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
