
import { Injectable } from 'injection-js';
import { clamp, random } from 'lodash';

import { ArmorClass, BaseClass, CombatEffect, DamageArgs, DamageClass, HandsClasses, ICharacter, IItemEffect, IItemEncrust, IPlayer,
  ISimpleItem, ItemClass, ItemSlot, MessageType, PhysicalAttackArgs, PhysicalAttackReturn, ShieldClasses,
  Skill, SoundEffect, Stat, WeaponClass } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

interface WeaponAttackStats {
  base: number;
  min: number;
  max: number;
  weakChance: number;
  damageBonus: number;
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
  damageRolls: number;
  damageBonus: number;
  isWeak: boolean;
  isStrong: boolean;
  weapon: ISimpleItem;
  attackerDamageStat: Stat.STR|Stat.DEX;
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
  shield?: ISimpleItem;
  offhand?: ISimpleItem;
}

export const BaseItemStatsPerTier: Partial<Record<WeaponClass & ArmorClass, WeaponAttackStats>> = {
  Arrow:                { base: 1, min: 0, max: 2, weakChance: 25, damageBonus: 10 },
  Axe:                  { base: 2, min: 0, max: 2, weakChance: 10, damageBonus: 0 },
  Blunderbuss:          { base: 2, min: 0, max: 4, weakChance: 30, damageBonus: 0 },
  Broadsword:           { base: 2, min: 0, max: 2, weakChance: 5,  damageBonus: 5 },
  Claws:                { base: 3, min: 0, max: 1, weakChance: 10, damageBonus: 0 },
  Club:                 { base: 1, min: 0, max: 1, weakChance: 10, damageBonus: 5 },
  Crossbow:             { base: 0, min: 0, max: 3, weakChance: 10, damageBonus: 5 },
  Dagger:               { base: 2, min: 0, max: 1, weakChance: 1,  damageBonus: 10 },
  Flail:                { base: 0, min: 1, max: 4, weakChance: 10, damageBonus: 0 },
  Gloves:               { base: 2, min: 0, max: 2, weakChance: 10, damageBonus: 5 },
  Hands:                { base: 1, min: 0, max: 1, weakChance: 10, damageBonus: 5 },
  Boots:                { base: 2, min: 1, max: 3, weakChance: 10, damageBonus: 5 },
  Greataxe:             { base: 5, min: 1, max: 2, weakChance: 10, damageBonus: 5 },
  Greatmace:            { base: 5, min: 1, max: 2, weakChance: 10, damageBonus: 5 },
  Greatsword:           { base: 3, min: 1, max: 4, weakChance: 10, damageBonus: 5 },
  Halberd:              { base: 1, min: 0, max: 8, weakChance: 5,  damageBonus: 0 },
  Hammer:               { base: 1, min: 0, max: 1, weakChance: 20, damageBonus: 10 },
  Longbow:              { base: 4, min: 1, max: 3, weakChance: 10, damageBonus: 0 },
  Longsword:            { base: 2, min: 1, max: 2, weakChance: 15, damageBonus: 5 },
  Mace:                 { base: 2, min: 0, max: 2, weakChance: 10, damageBonus: 5 },
  Saucer:               { base: 0, min: 0, max: 0, weakChance: 10, damageBonus: 0 },
  Shield:               { base: 0, min: 0, max: 0, weakChance: 10, damageBonus: 0 },
  Shortbow:             { base: 3, min: 1, max: 2, weakChance: 10, damageBonus: 0 },
  Shortsword:           { base: 1, min: 1, max: 3, weakChance: 15, damageBonus: 5 },
  Spear:                { base: 1, min: 0, max: 3, weakChance: 10, damageBonus: 0 },
  Staff:                { base: 2, min: 0, max: 1, weakChance: 35, damageBonus: 0 },
  Totem:                { base: 1, min: 0, max: 1, weakChance: 50, damageBonus: 0 },
  Wand:                 { base: 1, min: 0, max: 1, weakChance: 50, damageBonus: 0 }
};

@Injectable()
export class DamageHelperPhysical extends BaseService {

  constructor(
  ) {
    super();
  }

  public init() {}

