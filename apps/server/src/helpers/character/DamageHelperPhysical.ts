import type {
  ArmorClass,
  DamageArgs,
  ICharacter,
  IItemEffect,
  IItemEncrust,
  IPlayer,
  ISimpleItem,
  PhysicalAttackArgs,
  PhysicalAttackReturn,
  WeaponClass,
} from '@lotr/interfaces';
import {
  Allegiance,
  CombatEffect,
  DamageClass,
  HandsClasses,
  ItemClass,
  ItemSlot,
  MessageType,
  Skill,
  SoundEffect,
  Stat,
} from '@lotr/interfaces';
import { darknessIsDarkAt } from '@lotr/visibility';
import { Injectable } from 'injection-js';
import { clamp, isNumber, random } from 'lodash';
import { BaseService } from '../../models/BaseService';

import {
  canGainSkillFromTarget,
  engageInCombat,
  getSkillLevel,
  getStat,
  isDead,
  isPlayer,
  mana,
  manaDamage,
} from '@lotr/characters';
import {
  coreStatDamageMultipliers,
  coreWeaponTiers,
  coreWeaponTiersNPC,
  effectExists,
  getHandsItem,
  isShield,
  isWeapon,
  itemCanGetBenefitsFrom,
  itemIsBroken,
  itemIsOwnedAndUnbroken,
  itemPropertiesGet,
  itemPropertyGet,
  itemPropertySet,
  settingClassConfigGet,
  settingGameGet,
  traitLevel,
  traitLevelValue,
} from '@lotr/content';
import { getEffect, hasEffect } from '@lotr/effects';
import { calcSkillLevelForCharacter } from '@lotr/exp';
import {
  oneInX,
  oneToLUK,
  rollInOneHundred,
  rollTraitValue,
  uniformRoll,
} from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';

interface WeaponAttackStats {
  damage: number[];
  variance: { min: number; max: number };
  scaling: number[];
  bonus: number[];
  weakPercent: number;
  strongPercent: number;
}

interface AttackerScope {
  skill: number;
  skill4: number;
  offense: number;
  accuracy: number;
  dex: number;
  damageStat: number;
  damageStat4: number;
  level: number;
  damage: number;
  isWeak: boolean;
  isStrong: boolean;
  weapon: ISimpleItem;
  attackerDamageStat: Stat.STR | Stat.DEX;
}

interface DefenderScope {
  skill: number;
  defense: number;
  agi: number;
  dex: number;
  dex4: number;
  armorClass: number;
  weaponAC: number;
  shieldAC: number;
  shieldDefense: number;
  offhandAC: number;
  offhandDefense: number;
  offhandSkill: number;
  level: number;
  mitigation: number;
  dodgeBonus: number;
  armor: ISimpleItem;
  blocker: ISimpleItem;
  shield?: ISimpleItem | undefined;
  offhand?: ISimpleItem | undefined;
}

@Injectable()
export class DamageHelperPhysical extends BaseService {
  private strongAttackBaseChance = 50;
  private weakAttackLuckReduction = 10;
  private attackVarianceBaseBonusRolls = 1;
  private attackVarianceStrongBonusRolls = 2;
  private skillDivisor = 4;
  private damageStatDivisor = 4;
  private defenseDexDivisor = 4;
  private defenseOffhandSkillDivisor = 4;
  private dodgeBonusDivisor = 10;
  private defenderBlockBonus = 1;
  private attackerAttackBonus = 10;
  private levelDifferenceRange = 10;
  private levelDifferenceMultiplier = 5;
  private mitigationMax = 75;

  private offhandDamageReduction = 0.8;
  private cstunConMultiplier = 21;
  private resourceConditionDamage = 50;

  public init() {
    this.strongAttackBaseChance =
      settingGameGet('combat', 'strongAttackBaseChance') ?? 50;
    this.weakAttackLuckReduction =
      settingGameGet('combat', 'weakAttackLuckReduction') ?? 10;
    this.attackVarianceBaseBonusRolls =
      settingGameGet('combat', 'attackVarianceBaseBonusRolls') ?? 1;
    this.attackVarianceStrongBonusRolls =
      settingGameGet('combat', 'attackVarianceStrongBonusRolls') ?? 2;
    this.skillDivisor = settingGameGet('combat', 'skillDivisor') ?? 4;
    this.damageStatDivisor = settingGameGet('combat', 'damageStatDivisor') ?? 4;
    this.defenseDexDivisor = settingGameGet('combat', 'defenseDexDivisor') ?? 4;
    this.defenseOffhandSkillDivisor =
      settingGameGet('combat', 'defenseOffhandSkillDivisor') ?? 4;
    this.dodgeBonusDivisor =
      settingGameGet('combat', 'dodgeBonusDivisor') ?? 10;
    this.defenderBlockBonus =
      settingGameGet('combat', 'defenderBlockBonus') ?? 1;
    this.attackerAttackBonus =
      settingGameGet('combat', 'attackerAttackBonus') ?? 10;
    this.levelDifferenceRange =
      settingGameGet('combat', 'levelDifferenceRange') ?? 10;
    this.levelDifferenceMultiplier =
      settingGameGet('combat', 'levelDifferenceMultiplier') ?? 5;
    this.mitigationMax = settingGameGet('combat', 'mitigationMax') ?? 75;

    this.offhandDamageReduction =
      settingGameGet('character', 'offhandDamageReduction') ?? 0.8;
    this.cstunConMultiplier =
      settingGameGet('combat', 'cstunConMultiplier') ?? 21;
    this.resourceConditionDamage =
      settingGameGet('combat', 'resourceConditionDamage') ?? 50;
  }

  // do a physical attack, and if possible, do it from the offhand too
  public physicalAttack(
    attacker: ICharacter,
    defender: ICharacter,
    args: PhysicalAttackArgs,
  ): PhysicalAttackReturn {
    const res = this.handlePhysicalAttack(attacker, defender, args);

    const {
      returnsOnThrow,
      offhand,
      itemClass: offhandItemClass,
    } = itemPropertiesGet(attacker.items.equipment[ItemSlot.LeftHand], [
      'returnsOnThrow',
      'offhand',
      'itemClass',
    ]);

    const canOffhand =
      offhand ||
      traitLevel(attacker, 'BalancedGrip') ||
      (traitLevel(attacker, 'DaggerExcellence') &&
        offhandItemClass === ItemClass.Dagger);

    const shouldOffhandAttackAsWell =
      (!args.isThrow && !args.isKick && !args.isPunch) ||
      (args.isThrow &&
        (returnsOnThrow || traitLevel(attacker, 'BoomerangArm')));

    if (
      shouldOffhandAttackAsWell &&
      canOffhand &&
      attacker.items.equipment[ItemSlot.RightHand] &&
      attacker.items.equipment[ItemSlot.LeftHand]
    ) {
      args ??= {};
      args.isOffhand = true;
      args.throwHand = ItemSlot.LeftHand;
      this.handlePhysicalAttack(attacker, defender, args);
    }

    this.game.movementHelper.faceTowards(attacker, defender);

    return res;
  }

  private getTierDataForAttacker(attacker: ICharacter) {
    const playerTiers = coreWeaponTiers();
    const npcTiers = coreWeaponTiersNPC();

    // player
    if (isPlayer(attacker)) return playerTiers;

    // player summon
    if (attacker.allegianceReputation?.[Allegiance.Enemy] < -10000) {
      return playerTiers;
    }

    // npc or npc summon
    return npcTiers;
  }

  // get the base damage information for a weapon
  private determineWeaponInformation(
    attacker: ICharacter,
    weapon: ISimpleItem,
    weaponSkill: number,
    bonusRolls = 0,
  ): {
    damage: number;
    isWeak: boolean;
    isStrong: boolean;
  } {
    const { itemClass, tier, attackRange, twoHanded } = itemPropertiesGet(
      weapon,
      ['itemClass', 'tier', 'attackRange', 'twoHanded'],
    );

    let totalAttackRange = attackRange ?? 0;
    if (twoHanded) {
      totalAttackRange = Math.max(
        totalAttackRange,
        traitLevelValue(attacker, 'ExtendedReach'),
      );
    }

    let totalTier = tier ?? 1;
    if (
      itemClass === ItemClass.Hands ||
      itemClass === ItemClass.Gloves ||
      itemClass === ItemClass.Claws
    ) {
      totalTier += traitLevelValue(attacker, 'BrassKnuckles');
    }

    const hasOffhand = attacker.items.equipment[ItemSlot.LeftHand];
    if (!hasOffhand && !twoHanded && traitLevelValue(attacker, 'FirmGrip')) {
      totalTier += 1;
    }

    const allStatMultipliers = coreStatDamageMultipliers();
    const weaponTiers = this.getTierDataForAttacker(attacker);

    const scaleStat = (totalAttackRange ?? 0) > 2 ? Stat.DEX : Stat.STR;
    const statMultipliers: number[] = allStatMultipliers[scaleStat];
    let weaponStats: WeaponAttackStats =
      weaponTiers[itemClass ?? ItemClass.Mace];

    if (
      traitLevel(attacker, 'ThiefGrip') &&
      [ItemClass.Shortsword, ItemClass.Dagger].includes(
        itemClass as WeaponClass,
      )
    ) {
      weaponStats = weaponTiers[ItemClass.Longsword];
    }

    if (
      traitLevel(attacker, 'SmashingBoard') &&
      [ItemClass.Shield].includes(itemClass as WeaponClass)
    ) {
      weaponStats = weaponTiers[ItemClass.Mace];
    }

    if (!weaponStats) {
      return { damage: 0, isWeak: false, isStrong: false };
    }

    let attackerScaleStatValue = getStat(attacker, scaleStat);
    attackerScaleStatValue += Math.floor(
      attackerScaleStatValue * traitLevelValue(attacker, 'StrongMind'),
    );

    const scaleStatValue =
      statMultipliers[
        Math.min(statMultipliers.length - 1, attackerScaleStatValue)
      ];

    const { damage, variance, scaling, bonus, weakPercent, strongPercent } =
      weaponStats;

    // pre-calculate strong/weak hits
    const swashValue = Math.max(
      0,
      1 - traitLevelValue(attacker, 'Swashbuckler'),
    );
    const didFlub = rollInOneHundred(weakPercent * swashValue);
    const didCrit = rollInOneHundred(strongPercent);

    let canBeWeak = false;
    let canBeStrong = false;

    // 50/50 chance to use weak dice at 10 luk. more luk = more chance of crit
    const strongChance =
      this.strongAttackBaseChance +
      (oneToLUK(attacker) - this.weakAttackLuckReduction);

    if (rollInOneHundred(strongChance)) {
      canBeStrong = true;
    } else {
      canBeWeak = true;
    }

    // check if weak or strong hit
    const isWeak = canBeWeak && didFlub;
    const isStrong = canBeStrong && didCrit;

    const baseDamage = damage[totalTier ?? 0] ?? 1;

    // damage is baseDamage * scale value * stat scale value * (variance [rolled `bonusRolls` + 1 times])
    let totalDamage = baseDamage;
    totalDamage *= scaling[Math.min(scaling.length - 1, weaponSkill)];
    totalDamage *= scaleStatValue;

    // apply one variance hit + 1 per bonus roll
    let bonusDamage = 0;
    let totalBonusRolls = this.attackVarianceBaseBonusRolls + bonusRolls;

    // weak hits remove all variance, always hit the min possible
    if (isWeak) totalBonusRolls = 0;

    // strong hits add 2 bonus variance rolls
    if (isStrong) totalBonusRolls += this.attackVarianceStrongBonusRolls;

    for (let i = 0; i < totalBonusRolls; i++) {
      const varianceMultiplier = random(variance.min, variance.max) / 100;
      bonusDamage += totalDamage * varianceMultiplier;
    }

    totalDamage += bonusDamage;

    // add bonus damage based on skill to give weapons a little extra oomph early on
    totalDamage += random(0, bonus[Math.min(bonus.length - 1, weaponSkill)]);

    totalDamage = Math.floor(totalDamage);

    return { damage: totalDamage, isWeak, isStrong };
  }