  // do a physical attack, and if possible, do it from the offhand too
  public physicalAttack(attacker: ICharacter, defender: ICharacter, args: PhysicalAttackArgs): PhysicalAttackReturn {
    const res = this.handlePhysicalAttack(attacker, defender, args);

    const { returnsOnThrow, offhand } = this.game.itemHelper.getItemProperties(attacker.items.equipment[ItemSlot.LeftHand],
      ['returnsOnThrow', 'offhand']
    );

    const shouldOffhandAttackAsWell = (!args.isThrow && !args.isKick && !args.isPunch)
                                   || (args.isThrow && returnsOnThrow);

    if (shouldOffhandAttackAsWell && offhand) {
      args = args ?? {};
      args.isOffhand = true;
      args.throwHand = ItemSlot.LeftHand;
      this.handlePhysicalAttack(attacker, defender, args);
    }

    this.game.directionHelper.setDirRelativeTo(attacker, defender);

    return res;
  }

  // get the base damage information for a weapon
  private determineWeaponInformation(
    attacker: ICharacter, weapon: ISimpleItem, bonusRolls = 0
  ): {
      damageRolls: number; damageBonus: number; isWeak: boolean; isStrong: boolean;
    } {

    const { itemClass, tier } = this.game.itemHelper.getItemProperties(weapon, ['itemClass', 'tier']);

    if (!BaseItemStatsPerTier[itemClass as ItemClass]) {
      return { damageRolls: 0, damageBonus: 0, isWeak: false, isStrong: false };
    }

    const { base, min, max, weakChance, damageBonus } = BaseItemStatsPerTier[itemClass as ItemClass];

    let damageRolls = bonusRolls;
    const minTier = min * (tier as number);
    const maxTier = max * (tier as number);
    const baseTier = base * (tier as number);

    // go for a weak hit, rarely
    const swashValue = 1 - this.game.traitHelper.traitLevelValue(attacker, 'Swashbuckler');
    const didFlub = this.game.diceRollerHelper.XInOneHundred(weakChance * swashValue);
    const numRolls = didFlub ? minTier : random(minTier, maxTier);

    damageRolls += numRolls;

    // check if weak or strong hit
    const isWeak = min !== max && didFlub;
    const isStrong = min !== max && bonusRolls === maxTier;

    // add base tier damage if no flub
    if (!didFlub) damageRolls += baseTier;

    return { damageRolls, damageBonus: damageBonus * (tier as number), isWeak, isStrong };
  }

  // check if an item is a shield
  private isShield(item: ISimpleItem): boolean {
    const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');
    return ShieldClasses.includes(itemClass);
  }

  // resolve throwing and possibly breaking an item
  private resolveThrow(attacker: ICharacter, defender: ICharacter, hand: ItemSlot, item: ISimpleItem) {
    const { shots, itemClass, returnsOnThrow } = this.game.itemHelper.getItemProperties(item, ['shots', 'itemClass', 'returnsOnThrow']);

    if (returnsOnThrow) return;

    const breakTypes = {
      Bottle: 'You hear the sound of glass shattering!',
      Trap: 'You hear a mechanical snap and see parts fly all over!'
    };

    if (breakTypes[itemClass as ItemClass]) {
      this.game.characterHelper.setEquipmentSlot(attacker, hand, undefined);
      this.game.messageHelper.sendLogMessageToRadius(attacker, 5, { message: breakTypes[itemClass as ItemClass] }, [MessageType.Combat]);

    } else if (shots) {

      this.game.itemHelper.setItemProperty(item, 'shots', shots - 1);

      if (shots - 1 <= 0) {
        this.game.characterHelper.setEquipmentSlot(attacker, hand, undefined);
      }

    } else {
      this.game.characterHelper.setEquipmentSlot(attacker, hand, undefined);

      const { state } = this.game.worldManager.getMap(attacker.map);
      state.addItemToGround(defender.x, defender.y, item);
    }
  }

  // check if the person you're attacking is the target (used for CFX)
  private determineIfTarget(attacker: ICharacter, defender: ICharacter): string {
    if (!defender) return '';
    if (defender.agro[attacker.uuid]) return defender.uuid;
    return '';
  }

  // get the attacker weapon
  private getWeaponForAttacker(attacker: ICharacter, args: PhysicalAttackArgs): ISimpleItem {
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
        mods: { itemClass: ItemClass.Boots, type: Skill.Martial, tier: 1, condition: 20000 },
      };