  // resolve throwing and possibly breaking an item
  private resolveThrow(
    attacker: ICharacter,
    defender: ICharacter,
    hand: ItemSlot,
    item: ISimpleItem,
  ) {
    const { shots, itemClass, returnsOnThrow } = itemPropertiesGet(item, [
      'shots',
      'itemClass',
      'returnsOnThrow',
    ]);

    if (returnsOnThrow || traitLevel(attacker, 'BoomerangArm')) {
      return;
    }

    const breakTypes = {
      Bottle: 'You hear the sound of glass shattering!',
      Trap: 'You hear a mechanical snap and see parts fly all over!',
    };

    if (breakTypes[itemClass as ItemClass]) {
      this.game.characterHelper.setEquipmentSlot(attacker, hand, undefined);
      this.game.messageHelper.sendLogMessageToRadius(
        attacker,
        5,
        { message: breakTypes[itemClass as ItemClass] },
        [MessageType.Combat],
      );
    } else if (shots) {
      itemPropertySet(item, 'shots', shots - 1);

      if (shots - 1 <= 0) {
        this.game.characterHelper.setEquipmentSlot(attacker, hand, undefined);
      }
    } else {
      this.game.characterHelper.setEquipmentSlot(attacker, hand, undefined);

      const {
        state,
        x: dropX,
        y: dropY,
      } = this.game.worldManager.getMapStateAndXYForCharacterItemDrop(
        attacker,
        defender.x,
        defender.y,
      );
      state.addItemToGround(dropX, dropY, item);
    }
  }

  // check if the person you're attacking is the target (used for CFX)
  private determineIfTarget(
    attacker: ICharacter,
    defender: ICharacter,
    args: PhysicalAttackArgs,
  ): string | undefined {
    if (!defender) return '';
    if (isNumber(args.attackNum)) return undefined;
    if (defender.agro[attacker.uuid]) return defender.uuid;
    return '';
  }

  // get the attacker weapon
  private getWeaponForAttacker(
    attacker: ICharacter,
    args: PhysicalAttackArgs,
  ): ISimpleItem {
    const { isThrow, throwHand, isOffhand, isKick, isPunch } = args;

    let attackerWeapon: ISimpleItem | undefined;

    // check throws and grab the thrown hand first
    if (isThrow && throwHand) {
      attackerWeapon = attacker.items.equipment[throwHand];

      // otherwise we grab the offhand
    } else if (isOffhand) {
      attackerWeapon = attacker.items.equipment[ItemSlot.LeftHand];

      // otherwise, boots maybe?
    } else if (isKick) {
      attackerWeapon = attacker.items.equipment[ItemSlot.Feet] || {
        name: 'feet',
        uuid: 'feet',
        mods: {
          itemClass: ItemClass.Boots,
          type: Skill.Martial,
          tier: 1,
          condition: 20000,
        },
      };

      // but the general case, we grab the right hand and/or hands item
    } else {
      attackerWeapon = attacker.items.equipment[ItemSlot.RightHand];

      if (isPunch || !attackerWeapon) {
        attackerWeapon =
          attacker.items.equipment[ItemSlot.Hands] || getHandsItem();
      }
    }

    return attackerWeapon as ISimpleItem;
  }

  private getDefenderArmor(defender: ICharacter): {
    armor: ISimpleItem;
    blocker: ISimpleItem;
    shield: ISimpleItem | undefined;
    offhand: ISimpleItem | undefined;
  } {
    let defenderArmor: ISimpleItem | undefined;

    // check all of the valid armor slots
    if (
      !defenderArmor &&
      defender.items.equipment[ItemSlot.Robe2] &&
      !itemIsBroken(defender.items.equipment[ItemSlot.Robe2]!)
    ) {
      defenderArmor = defender.items.equipment[ItemSlot.Robe2];
    }

    if (
      !defenderArmor &&
      defender.items.equipment[ItemSlot.Robe1] &&
      !itemIsBroken(defender.items.equipment[ItemSlot.Robe1]!)
    ) {
      defenderArmor = defender.items.equipment[ItemSlot.Robe1];
    }

    if (
      !defenderArmor &&
      defender.items.equipment[ItemSlot.Armor] &&
      !itemIsBroken(defender.items.equipment[ItemSlot.Armor]!)
    ) {
      defenderArmor = defender.items.equipment[ItemSlot.Armor];
    }

    // no armor? get a default one
    if (!defenderArmor) {
      defenderArmor = {
        name: 'body',
        uuid: 'body',
        mods: { itemClass: ItemClass.Fur, condition: 20000 },
      };
    }

    const rightHand = defender.items.equipment[ItemSlot.RightHand];

    const defenderBlocker =
      rightHand && itemCanGetBenefitsFrom(defender, rightHand)
        ? rightHand
        : getHandsItem();

    const leftHand = defender.items.equipment[ItemSlot.LeftHand];
    const defenderShield =
      leftHand &&
      isShield(leftHand) &&
      itemCanGetBenefitsFrom(defender, leftHand)
        ? leftHand
        : undefined;
    const defenderOffhand =
      leftHand &&
      (itemPropertyGet(leftHand, 'offhand') ||
        traitLevel(defender, 'BalancedGrip')) &&
      itemCanGetBenefitsFrom(defender, leftHand)
        ? leftHand
        : undefined;

    return {
      armor: defenderArmor,
      blocker: defenderBlocker,
      shield: defenderShield,
      offhand: defenderOffhand,
    };
  }

  private getAttackerScope(
    attacker: ICharacter,
    weapon: ISimpleItem,
    args: PhysicalAttackArgs,
    levelDifference: number,
  ): AttackerScope {
    const { isThrow } = args;
    let { offhandMultiplier, accuracyLoss } = args;
    offhandMultiplier = offhandMultiplier ?? 1;
    accuracyLoss = accuracyLoss ?? 1;

    const { type, secondaryType, canShoot } = itemPropertiesGet(weapon, [
      'type',
      'secondaryType',
      'canShoot',
    ]);

    // get relevant skill info for attacker
    let attackerSkill =
      calcSkillLevelForCharacter(
        attacker,
        isThrow ? Skill.Throwing : (type as Skill),
      ) + 1;
    if (secondaryType) {
      attackerSkill = Math.floor(
        (attackerSkill +
          calcSkillLevelForCharacter(attacker, secondaryType as Skill)) /
          2,
      );
    }

    // get relevant stat info for attacker
    const attackerDamageStat =
      isThrow || type === Skill.Ranged ? Stat.DEX : Stat.STR;
    const baseDamageStat = getStat(attacker, attackerDamageStat);

    // get a base number of bonus attack rolls
    let bonusAttackRolls = getStat(attacker, Stat.WeaponDamageRolls);

    // if we have ammo, we grab the bonus from that
    const ammo = attacker.items.equipment[ItemSlot.Ammo];
    const ammoClass = itemPropertyGet(ammo, 'itemClass');

    if (canShoot && ammo && ammoClass !== ItemClass.Wand) {
      const { tier } = itemPropertiesGet(ammo, ['tier']);
      bonusAttackRolls +=
        (tier ?? 0) + traitLevelValue(attacker, 'StrongShots');
    }

    // if we have a wand, we grab the tier of it for bonus rolls
    if (ammoClass === ItemClass.Wand) {
      const { tier } = itemPropertiesGet(ammo, ['tier']);
      bonusAttackRolls += tier ?? 0;
    }

    const { damage, isWeak, isStrong } = this.determineWeaponInformation(
      attacker,
      weapon,
      attackerSkill,
      bonusAttackRolls,
    );

    let offense = Math.floor(
      getStat(attacker, Stat.Offense) * offhandMultiplier,
    );

    let accuracy =
      Math.floor(getStat(attacker, Stat.DEX) * offhandMultiplier) -
      accuracyLoss;

    // if an NPC is higher level than their target, we give them some sizable buffing
    if (!isPlayer(attacker) && levelDifference > 0) {
      offense += Math.floor(levelDifference / 2);
      accuracy += Math.floor(levelDifference / 2);
    }

    return {
      skill: attackerSkill,
      skill4: Math.floor(attackerSkill / this.skillDivisor),
      offense,
      accuracy,
      dex:
        Math.floor(getStat(attacker, Stat.DEX) * offhandMultiplier) +
        traitLevelValue(attacker, 'MartialAcuity'),
      damageStat: Math.floor(baseDamageStat * offhandMultiplier),
      damageStat4: Math.floor(
        (baseDamageStat / this.damageStatDivisor) * offhandMultiplier,
      ),
      level: attacker.level,
      damage,
      isWeak,
      isStrong,
      weapon,
      attackerDamageStat,
    };
  }