    // but the general case, we grab the right hand and/or hands item
    } else {
      attackerWeapon = attacker.items.equipment[ItemSlot.RightHand];

      if (isPunch || !attackerWeapon) {
        attackerWeapon = attacker.items.equipment[ItemSlot.Hands] || {
          name: 'hands',
          uuid: 'hands',
          mods: { itemClass: ItemClass.Hands, type: Skill.Martial, tier: 1, condition: 20000 },
        };
      }
    }

    return attackerWeapon as ISimpleItem;
  }

  private getDefenderArmor(
    defender: ICharacter
  ): {
      armor: ISimpleItem; blocker: ISimpleItem; shield: ISimpleItem|undefined; offhand: ISimpleItem|undefined;
    } {
    let defenderArmor: ISimpleItem | undefined;

    // check all of the valid armor slots
    if (!defenderArmor && defender.items.equipment[ItemSlot.Robe2]
    && !this.game.itemHelper.isItemBroken(defender.items.equipment[ItemSlot.Robe2]!)) {
      defenderArmor = defender.items.equipment[ItemSlot.Robe2];
    }

    if (!defenderArmor && defender.items.equipment[ItemSlot.Robe1]
    && !this.game.itemHelper.isItemBroken(defender.items.equipment[ItemSlot.Robe1]!)) {
      defenderArmor = defender.items.equipment[ItemSlot.Robe1];
    }

    if (!defenderArmor && defender.items.equipment[ItemSlot.Armor]
    && !this.game.itemHelper.isItemBroken(defender.items.equipment[ItemSlot.Armor]!)) {
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

    const defenderBlocker = defender.items.equipment[ItemSlot.RightHand] || {
      name: 'hands',
      uuid: 'hands',
      mods: { itemClass: ItemClass.Hands, type: Skill.Martial, tier: 1, condition: 20000 },
    };

    const leftHand = defender.items.equipment[ItemSlot.LeftHand];
    const defenderShield = leftHand && this.isShield(leftHand) ? leftHand : undefined;
    const defenderOffhand = leftHand && this.game.itemHelper.getItemProperty(leftHand, 'offhand') ? leftHand : undefined;

    return {
      armor: defenderArmor,
      blocker: defenderBlocker,
      shield: defenderShield,
      offhand: defenderOffhand
    };
  }

  private getAttackerScope(attacker: ICharacter, weapon: ISimpleItem, args: PhysicalAttackArgs): AttackerScope {

    const { isThrow } = args;
    let { offhandMultiplier, accuracyLoss } = args;
    offhandMultiplier = offhandMultiplier ?? 1;
    accuracyLoss = accuracyLoss ?? 1;

    const { type, secondaryType, canShoot } = this.game.itemHelper.getItemProperties(weapon,
      ['type', 'secondaryType', 'canShoot']
    );

    // get relevant skill info for attacker
    let attackerSkill = this.game.calculatorHelper.calcSkillLevelForCharacter(attacker, isThrow ? Skill.Throwing : type as Skill) + 1;
    if (secondaryType) {
      attackerSkill = Math.floor(
        (attackerSkill + this.game.calculatorHelper.calcSkillLevelForCharacter(attacker, secondaryType as Skill)) / 2
      );
    }

    // get relevant stat info for attacker
    const attackerDamageStat = (isThrow || type === Skill.Ranged) ? Stat.DEX : Stat.STR;
    const baseDamageStat = this.game.characterHelper.getStat(attacker, attackerDamageStat);

    // get a base number of bonus attack rolls
    let bonusAttackRolls = this.game.characterHelper.getStat(attacker, Stat.WeaponDamageRolls);

    // if we have ammo, we grab the bonus from that
    const ammo = attacker.items.equipment[ItemSlot.Ammo];
    if (canShoot && ammo) {
      const { tier } = this.game.itemHelper.getItemProperties(ammo, ['tier', 'shots']);
      bonusAttackRolls += tier ?? 0;
    }

    const { damageRolls, damageBonus, isWeak, isStrong } = this.determineWeaponInformation(attacker, weapon, bonusAttackRolls);

    return {
      skill:        attackerSkill,
      skill4:       Math.floor(attackerSkill / 4),
      offense:      Math.floor(this.game.characterHelper.getStat(attacker, Stat.Offense) * offhandMultiplier),
      accuracy:     Math.floor(this.game.characterHelper.getStat(attacker, Stat.DEX) * offhandMultiplier) - accuracyLoss,
      dex:          Math.floor(this.game.characterHelper.getStat(attacker, Stat.DEX) * offhandMultiplier),
      damageStat:   Math.floor(baseDamageStat * offhandMultiplier),
      damageStat4:  Math.floor((baseDamageStat / 4) * offhandMultiplier),
      level:        attacker.level,
      damageRolls:  Math.max(1, damageRolls),
      damageBonus,
      isWeak,
      isStrong,
      weapon,
      attackerDamageStat
    };
  }

  private getDefenderScope(defender: ICharacter): DefenderScope {
    const {
      armor: defenderArmor, blocker: defenderBlocker, shield: defenderShield, offhand: defenderOffhand
    } = this.getDefenderArmor(defender);

    let defenderACBoost = this.game.itemHelper.conditionACModifier(defenderArmor);
    if (defenderShield) {
      defenderACBoost += this.game.itemHelper.conditionACModifier(defenderShield);
    }

    const armorStats = this.game.itemHelper.getItemProperty(defender.items.equipment[ItemSlot.Armor], 'stats');
    const { type: blockerType, stats: blockerStats } = this.game.itemHelper.getItemProperties(defenderBlocker, ['type', 'stats']);
    const { stats: shieldStats } = this.game.itemHelper.getItemProperties(defenderShield, ['stats']);
    const { type: offhandType, stats: offhandStats } = this.game.itemHelper.getItemProperties(defenderOffhand, ['type', 'stats']);

    return {
      skill:          this.game.characterHelper.getSkillLevel(defender, blockerType as Skill) + 1,
      defense:        this.game.characterHelper.getStat(defender, Stat.Defense),
      agi:            this.game.characterHelper.getStat(defender, Stat.AGI),
      dex:            this.game.characterHelper.getStat(defender, Stat.DEX),
      dex4:           Math.floor(this.game.characterHelper.getStat(defender, Stat.DEX) / 4),
      armorClass:     this.game.characterHelper.getStat(defender, Stat.ArmorClass) + defenderACBoost,
      weaponAC:       blockerStats?.[Stat.WeaponArmorClass] ?? 0,
      shieldAC:       shieldStats?.[Stat.ArmorClass] ?? 0,
      shieldDefense:  shieldStats?.[Stat.Defense] ?? 0,
      offhandAC:      offhandStats?.[Stat.WeaponArmorClass] ?? 0,
      offhandDefense: offhandStats?.[Stat.Defense] ?? 0,
      offhandSkill:   defenderOffhand ? Math.floor(this.game.characterHelper.getSkillLevel(defender, offhandType as Skill) + 1) / 4 : 0,
      level:          defender.level,
      mitigation:     this.game.characterHelper.getStat(defender, Stat.Mitigation),
      dodgeBonus:     Math.floor((100 - (armorStats?.[Stat.Mitigation] ?? 0)) / 10),
      armor:          defenderArmor,
      blocker:        defenderBlocker,
      shield:         defenderShield,
      offhand:        defenderOffhand
    };

  }

  // try to dodge, return true if it worked
  private tryDodge(
    attacker: ICharacter,
    defender: ICharacter,
    attackerScope: AttackerScope,
    defenderScope: DefenderScope,
    args: PhysicalAttackArgs
  ): boolean {
    const { attackRange, isBackstab, isMug, attackerName } = args;
    const weapon = attackerScope.weapon;

    const attackerBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense);
    const attackerBlockRightSide = Math.floor(attackerScope.dex + attackerScope.skill);

    const defenderDodgeLeftSide = Math.floor(1 + defenderScope.defense);
    const defenderDodgeRightSide = Math.floor(defenderScope.dex4 + defenderScope.agi);

    const attackerDodgeRoll = this.game.diceRollerHelper.uniformRoll(
      attackerBlockLeftSide, attackerBlockRightSide
    ) + attackerScope.accuracy;

    const defenderDodgeRoll = -this.game.diceRollerHelper.uniformRoll(
      defenderDodgeLeftSide, defenderDodgeRightSide
    ) + defenderScope.dodgeBonus;

    let attackDistance = attackRange ? attackRange : 0;
    const distBetween = this.game.directionHelper.distFrom(attacker, defender);

    if (isBackstab || isMug) {
      attackDistance = 0;
    }

    const dodgeRoll = random(defenderDodgeRoll, attackerDodgeRoll);

    if (dodgeRoll < 0 || attackDistance < distBetween) {

      const itemClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');

      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.BlockMiss);

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: 'You miss!',
          sfx: SoundEffect.CombatMiss,
          setTarget: this.determineIfTarget(attacker, defender),
          logInfo: {
            type: 'miss',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name
          }
        },
        [MessageType.Combat, MessageType.Self, MessageType.Miss]
      );

      this.game.messageHelper.sendLogMessageToPlayer(defender,
        {
          message: `${attackerName} misses!`,
          logInfo: {
            type: 'miss',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        },
        [MessageType.Combat, MessageType.Other, MessageType.Miss]
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
    args: PhysicalAttackArgs
  ): boolean {
    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const defenderBlockLeftSide = Math.floor(1 + defenderScope.defense);
    const defenderBlockRightSide = Math.floor(defenderScope.armorClass);

    const attackerBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense);
    const attackerBlockRightSide = Math.floor(attackerScope.dex + attackerScope.skill);

    const attackerACRoll = Math.max(1, this.game.diceRollerHelper.uniformRoll(attackerBlockLeftSide, attackerBlockRightSide));
    const defenderACRoll = -this.game.diceRollerHelper.uniformRoll(defenderBlockLeftSide, defenderBlockRightSide);

    const acRoll = random(defenderACRoll, attackerACRoll);

    if (acRoll < 0) {

      const itemClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');

      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.BlockArmor);

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: 'You were blocked by armor!',
          sfx: SoundEffect.CombatBlockArmor,
          setTarget: this.determineIfTarget(attacker, defender),
          logInfo: {
            type: 'block-armor',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name
          }
        },
        [MessageType.Combat, MessageType.Self, MessageType.Block, MessageType.Armor]
      );

      this.game.messageHelper.sendLogMessageToPlayer(defender,
        {
          message: `${attackerName} was blocked by your armor!`,
          logInfo: {
            type: 'block-armor',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        },
        [MessageType.Combat, MessageType.Other, MessageType.Block, MessageType.Armor]
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
    args: PhysicalAttackArgs
  ): boolean {
    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const attackerBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense);
    const attackerWeaponBlockRightSide = Math.floor(attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill);

    const defenderWeaponBlockLeftSide = 1 + defenderScope.weaponAC;
    const defenderWeaponBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

    const attackerWeaponBlockRoll = this.game.diceRollerHelper.uniformRoll(attackerBlockLeftSide, attackerWeaponBlockRightSide);
    const defenderWeaponBlockRoll = -this.game.diceRollerHelper.uniformRoll(defenderWeaponBlockLeftSide, defenderWeaponBlockRightSide);

    const acRoll = random(defenderWeaponBlockRoll, attackerWeaponBlockRoll);
    const canDefenderUseBlocker = this.game.itemHelper.ownsAndItemUnbroken(defender, defenderScope.blocker);

    if (acRoll < 0 && canDefenderUseBlocker) {

      const itemClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
      const defenderItemClass = this.game.itemHelper.getItemProperty(defenderScope.blocker, 'itemClass');

      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.BlockWeapon);

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: `You were blocked by ${defender.name}'s ${defenderItemClass.toLowerCase()}!`,
          sfx: SoundEffect.CombatBlockWeapon,
          setTarget: this.determineIfTarget(attacker, defender),
          logInfo: {
            type: 'block-weapon',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name
          }
        },
        [MessageType.Combat, MessageType.Self, MessageType.Block, MessageType.Weapon]
      );

      this.game.messageHelper.sendLogMessageToPlayer(defender,
        {
          message: `${attackerName} was blocked by your ${defenderItemClass.toLowerCase()}!`,
          logInfo: {
            type: 'block-weapon',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        },
        [MessageType.Combat, MessageType.Other, MessageType.Block, MessageType.Weapon]
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
    args: PhysicalAttackArgs
  ): boolean {
    if (!defenderScope.shield) return false;

    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const defenderShieldBlockLeftSide = Math.floor(1 + defenderScope.shieldDefense + defenderScope.shieldAC);
    const defenderShieldBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

    const attackerBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense);
    const attackerBlockRightSide = Math.floor(attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill);

    const attackerShieldBlockRoll = Math.max(1, this.game.diceRollerHelper.uniformRoll(attackerBlockLeftSide, attackerBlockRightSide));
    const defenderShieldBlockRoll = -this.game.diceRollerHelper.uniformRoll(defenderShieldBlockLeftSide, defenderShieldBlockRightSide);

    const acRoll = random(attackerShieldBlockRoll, defenderShieldBlockRoll);
    const canDefenderUseShield = this.game.itemHelper.ownsAndItemUnbroken(defender, defenderScope.blocker);

    if (acRoll < 0 && canDefenderUseShield) {

      const itemClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');

      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.BlockShield);

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: `You were blocked by ${defender.name}'s shield!`,
          sfx: SoundEffect.CombatBlockArmor,
          setTarget: this.determineIfTarget(attacker, defender),
          logInfo: {
            type: 'block-shield',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name
          }
        },
        [MessageType.Combat, MessageType.Self, MessageType.Block, MessageType.Shield]
      );

      this.game.messageHelper.sendLogMessageToPlayer(defender,
        {
          message: `${attackerName} was blocked by your shield!`,
          logInfo: {
            type: 'block-shield',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        },
        [MessageType.Combat, MessageType.Other, MessageType.Block, MessageType.Shield]
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
    args: PhysicalAttackArgs
  ): boolean {
    if (!defenderScope.offhand) return false;

    const { attackerName } = args;
    const weapon = attackerScope.weapon;

    const attackerBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense);
    const attackerBlockRightSide = Math.floor(attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill);

    const defenderOffhandBlockLeftSide = Math.floor(1 + defenderScope.offhandDefense + defenderScope.offhandAC);
    const defenderOffhandBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.offhandSkill);

    const attackerOffhandBlockRoll = Math.max(1, this.game.diceRollerHelper.uniformRoll(attackerBlockLeftSide, attackerBlockRightSide));
    const defenderOffhandBlockRoll = -this.game.diceRollerHelper.uniformRoll(defenderOffhandBlockLeftSide, defenderOffhandBlockRightSide);

    const acRoll = random(attackerOffhandBlockRoll, defenderOffhandBlockRoll);
    const canDefenderUseOffhand = this.game.itemHelper.ownsAndItemUnbroken(defender, defenderScope.offhand);

    if (acRoll < 0 && canDefenderUseOffhand) {

      const itemClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
      const defenderItemClass = this.game.itemHelper.getItemProperty(defenderScope.offhand, 'itemClass');

      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.BlockOffhand);

      this.game.messageHelper.sendLogMessageToPlayer(attacker,
        {
          message: `You were blocked by ${defender.name}'s ${defenderItemClass.toLowerCase()}!`,
          sfx: SoundEffect.CombatBlockWeapon,
          setTarget: this.determineIfTarget(attacker, defender),
          logInfo: {
            type: 'block-offhand',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: defender.name
          }
        },
        [MessageType.Combat, MessageType.Self, MessageType.Block, MessageType.Offhand]
      );

      this.game.messageHelper.sendLogMessageToPlayer(defender,
        {
          message: `${attackerName} was blocked by your ${defenderItemClass.toLowerCase()}!`,
          logInfo: {
            type: 'block-offhand',
            uuid: attacker.uuid,
            weapon: itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        },
        [MessageType.Combat, MessageType.Other, MessageType.Block, MessageType.Offhand]
      );

      this.game.itemHelper.loseCondition(defenderScope.offhand, 1, defender);
      return true;
    }

    return false;
  }

  // try to combat-stun from a melee hit
  private attemptToStun(attacker: ICharacter, defender: ICharacter, attackerWeapon: ISimpleItem): void {
    // TODO: prone/push

    // first we get the diff between atk STR and def CON
    // next we use that to modify the con multiplier - if atk STR > def CON then the multiplier goes down and vice-versa
    // then we multiply by the def CON to get our 1/x
    // this means there's always a chance of c-stun, but high con and having higher CON than your attackers will mitigate it effectively
    let conMultiplier = 20;
    const defCon = this.game.characterHelper.getStat(defender, Stat.CON);
    const atkStr = this.game.characterHelper.getStat(attacker, Stat.STR);

    const diff = atkStr - defCon;
    conMultiplier = Math.max(1, conMultiplier - diff);

    if (this.game.diceRollerHelper.OneInX(defCon * conMultiplier) && !this.game.effectHelper.hasEffect(defender, 'Stun')) {
      this.game.messageHelper.sendLogMessageToPlayer(defender, { message: 'You have been knocked flat!' }, [MessageType.Combat]);
      this.game.effectHelper.addEffect(defender, attacker, 'Stun', { effect: { duration: 5 } });
    }
  }

  private handlePhysicalAttack(attacker: ICharacter, defender: ICharacter, args: PhysicalAttackArgs): PhysicalAttackReturn {
    const { isThrow, throwHand, isBackstab, isOffhand, isKick, damageMult } = args;
    let { isPunch } = args;
    const isAttackerVisible = this.game.visibilityHelper.canSeeThroughStealthOf(defender, attacker);
    // TODO: darkness

    args.attackerName = isAttackerVisible ? attacker?.name || 'somebody' : 'somebody';
    args.backstabIgnoreRange = args.backstabIgnoreRange ?? false;
    args.accuracyLoss = args.accuracyLoss ?? 0;
    args.damageClass = args.damageClass ?? DamageClass.Physical;
    args.offhandMultiplier = args.offhandMultiplier ?? 1;
    if (isOffhand) args.offhandMultiplier = 0.2;

    const isAttackerPlayer = this.game.characterHelper.isPlayer(attacker);

    if (this.game.characterHelper.isDead(attacker) || this.game.characterHelper.isDead(defender)) return { isDead: true };

    this.game.characterHelper.engageInCombat(attacker);
    this.game.characterHelper.engageInCombat(defender);

    const attackerWeapon = this.getWeaponForAttacker(attacker, args);
    const { type, secondaryType, itemClass, canShoot, damageClass } = this.game.itemHelper.getItemProperties(attackerWeapon,
      ['type', 'secondaryType', 'itemClass', 'canShoot', 'damageClass']
    );

    // if weapon has a custom damage type, use it
    if (damageClass) args.damageClass = damageClass;

    if (isAttackerPlayer && !this.game.itemHelper.canGetBenefitsFromItem(attacker as IPlayer, attackerWeapon)) {
      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        { message: 'You feel a burning sensation in your hands!' },
        [MessageType.Combat]
      );
      return {};
    }

    // if we have a hands, it is always a punch
    if (HandsClasses.includes(itemClass as ArmorClass)) isPunch = true;

    // flag skills for the attack
    if (isAttackerPlayer) {
      const flagSkills = [type ?? Skill.Martial];
      if (secondaryType)                                                                            flagSkills.push(secondaryType);
      if (isThrow)                                                                                  flagSkills.push(Skill.Throwing);
      if (!isAttackerVisible || isBackstab || this.game.effectHelper.hasEffect(attacker, 'Hidden')) flagSkills.push(Skill.Thievery);

      this.game.playerHelper.flagSkill(attacker as IPlayer, flagSkills as Skill[]);
    }

    // if we have ammo equipped, shoot it if our weapon is pew-pew
    const ammo = attacker.items.equipment[ItemSlot.Ammo];
    if (canShoot && ammo) {
      const { shots, damageClass: ammoDamageClass } = this.game.itemHelper.getItemProperties(ammo, ['damageClass', 'shots']);

      // if the ammo has a custom damage class, use that over everything else
      if (ammoDamageClass) {
        args.damageClass = ammoDamageClass;
      }

      const numShots = shots ?? 0;
      this.game.itemHelper.setItemProperty(ammo, 'shots', numShots - 1);
      if (numShots - 1 <= 0) this.game.characterHelper.setEquipmentSlot(attacker, ItemSlot.Ammo, undefined);
    }

    const attackerScope = this.getAttackerScope(attacker, attackerWeapon, args);
    const defenderScope = this.getDefenderScope(defender);

    this.game.characterHelper.addAgro(defender, attacker, 1);

    const lostAtkCondition = 1;
    this.game.itemHelper.loseCondition(attackerWeapon, lostAtkCondition, attacker);

    const resolveThrow = () => {
      if (!isThrow || !throwHand) return;
      this.resolveThrow(attacker, defender, throwHand, attackerScope.weapon);
    };

    // spend forever attempting to hit the target
    const didDodge = this.tryDodge(attacker, defender, attackerScope, defenderScope, args);
    if (didDodge) {
      resolveThrow();
      return { dodge: true };
    }

    const didArmorBlock = this.tryArmorBlock(attacker, defender, attackerScope, defenderScope, args);
    if (didArmorBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'armor' };
    }

    const didWeaponBlock = this.tryWeaponBlock(attacker, defender, attackerScope, defenderScope, args);
    if (didWeaponBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'weapon' };
    }

    const didShieldBlock = this.tryShieldBlock(attacker, defender, attackerScope, defenderScope, args);
    if (didShieldBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'shield' };
    }

    const didOffhandBlock = this.tryOffhandBlock(attacker, defender, attackerScope, defenderScope, args);
    if (didOffhandBlock) {
      resolveThrow();
      return { block: true, blockedBy: 'offhand' };
    }

    // eyy, if you get here, that means you're out of hell. I mean, it means you can hit the target for real damage. probably.

    const damageLeft = attackerScope.damageRolls + attackerScope.level + attackerScope.skill4;
    const damageRight = Math.floor(attackerScope.damageStat + attackerScope.skill);
    const damageBoost = attackerScope.damageBonus;

    // thieves get +25% to the bottom damage range, warriors get +50%
    let damageRollMinimum = 1;

    /** PERK:CLASS:THIEF:Thieves always do at least 15% of their damage roll when rolling dice. */
    if (attacker.baseClass === BaseClass.Thief) damageRollMinimum = 0.15;

    /** PERK:CLASS:WARRIOR:Warriors always do at least 25% of their damage roll when rolling dice. */
    if (attacker.baseClass === BaseClass.Warrior) damageRollMinimum = 0.25;

    let damage = Math.floor(this.game.diceRollerHelper.diceRoll(damageLeft, damageRight, damageRollMinimum)) + damageBoost;

    damage += damage * Math.floor(this.game.characterHelper.getStat(attacker, Stat.PhysicalBoostPercent) / 100);

    if (isOffhand) {
      damage = Math.floor(damage * args.offhandMultiplier);
    }

    if (damage > 0) {
      const levelDifferenceModifier = clamp(attackerScope.level - defenderScope.level, -10, 10) * 5;
      const mitigationModifier = Math.min(75, defenderScope.mitigation - (defenderScope.mitigation * (levelDifferenceModifier / 100)));
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
    // let criticality: 0|1|2 = 1;

    if (attackerScope.isWeak) {
      damageType = 'was a grazing blow';
      // criticality = 0;
      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.HitWeak);

    } else if (attackerScope.isStrong) {
      damageType = 'left a grievous wound';
      // criticality = 2;
      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.HitStrong);

    } else {
      this.game.combatHelper.combatEffect(attacker, defender.uuid, CombatEffect.HitNormal);
    }

    if (damageMult) {
      damage = Math.floor(damage * damageMult);
    }

    const damageArgs: DamageArgs = {
      damage,
      damageClass: args.damageClass || DamageClass.Physical,
      isMelee: true,
      attackerDamageMessage: damage > 0 ? `Your attack ${damageType}!` : '',
      defenderDamageMessage: msg,
      attackerWeapon,
      isRanged: attackerScope.attackerDamageStat === Stat.DEX,
      isWeak: attackerScope.isWeak,
      isStrong: attackerScope.isStrong,
      isAttackerVisible
    };

    // TODO: mug, assassinate, backstab
    const totalDamageDealt = this.game.combatHelper.modifyDamage(attacker, defender, damageArgs);
    damageArgs.damage = totalDamageDealt;

    this.game.combatHelper.dealDamage(attacker, defender, damageArgs);

    this.attemptToStun(attacker, defender, attackerWeapon);

    // if our ammo was shot and can apply an effect, we give it a spin
    if (canShoot && ammo) {
      const ammoStrikeEffect: IItemEffect = this.game.itemHelper.getItemProperty(ammo, 'strikeEffect');

      if (ammoStrikeEffect) {
        this.game.spellManager.castSpell(
          ammoStrikeEffect.name, attacker, defender,
          { potency: ammoStrikeEffect.potency, chance: ammoStrikeEffect.chance }
        );
      }
    }

    const { strikeEffect: weaponStrikeEffect, encrustItem } = this.game.itemHelper.getItemProperties(attackerWeapon,
      ['strikeEffect', 'encrustItem']
    );

    // if it has an encrust strike effect, we apply it
    if (encrustItem) {
      const realEncrustItem = this.game.itemCreator.getSimpleItem(encrustItem);
      const encrustGive: IItemEncrust = this.game.itemHelper.getItemProperty(realEncrustItem, 'encrustGive');

      if (encrustGive.strikeEffect) {
        this.game.spellManager.castSpell(
          encrustGive.strikeEffect.name, attacker, defender,
          { potency: encrustGive.strikeEffect.potency, chance: encrustGive.strikeEffect.chance }
        );
      }
    }

    // if our weapon has a strike effect, we apply it
    if (weaponStrikeEffect) {
      this.game.spellManager.castSpell(
        weaponStrikeEffect.name, attacker, defender,
        { potency: weaponStrikeEffect.potency, chance: weaponStrikeEffect.chance }
      );
    }

    resolveThrow();

    if (totalDamageDealt <= 0) return { noDamage: true };

    if (isAttackerPlayer && this.game.characterHelper.canGainSkillFromTarget(defender)) {
      this.game.playerHelper.gainCurrentSkills(attacker as IPlayer, 1);
    }

    return { hit: true, damage: totalDamageDealt, damageType: args.damageClass };
  }

}