  private getDefenderScope(defender: ICharacter): DefenderScope {
    const {
      armor: defenderArmor,
      blocker: defenderBlocker,
      shield: defenderShield,
      offhand: defenderOffhand,
    } = this.getDefenderArmor(defender);

    let defenderACBoost =
      this.game.itemHelper.conditionACModifier(defenderArmor);
    if (defenderShield) {
      defenderACBoost +=
        this.game.itemHelper.conditionACModifier(defenderShield);
    }

    const armorStats = itemPropertyGet(
      defender.items.equipment[ItemSlot.Armor],
      'stats',
    );
    const { type: blockerType, stats: blockerStats } = itemPropertiesGet(
      defenderBlocker,
      ['type', 'stats'],
    );
    const { stats: shieldStats } = itemPropertiesGet(defenderShield, ['stats']);
    const { type: offhandType, stats: offhandStats } = itemPropertiesGet(
      defenderOffhand,
      ['type', 'stats', 'itemClass'],
    );

    const offhandACBoost =
      defenderOffhand && isWeapon(defenderOffhand)
        ? traitLevelValue(defender, 'MainGauche')
        : 0;

    return {
      skill: getSkillLevel(defender, blockerType as Skill) + 1,
      defense: getStat(defender, Stat.Defense),
      agi: getStat(defender, Stat.AGI),
      dex: getStat(defender, Stat.DEX),
      dex4: Math.floor(getStat(defender, Stat.DEX) / this.defenseDexDivisor),
      armorClass: getStat(defender, Stat.ArmorClass) + defenderACBoost,
      weaponAC: blockerStats?.[Stat.WeaponArmorClass] ?? 0,
      shieldAC: shieldStats?.[Stat.ArmorClass] ?? 0,
      shieldDefense: shieldStats?.[Stat.Defense] ?? 0,
      offhandAC: offhandACBoost + (offhandStats?.[Stat.WeaponArmorClass] ?? 0),
      offhandDefense: offhandStats?.[Stat.Defense] ?? 0,
      offhandSkill: defenderOffhand
        ? Math.floor(getSkillLevel(defender, offhandType as Skill) + 1) /
          this.defenseOffhandSkillDivisor
        : 0,
      level: defender.level,
      mitigation: getStat(defender, Stat.Mitigation),
      dodgeBonus: Math.floor(
        (100 - (armorStats?.[Stat.Mitigation] ?? 0)) / this.dodgeBonusDivisor,
      ),
      armor: defenderArmor,
      blocker: defenderBlocker,
      shield: defenderShield,
      offhand: defenderOffhand,
    };
  }

  // try to dodge, return true if it worked
  private tryDodge(
    attacker: ICharacter,
    defender: ICharacter,
    attackerScope: AttackerScope,
    defenderScope: DefenderScope,
    args: PhysicalAttackArgs,
  ): boolean {
    const { attackRange, isBackstab, isMug, attackerName } = args;
    const weapon = attackerScope.weapon;

    const attackerBlockLeftSide = Math.floor(
      this.attackerAttackBonus + attackerScope.skill + attackerScope.offense,
    );
    const attackerBlockRightSide = Math.floor(
      attackerScope.dex + attackerScope.skill,
    );

    const defenderDodgeLeftSide = Math.floor(
      this.defenderBlockBonus + defenderScope.defense,
    );
    const defenderDodgeRightSide = Math.floor(
      defenderScope.dex4 + defenderScope.agi,
    );

    const attackerDodgeRoll =
      uniformRoll(attackerBlockLeftSide, attackerBlockRightSide) +
      attackerScope.accuracy;

    let defenderDodgeRoll =
      -uniformRoll(defenderDodgeLeftSide, defenderDodgeRightSide) +
      defenderScope.dodgeBonus;

    const defenderDodgeBoost = traitLevelValue(defender, 'MartialAgility');
    if (
      !defender.items.equipment[ItemSlot.RightHand] &&
      defenderDodgeBoost > 0
    ) {
      defenderDodgeRoll *= 1 + defenderDodgeBoost;
    }

    let attackDistance = attackRange ? attackRange : 0;
    const distBetween = distanceFrom(attacker, defender);

    if (isBackstab || isMug) {
      attackDistance = 0;
    }

    const dodgeRoll = random(defenderDodgeRoll, attackerDodgeRoll);

    let forceMiss = false;
    const mirrorImageEffect = getEffect(defender, 'MirrorImage');
    if (mirrorImageEffect) {
      forceMiss = true;

      mirrorImageEffect.effectInfo.charges ??= 0;
      mirrorImageEffect.effectInfo.charges--;
    }

    if (forceMiss || dodgeRoll < 0 || attackDistance < distBetween) {
      const itemClass = itemPropertyGet(weapon, 'itemClass');

      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.BlockMiss,
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: 'You miss!',
          sfx: (args?.attackNum ?? 0) > 0 ? undefined : SoundEffect.CombatMiss,
          setTarget: this.determineIfTarget(attacker, defender, args),
          logInfo: {
            type: 'miss',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name,
          },
        },
        [MessageType.Combat, MessageType.Self, MessageType.Miss],
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${attackerName} misses!`,
          logInfo: {
            type: 'miss',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name,
          },
        },
        [MessageType.Combat, MessageType.Other, MessageType.Miss],
      );

      return true;
    }

    return false;
  }

  // try to block with armor, return true if it worked
  private tryArmorBlock(
    attacker: ICharacter,
    defender: ICharacter,
    attackerScope: AttackerScope,
    defenderScope: DefenderScope,
    args: PhysicalAttackArgs,
  ): boolean {
    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const defenderBlockLeftSide = Math.floor(
      this.defenderBlockBonus + defenderScope.defense,
    );
    const defenderBlockRightSide = Math.floor(defenderScope.armorClass);

    const attackerBlockLeftSide = Math.floor(
      this.attackerAttackBonus + attackerScope.skill + attackerScope.offense,
    );
    const attackerBlockRightSide = Math.floor(
      attackerScope.dex + attackerScope.skill,
    );

    const attackerACRoll = Math.max(
      1,
      uniformRoll(attackerBlockLeftSide, attackerBlockRightSide),
    );
    const defenderACRoll = -uniformRoll(
      defenderBlockLeftSide,
      defenderBlockRightSide,
    );

    const acRoll = random(defenderACRoll, attackerACRoll);

    if (acRoll < 0) {
      const itemClass = itemPropertyGet(weapon, 'itemClass');

      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.BlockArmor,
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: 'You were blocked by armor!',
          sfx:
            (args?.attackNum ?? 0) > 0
              ? undefined
              : SoundEffect.CombatBlockArmor,
          setTarget: this.determineIfTarget(attacker, defender, args),
          logInfo: {
            type: 'block-armor',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Self,
          MessageType.Block,
          MessageType.Armor,
        ],
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${attackerName} was blocked by your armor!`,
          logInfo: {
            type: 'block-armor',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Other,
          MessageType.Block,
          MessageType.Armor,
        ],
      );

      this.game.itemHelper.loseCondition(defenderScope.armor, 1, defender);
      return true;
    }

    return false;
  }

  // try to block with weapon, return true if it worked
  private tryWeaponBlock(
    attacker: ICharacter,
    defender: ICharacter,
    attackerScope: AttackerScope,
    defenderScope: DefenderScope,
    args: PhysicalAttackArgs,
  ): boolean {
    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const attackerBlockLeftSide = Math.floor(
      this.attackerAttackBonus + attackerScope.skill + attackerScope.offense,
    );
    const attackerWeaponBlockRightSide = Math.floor(
      attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill,
    );

    const defenderWeaponBlockLeftSide =
      this.defenderBlockBonus + defenderScope.weaponAC;
    const defenderWeaponBlockRightSide = Math.floor(
      defenderScope.dex4 + defenderScope.skill,
    );

    const attackerWeaponBlockRoll = uniformRoll(
      attackerBlockLeftSide,
      attackerWeaponBlockRightSide,
    );
    const defenderWeaponBlockRoll = -uniformRoll(
      defenderWeaponBlockLeftSide,
      defenderWeaponBlockRightSide,
    );

    const acRoll = random(defenderWeaponBlockRoll, attackerWeaponBlockRoll);
    const canDefenderUseBlocker = itemIsOwnedAndUnbroken(
      defender,
      defenderScope.blocker,
    );

    if (acRoll < 0 && canDefenderUseBlocker) {
      const itemClass = itemPropertyGet(weapon, 'itemClass');
      const defenderItemClass = itemPropertyGet(
        defenderScope.blocker,
        'itemClass',
      );

      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.BlockWeapon,
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: `You were blocked by ${defender.name}'s ${defenderItemClass.toLowerCase()}!`,
          sfx:
            (args?.attackNum ?? 0) > 0
              ? undefined
              : SoundEffect.CombatBlockWeapon,
          setTarget: this.determineIfTarget(attacker, defender, args),
          logInfo: {
            type: 'block-weapon',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Self,
          MessageType.Block,
          MessageType.Weapon,
        ],
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${attackerName} was blocked by your ${defenderItemClass.toLowerCase()}!`,
          logInfo: {
            type: 'block-weapon',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Other,
          MessageType.Block,
          MessageType.Weapon,
        ],
      );

      this.game.itemHelper.loseCondition(defenderScope.blocker, 1, defender);
      return true;
    }

    return false;
  }

  // try to block with shield, return true if it worked
  private tryShieldBlock(
    attacker: ICharacter,
    defender: ICharacter,
    attackerScope: AttackerScope,
    defenderScope: DefenderScope,
    args: PhysicalAttackArgs,
  ): boolean {
    if (!defenderScope.shield) return false;

    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const defenderShieldBlockLeftSide = Math.floor(
      this.defenderBlockBonus +
        defenderScope.shieldDefense +
        defenderScope.shieldAC,
    );
    const defenderShieldBlockRightSide = Math.floor(
      defenderScope.dex4 + defenderScope.skill,
    );

    const attackerBlockLeftSide = Math.floor(
      this.attackerAttackBonus + attackerScope.skill + attackerScope.offense,
    );
    const attackerBlockRightSide = Math.floor(
      attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill,
    );

    const attackerShieldBlockRoll = Math.max(
      1,
      uniformRoll(attackerBlockLeftSide, attackerBlockRightSide),
    );
    const defenderShieldBlockRoll = -uniformRoll(
      defenderShieldBlockLeftSide,
      defenderShieldBlockRightSide,
    );

    const acRoll = random(attackerShieldBlockRoll, defenderShieldBlockRoll);
    const canDefenderUseShield = itemIsOwnedAndUnbroken(
      defender,
      defenderScope.blocker,
    );

    if (acRoll < 0 && canDefenderUseShield) {
      const itemClass = itemPropertyGet(weapon, 'itemClass');

      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.BlockShield,
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: `You were blocked by ${defender.name}'s shield!`,
          sfx:
            (args?.attackNum ?? 0) > 0
              ? undefined
              : SoundEffect.CombatBlockArmor,
          setTarget: this.determineIfTarget(attacker, defender, args),
          logInfo: {
            type: 'block-shield',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Self,
          MessageType.Block,
          MessageType.Shield,
        ],
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${attackerName} was blocked by your shield!`,
          logInfo: {
            type: 'block-shield',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Other,
          MessageType.Block,
          MessageType.Shield,
        ],
      );

      this.game.itemHelper.loseCondition(defenderScope.shield, 1, defender);
      return true;
    }

    return false;
  }

  // try to block with offhand weapon, return true if it worked
  private tryOffhandBlock(
    attacker: ICharacter,
    defender: ICharacter,
    attackerScope: AttackerScope,
    defenderScope: DefenderScope,
    args: PhysicalAttackArgs,
  ): boolean {
    if (!defenderScope.offhand) return false;

    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const attackerBlockLeftSide = Math.floor(
      this.attackerAttackBonus + attackerScope.skill + attackerScope.offense,
    );
    const attackerBlockRightSide = Math.floor(
      attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill,
    );

    const defenderOffhandBlockLeftSide = Math.floor(
      this.defenderBlockBonus +
        defenderScope.offhandDefense +
        defenderScope.offhandAC,
    );
    const defenderOffhandBlockRightSide = Math.floor(
      defenderScope.dex4 + defenderScope.offhandSkill,
    );

    const attackerOffhandBlockRoll = Math.max(
      1,
      uniformRoll(attackerBlockLeftSide, attackerBlockRightSide),
    );
    const defenderOffhandBlockRoll = -uniformRoll(
      defenderOffhandBlockLeftSide,
      defenderOffhandBlockRightSide,
    );

    const acRoll = random(attackerOffhandBlockRoll, defenderOffhandBlockRoll);
    const canDefenderUseOffhand = itemIsOwnedAndUnbroken(
      defender,
      defenderScope.offhand,
    );

    if (acRoll < 0 && canDefenderUseOffhand) {
      const itemClass = itemPropertyGet(weapon, 'itemClass');
      const defenderItemClass = itemPropertyGet(
        defenderScope.offhand,
        'itemClass',
      );

      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.BlockOffhand,
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: `You were blocked by ${defender.name}'s ${defenderItemClass.toLowerCase()}!`,
          sfx:
            (args?.attackNum ?? 0) > 0
              ? undefined
              : SoundEffect.CombatBlockWeapon,
          setTarget: this.determineIfTarget(attacker, defender, args),
          logInfo: {
            type: 'block-offhand',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Self,
          MessageType.Block,
          MessageType.Offhand,
        ],
      );

      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${attackerName} was blocked by your ${defenderItemClass.toLowerCase()}!`,
          logInfo: {
            type: 'block-offhand',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name,
          },
        },
        [
          MessageType.Combat,
          MessageType.Other,
          MessageType.Block,
          MessageType.Offhand,
        ],
      );

      this.game.itemHelper.loseCondition(defenderScope.offhand, 1, defender);
      return true;
    }

    return false;
  }

  // try to combat-stun from a melee hit
  private attemptToStun(
    attacker: ICharacter,
    defender: ICharacter,
    attackerWeapon: ISimpleItem,
  ): void {
    if (hasEffect(defender, 'Stun') || hasEffect(defender, 'RecentlyStunned')) {
      return;
    }

    const hasFleetOfFoot = hasEffect(defender, 'FleetOfFoot');
    const proneChance = itemPropertyGet(attackerWeapon, 'proneChance');

    // if we can prone a target, we prone a target
    if (!hasFleetOfFoot && proneChance > 0 && rollInOneHundred(proneChance)) {
      this.game.spellManager.castSpell('Push', undefined, defender, {
        potency: 999,
        chance: proneChance,
      });
    }

    // first we get the diff between atk STR and def CON
    // next we use that to modify the con multiplier - if atk STR > def CON then the multiplier goes down and vice-versa
    // then we multiply by the def CON to get our 1/x
    // this means there's always a chance of c-stun, but high con and having higher CON than your attackers will mitigate it effectively
    let conMultiplier = this.cstunConMultiplier;
    if (!attacker.items.equipment[ItemSlot.RightHand]) {
      conMultiplier -= traitLevelValue(attacker, 'StunningFist');
    }

    const defCon =
      getStat(defender, Stat.CON) *
      traitLevelValue(defender, 'CombatFortitude');

    const atkStr = getStat(attacker, Stat.STR);

    const diff = atkStr - defCon;
    conMultiplier = Math.max(1, conMultiplier - diff);

    if (oneInX(defCon * conMultiplier) && !hasEffect(defender, 'Stun')) {
      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        { message: "You've been knocked flat!" },
        [MessageType.Combat],
      );

      this.game.effectHelper.addEffect(defender, attacker, 'Stun', {
        effect: {
          duration: 3,
          extra: { disableMessages: true, disableRecently: true },
        },
      });
    }
  }

  private attemptToShadowSwap(attacker: ICharacter): void {
    if (!this.game.visibilityHelper.canHide(attacker)) return;
    if (!rollTraitValue(attacker, 'ShadowSwap')) return;

    this.game.messageHelper.sendLogMessageToPlayer(attacker, {
      message: 'You swap places with your shadow!',
    });
    this.game.effectHelper.addEffect(attacker, '', 'Hidden', {
      effect: { duration: -1 },
    });
  }

  private handlePhysicalAttack(
    attacker: ICharacter,
    defender: ICharacter,
    args: PhysicalAttackArgs,
  ): PhysicalAttackReturn {
    if (isDead(defender)) return { isDead: true };

    const { isThrow, throwHand, isOffhand, isKick } = args;
    let { isPunch, isBackstab, damageMult } = args;
    let isAttackerVisible = this.game.visibilityHelper.canSeeThroughStealthOf(
      defender,
      attacker,
    );

    if (
      darknessIsDarkAt(defender.map, defender.x, defender.y) &&
      !hasEffect(defender, 'DarkVision')
    ) {
      isAttackerVisible = false;
    }

    if (!isAttackerVisible && hasEffect(defender, 'Debilitate')) {
      isBackstab = true;
    }

    if (!isBackstab && rollTraitValue(attacker, 'ShadowDaggers')) {
      this.game.messageHelper.sendLogMessageToPlayer(attacker, {
        message: 'Your shadow daggers unsheathe themselves!',
      });
      isBackstab = true;
      args.backstabIgnoreRange = true;
    }

    args.attackerName = isAttackerVisible
      ? attacker?.name || 'somebody'
      : 'somebody';
    args.backstabIgnoreRange = args.backstabIgnoreRange ?? false;
    args.accuracyLoss = args.accuracyLoss ?? 0;
    args.damageClass = args.damageClass ?? DamageClass.Physical;
    args.offhandMultiplier = args.offhandMultiplier ?? 1;

    // this is a bit complicated, but how it works is offhands deal 20% damage by default
    if (isOffhand) {
      const reduction = this.offhandDamageReduction;
      args.offhandMultiplier =
        args.offhandMultiplier -
        reduction +
        traitLevelValue(attacker, 'OffhandFinesse');

      if (args.offhandMultiplier < 0.1) args.offhandMultiplier = 0.1;
    }

    const isAttackerPlayer = isPlayer(attacker);

    if (isDead(attacker) || isDead(defender)) {
      return { isDead: true };
    }

    engageInCombat(attacker);
    engageInCombat(defender);

    const attackerWeapon = this.getWeaponForAttacker(attacker, args);
    const { type, secondaryType, itemClass, canShoot, damageClass } =
      itemPropertiesGet(attackerWeapon, [
        'type',
        'secondaryType',
        'itemClass',
        'canShoot',
        'damageClass',
      ]);

    // if weapon has a custom damage type, use it
    if (damageClass) args.damageClass = damageClass;

    if (
      isAttackerPlayer &&
      !itemCanGetBenefitsFrom(attacker as IPlayer, attackerWeapon)
    ) {
      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        { message: 'You feel a burning sensation in your hands!' },
        [MessageType.Combat],
      );
      return {};
    }

    // if we have a hands, it is always a punch
    if (HandsClasses.includes(itemClass as ArmorClass)) isPunch = true;

    // flag skills for the attack
    if (isAttackerPlayer) {
      const flagSkills = [type ?? Skill.Martial];
      if (secondaryType) flagSkills.push(secondaryType);
      if (isThrow) flagSkills.push(Skill.Throwing);
      if (!isAttackerVisible || isBackstab || hasEffect(attacker, 'Hidden')) {
        flagSkills.push(Skill.Thievery);
      }

      this.game.playerHelper.flagSkill(
        attacker as IPlayer,
        flagSkills as Skill[],
      );
    }

    // if we have ammo equipped, shoot it if our weapon is pew-pew
    const ammo = attacker.items.equipment[ItemSlot.Ammo];
    const {
      shots,
      damageClass: ammoDamageClass,
      itemClass: ammoItemClass,
    } = itemPropertiesGet(ammo, ['damageClass', 'shots', 'itemClass']);

    if (canShoot && ammo && ammoItemClass !== ItemClass.Wand) {
      // if the ammo has a custom damage class, use that over everything else
      if (ammoDamageClass) {
        args.damageClass = ammoDamageClass;
      }

      const numShots = shots ?? 0;

      if (!rollTraitValue(attacker, 'EndlessQuiver')) {
        itemPropertySet(ammo, 'shots', numShots - 1);
        if (numShots - 1 <= 0) {
          this.game.characterHelper.setEquipmentSlot(
            attacker,
            ItemSlot.Ammo,
            undefined,
          );
        }
      }
    }

    // if we have "wand ammo" equipped, we can use it to change damage class (for non-bows)
    if (
      !canShoot &&
      ammo &&
      ammoDamageClass &&
      ammoItemClass === ItemClass.Wand
    ) {
      args.damageClass = ammoDamageClass;
    }

    const levelDifference = attacker.level - defender.level;

    const attackerScope = this.getAttackerScope(
      attacker,
      attackerWeapon,
      args,
      levelDifference,
    );
    const defenderScope = this.getDefenderScope(defender);

    this.game.characterHelper.addAgro(attacker, defender, 1);

    const lostAtkCondition = 1;
    this.game.itemHelper.loseCondition(
      attackerWeapon,
      lostAtkCondition,
      attacker,
    );

    const resolveThrow = () => {
      if (!isThrow || !throwHand) return;
      this.resolveThrow(attacker, defender, throwHand, attackerScope.weapon);
    };

    const canDefend = defender.allegiance !== Allegiance.NaturalResource;

    // spend forever attempting to hit the target
    const didDodge = canDefend
      ? this.tryDodge(attacker, defender, attackerScope, defenderScope, args)
      : false;
    if (didDodge) {
      resolveThrow();
      return { dodge: true };
    }

    const didArmorBlock = canDefend
      ? this.tryArmorBlock(
          attacker,
          defender,
          attackerScope,
          defenderScope,
          args,
        )
      : false;
    if (didArmorBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'armor' };
    }

    const didWeaponBlock = canDefend
      ? this.tryWeaponBlock(
          attacker,
          defender,
          attackerScope,
          defenderScope,
          args,
        )
      : false;
    if (didWeaponBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'weapon' };
    }

    const didShieldBlock = canDefend
      ? this.tryShieldBlock(
          attacker,
          defender,
          attackerScope,
          defenderScope,
          args,
        )
      : false;
    if (didShieldBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'shield' };
    }

    const didOffhandBlock = canDefend
      ? this.tryOffhandBlock(
          attacker,
          defender,
          attackerScope,
          defenderScope,
          args,
        )
      : false;
    if (didOffhandBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'offhand' };
    }

    // eyy, if you get here, that means you're out of hell. I mean, it means you can hit the target for real damage. probably.
    let damage = Math.floor(attackerScope.damage);

    damage += Math.floor(
      (damage * getStat(attacker, Stat.PhysicalBoostPercent)) / 100,
    );

    if (isOffhand && args.offhandMultiplier) {
      damage = Math.floor(damage * (args.offhandMultiplier ?? 0.2));
    }

    if (damage > 0) {
      const levelDifferenceModifier =
        clamp(
          attackerScope.level - defenderScope.level,
          -this.levelDifferenceRange,
          this.levelDifferenceRange,
        ) * this.levelDifferenceMultiplier;

      const mitigationModifier = Math.min(
        this.mitigationMax,
        defenderScope.mitigation -
          defenderScope.mitigation * (levelDifferenceModifier / 100),
      );

      const mitigatedDamage = Math.floor(damage * (mitigationModifier / 100));
      damage -= mitigatedDamage;
    }

    // message nonsense
    let msg = '';

    if (attacker.items.equipment[ItemSlot.RightHand] && !isKick && !isPunch) {
      msg = `${args.attackerName} hits with a ${(itemClass || 'item').toLowerCase()}!`;
    } else if (isKick) {
      msg = `${args.attackerName} kicks you!`;
    } else if (itemClass === ItemClass.Claws) {
      msg = `${args.attackerName} claws you!`;
    } else {
      msg = `${args.attackerName} punches you!`;
    }

    let damageType = 'was a successful strike';
    let criticality = 2;

    if (attackerScope.isWeak) {
      damageType = 'was a grazing blow';
      criticality = 1;
      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.HitWeak,
      );

      if (rollTraitValue(defender, 'SterlingArmor')) {
        damage = 0;
      }
    } else if (attackerScope.isStrong) {
      damageType = 'left a grievous wound';
      criticality = 4;
      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.HitStrong,
      );
    } else {
      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        CombatEffect.HitNormal,
      );
    }

    damageMult ??= 1;

    const attackerUsesRage =
      settingClassConfigGet<'castResource'>(
        attacker.baseClass,
        'castResource',
      ) === 'Rage';

    let isEnraged = false;
    const consumingRage = traitLevel(attacker, 'ConsumingRage');
    if (
      consumingRage &&
      attackerUsesRage &&
      attacker.mp.current > 30 &&
      rollInOneHundred(30)
    ) {
      isEnraged = true;
      damageMult += 0.2;
      manaDamage(attacker, 20);
    }

    if (isBackstab) {
      const bonusMultiplier = 1.5 + traitLevelValue(attacker, 'BetterBackstab');
      damageMult += bonusMultiplier;
    }

    const attackerOffhand = attacker.items.equipment[ItemSlot.LeftHand];
    if (attackerOffhand && isShield(attackerOffhand)) {
      damageMult += traitLevelValue(attacker, 'ShieldForce');
    }

    damage = Math.floor(damage * damageMult);

    const damageArgs: DamageArgs = {
      damage,
      damageClass: args.damageClass || DamageClass.Physical,
      isMelee: true,
      attackerDamageMessage:
        damage > 0
          ? `Your ${isEnraged ? 'enraged ' : ''}attack ${damageType}!`
          : '',
      defenderDamageMessage: msg,
      attackerWeapon,
      isRanged: attackerScope.attackerDamageStat === Stat.DEX,
      isWeak: attackerScope.isWeak,
      isStrong: attackerScope.isStrong,
      isAttackerVisible,
    };

    let totalDamageDealt = this.game.combatHelper.modifyDamage(
      attacker,
      defender,
      damageArgs,
    );

    if (defender.allegiance === Allegiance.NaturalResource) {
      totalDamageDealt = criticality;
      this.doExtraDurabilityDamageForNaturalResources(
        attacker,
        defender,
        attackerWeapon,
      );
    }

    damageArgs.damage = totalDamageDealt;
    damageArgs.attackNum = args.attackNum ?? 0;

    this.attemptToStun(attacker, defender, attackerWeapon);
    this.attemptToShadowSwap(attacker);

    this.game.combatHelper.dealDamage(attacker, defender, damageArgs);

    // if we're singing, try to do offensive encore
    if (hasEffect(attacker, 'Singing')) {
      const encoreBoost = traitLevelValue(attacker, 'OffensiveEncore');
      mana(attacker, encoreBoost);
    }

    // if our ammo was shot and can apply an effect, we give it a spin
    // we must have a bow to trigger ammo effects, it does not work for wand
    // similarly, we must have a melee weapon to trigger wand effects, but not ammo
    if (
      (canShoot && ammo && ammoItemClass !== ItemClass.Wand) ||
      (!canShoot && ammo && ammoItemClass === ItemClass.Wand)
    ) {
      const ammoStrikeEffect: IItemEffect = itemPropertyGet(
        ammo,
        'strikeEffect',
      );

      if (ammoStrikeEffect) {
        this.tryApplyItemEffect(attacker, defender, ammoStrikeEffect);
      }
    }

    const { strikeEffect: weaponStrikeEffect, encrustItem } = itemPropertiesGet(
      attackerWeapon,
      ['strikeEffect', 'encrustItem'],
    );

    // if it has an encrust strike effect, we apply it
    if (encrustItem) {
      const realEncrustItem = this.game.itemCreator.getSimpleItem(encrustItem);
      const encrustGive: IItemEncrust = itemPropertyGet(
        realEncrustItem,
        'encrustGive',
      );

      if (encrustGive.strikeEffect) {
        this.tryApplyItemEffect(attacker, defender, encrustGive.strikeEffect);
      }
    }

    // if our weapon has a strike effect, we apply it
    if (weaponStrikeEffect) {
      this.tryApplyItemEffect(attacker, defender, weaponStrikeEffect);
    }

    resolveThrow();

    if (totalDamageDealt <= 0) return { noDamage: true };

    if (isAttackerPlayer && canGainSkillFromTarget(defender)) {
      this.game.playerHelper.gainCurrentSkills(
        attacker as IPlayer,
        1 / (args.numAttacks ?? 1),
      );
    }

    return {
      hit: true,
      damage: totalDamageDealt,
      damageType: args.damageClass,
    };
  }

  private tryApplyItemEffect(
    attacker: ICharacter,
    defender: ICharacter,
    effect: IItemEffect,
  ) {
    if (effectExists(effect.name)) {
      if (rollInOneHundred(effect.chance ?? 100)) {
        this.game.effectHelper.addEffect(defender, attacker, effect.name, {
          effect: {
            duration: effect.duration,
            extra: {
              potency: effect.potency,
            },
          },
        });
      }
    } else {
      this.game.spellManager.castSpell(effect.name, attacker, defender, {
        potency: effect.potency,
        chance: effect.chance ?? 100,
      });
    }
  }

  private doExtraDurabilityDamageForNaturalResources(
    attacker: ICharacter,
    defender: ICharacter,
    attackerItem: ISimpleItem,
  ): void {
    const { itemClass, type, condition } = itemPropertiesGet(attackerItem, [
      'itemClass',
      'type',
      'condition',
    ]);

    // I mean, don't use bottles to attack ore veins
    if (itemClass === ItemClass.Bottle) {
      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        { message: 'Your bottle is in critical condition!' },
        [MessageType.Combat],
      );

      this.game.itemHelper.loseCondition(
        attackerItem,
        condition ?? 20000,
        attacker,
      );

      return;
    }

    const conditionDamage = this.resourceConditionDamage;
    let modifierMultiplier = 1;

    if (defender.name.includes('vein')) {
      if (type !== Skill.Mace) modifierMultiplier = 2;
    } else {
      if (type === Skill.Mace || type === Skill.Staff) modifierMultiplier = 2;
    }

    this.game.itemHelper.loseCondition(
      attackerItem,
      conditionDamage * modifierMultiplier,
      attacker,
    );
  }
}
