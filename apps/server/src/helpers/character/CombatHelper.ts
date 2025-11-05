import { Injectable } from 'injection-js';
import { isNumber, sample } from 'lodash';

import {
  getStat,
  hasLearned,
  isDead,
  isPlayer,
  mana,
  takeDamage,
} from '@lotr/characters';
import {
  itemPropertyGet,
  settingClassConfigGet,
  settingGameGet,
  traitLevelValue,
} from '@lotr/content';
import {
  transmissionResponseSendPlayer,
  worldGetMapAndState,
} from '@lotr/core';
import { getEffect, hasEffect } from '@lotr/effects';
import type {
  CombatEffect,
  DamageArgs,
  ICharacter,
  IPlayer,
  MagicalAttackArgs,
  OnesidedDamageArgs,
  PhysicalAttackArgs,
  PhysicalAttackReturn,
} from '@lotr/interfaces';
import {
  Allegiance,
  DamageClass,
  GameServerResponse,
  ItemClass,
  ItemSlot,
  MessageType,
  SoundEffect,
  Stat,
} from '@lotr/interfaces';
import { rollInOneHundred, rollTraitValue } from '@lotr/rng';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CombatHelper extends BaseService {
  public init() {}

  // damage from the world, traps, etc
  public dealOnesidedDamage(
    defender: ICharacter,
    args: OnesidedDamageArgs,
  ): void {
    this.game.damageHelperOnesided.dealOnesidedDamage(defender, args);
  }

  // do damage from one person to another, physically
  public physicalAttack(
    attacker: ICharacter,
    defender: ICharacter,
    args: PhysicalAttackArgs = {},
  ): PhysicalAttackReturn {
    const res = this.game.damageHelperPhysical.physicalAttack(
      attacker,
      defender,
      args,
    );

    const gainsManaOnHitOrDodge =
      settingClassConfigGet<'gainsManaOnHitOrDodge'>(
        attacker.baseClass,
        'gainsManaOnHitOrDodge',
      );

    if (gainsManaOnHitOrDodge) {
      if (res.block || res.dodge) {
        mana(attacker, settingGameGet('character', 'warriorDodgeRegen') ?? 5);
      }

      if (res.hit) {
        mana(attacker, settingGameGet('character', 'warriorHitRegen') ?? 3);
      }
    }

    const drainChance = traitLevelValue(attacker, 'DrainSlash');
    if (
      hasLearned(attacker, 'Drain') &&
      drainChance > 0 &&
      rollInOneHundred(drainChance)
    ) {
      this.game.spellManager.castSpell('Drain', attacker, defender);
    }

    const asperChance = traitLevelValue(attacker, 'AsperSlash');
    if (
      hasLearned(attacker, 'Asper') &&
      asperChance > 0 &&
      rollInOneHundred(asperChance)
    ) {
      this.game.spellManager.castSpell('Asper', attacker, defender);
    }

    attacker.lastTargetUUID = defender.uuid;

    return res;
  }

  public magicalAttack(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: MagicalAttackArgs = {},
  ): void {
    this.game.damageHelperMagic.magicalAttack(attacker, defender, args);
  }

  public combatEffect(
    target: ICharacter,
    defenderUUID: string,
    effect: CombatEffect,
  ): void {
    transmissionResponseSendPlayer(
      target as IPlayer,
      GameServerResponse.PlayCFX,
      { defenderUUID, effect },
    );
  }

  public modifyDamage(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: DamageArgs,
  ): number {
    const baseDamage = args.damage;
    const isHeal = baseDamage < 0;

    // let mitigatedPercent = 0;
    let totalDamage = args.damage;

    if (attacker) {
      if (!args.isMelee) {
        totalDamage += Math.floor(
          (totalDamage *
            getStat(attacker, `${args.damageClass}BoostPercent` as Stat)) /
            100,
        );
        totalDamage += Math.floor(
          (totalDamage * getStat(attacker, Stat.MagicalBoostPercent)) / 100,
        );
      }
    }

    if (!isHeal) {
      // check for resistance to the damage type
      const damageReduced = getStat(
        defender,
        `${args.damageClass}Resist` as Stat,
      );
      totalDamage -= damageReduced;

      // non-physical attacks are magical
      if (
        !args.isMelee &&
        args.damageClass !== DamageClass.GM &&
        args.damageClass !== DamageClass.Sonic
      ) {
        const magicReduction = getStat(defender, Stat.MagicalResist);
        totalDamage -= magicReduction;
      }

      if (totalDamage < 0) totalDamage = 0;

      // boost healing
    } else if (attacker) {
      totalDamage -= Math.floor(
        (totalDamage * getStat(attacker, Stat.HealingBoostPercent)) / 100,
      );
    }

    if (attacker) {
      const damageFactor = getStat(attacker, Stat.DamageFactor);
      totalDamage *= damageFactor;
    }

    // clone the args so we dont accidentally override something
    const damageArgs = Object.assign({}, args);
    damageArgs.damage = totalDamage;
    totalDamage = this.game.effectHelper.modifyIncomingDamage(
      defender,
      attacker,
      damageArgs,
    );

    if (isNaN(totalDamage)) totalDamage = 0;

    return Math.floor(totalDamage);
  }

  // this function directly deals damage without modifying it - the only place this should be called are the damage helpers
  public dealDamage(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: DamageArgs,
  ): void {
    if (isDead(defender)) return;

    // npc on npc violence improvements
    if (attacker && defender && !isPlayer(attacker) && !isPlayer(defender)) {
      const npcViolenceMultiplier =
        settingGameGet('combat', 'npcViolenceMultiplier') ?? 5;
      args.damage *= npcViolenceMultiplier;
    }

    const {
      damage,
      attackerWeapon,
      isHeal,
      isMelee,
      isOverTime,
      hasBeenReflected,
      damageClass,
      attackerDamageMessage,
      defenderDamageMessage,
      customSfx,
    } = args;

    if (isNaN(damage)) return;

    const reflectPhysical = getStat(defender, Stat.PhysicalReflect);
    const reflectMagical = getStat(defender, Stat.MagicalReflect);

    if (
      attacker &&
      damage > 0 &&
      reflectPhysical > 0 &&
      damageClass === DamageClass.Physical &&
      !hasBeenReflected
    ) {
      this.dealDamage(defender, attacker, {
        damage: Math.min(damage, reflectPhysical),
        damageClass: DamageClass.Physical,
        hasBeenReflected: true,
        defenderDamageMessage: '%0 reflected your attack!',
      });
    }

    if (
      attacker &&
      damage > 0 &&
      reflectMagical > 0 &&
      damageClass !== DamageClass.Physical &&
      !hasBeenReflected
    ) {
      this.dealDamage(defender, attacker, {
        damage: Math.min(damage, reflectMagical),
        damageClass,
        hasBeenReflected: true,
        defenderDamageMessage: '%0 reflected your attack!',
      });
    }

    // if no damage, bail
    if (attacker && attacker !== defender && damage === 0) {
      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: 'Your attack did no visible damage!',
          logInfo: {
            type: 'hit-physical',
            uuid: attacker ? attacker.uuid : '???',
            weapon: attackerWeapon ? attackerWeapon.name : '???',
            damage: 0,
            monsterName: defender.name,
          },
        },
        [MessageType.Combat, MessageType.Self, MessageType.Blocked],
      );

      this.game.characterHelper.addAgro(defender, attacker, 1);
    }

    const absDmg = Math.round(Math.abs(damage));
    const dmgString = isHeal ? 'health' : `${damageClass} damage`;

    const otherClass = isHeal ? MessageType.Heal : MessageType.Hit;
    const damageType = isMelee ? MessageType.Melee : MessageType.Magic;

    const itemClass =
      itemPropertyGet(attackerWeapon, 'itemClass') ?? ItemClass.Rock;

    // tell the attacker something's going on
    if (attackerDamageMessage && attacker) {
      const secondaryClass =
        attacker !== defender ? MessageType.Self : MessageType.Other;

      const formattedAtkMessage = this.game.messageHelper.formatMessage(
        attacker,
        attackerDamageMessage,
        [defender],
      );

      const messageTypes = [
        MessageType.Combat,
        secondaryClass,
        otherClass,
        damageType,
      ];
      if (isOverTime) messageTypes.push(MessageType.OutOvertime);

      this.game.messageHelper.sendLogMessageToPlayer(
        attacker,
        {
          message: `${formattedAtkMessage} [${absDmg} ${dmgString}]`,
          sfx:
            (args?.attackNum ?? 0) > 0
              ? undefined
              : customSfx || this.determineSfx({ itemClass, isMelee, damage }),
          logInfo: {
            type: 'damage',
            uuid: attacker ? attacker.uuid : '???',
            weapon: attackerWeapon ? itemClass : args.damageClass || '???',
            damage,
            monsterName: defender.name,
          },
        },
        messageTypes,
      );
    }

    // let the defender know they got hit or something
    if (defenderDamageMessage && defender && attacker !== defender) {
      const formattedDefMessage = this.game.messageHelper.formatMessage(
        defender,
        defenderDamageMessage,
        [attacker],
      );

      const messageTypes = [
        MessageType.Combat,
        MessageType.Other,
        otherClass,
        damageType,
      ];
      if (isOverTime) messageTypes.push(MessageType.InOvertime);

      this.game.messageHelper.sendLogMessageToPlayer(
        defender,
        {
          message: `${formattedDefMessage} [${absDmg} ${dmgString}]`,
          logInfo: {
            type: 'damage',
            uuid: attacker ? attacker.uuid : '???',
            weapon: attackerWeapon ? itemClass : args.damageClass || '???',
            damage,
            monsterName: attacker ? attacker.name : '???',
          },
        },
        messageTypes,
      );
    }

    // add agro = to damage
    if (attacker && args.damage > 0) {
      this.game.characterHelper.addAgro(attacker, defender, args.damage ?? 1);
    }

    // finally, absolutely finally, we can do some damage
    takeDamage(defender, args.damage);

    // handle outgoing effects that happen post-damage
    if (attacker && !hasBeenReflected) {
      this.game.effectHelper.handleOutgoingEffects(attacker, defender, args);
    }

    // try to do some debuffing based on damage element
    this.doElementalDebuffing(
      defender,
      args.damageClass,
      args.damage,
      attacker,
    );

    // notify the ai if needed
    if (!isPlayer(defender)) {
      const ai = worldGetMapAndState(defender.map)
        .state?.getNPCSpawner(defender.uuid)
        ?.getNPCAI(defender.uuid);
      ai?.damageTaken({ damage, attacker });
    }

    // lets see if they died
    const wasFatal = isDead(defender);
    if (wasFatal) {
      // if there was an attacker, we send a lot of messages
      if (attacker) {
        // let the killer know they murdered someone
        let verb = 'killed';
        if (defender.allegiance === Allegiance.NaturalResource) {
          verb = 'shredded';
          if (defender.name.includes('tree')) verb = 'took down';
          if (defender.name.includes('vein')) verb = 'smashed';
        }

        // let the defender know they were killed in an aoe
        this.game.messageHelper.sendLogMessageToRadius(
          defender,
          4,
          {
            message: `%0 was ${verb} by %1!`,
            sfx: isPlayer(defender)
              ? SoundEffect.CombatDie
              : SoundEffect.CombatKill,
            except: [defender.uuid, attacker.uuid],
          },
          [
            MessageType.Combat,
            MessageType.NotMe,
            MessageType.Kill,
            isPlayer(defender) ? MessageType.Player : MessageType.NPC,
          ],
          [defender, attacker],
        );

        const setTargetArgs = isNumber(args.attackNum)
          ? {}
          : { setTarget: null, overrideIfOnly: defender.uuid };

        const killMsg = this.game.messageHelper.formatMessage(
          attacker,
          `You ${verb} %0!`,
          [defender],
        );
        this.game.messageHelper.sendLogMessageToPlayer(attacker, {
          message: killMsg,
          sfx: isPlayer(defender)
            ? SoundEffect.CombatDie
            : SoundEffect.CombatKill,
          ...setTargetArgs,
        });

        // let the target know they died
        const dieMsg = this.game.messageHelper.formatMessage(
          defender,
          'You were killed by %0!',
          [attacker],
        );
        this.game.messageHelper.sendLogMessageToPlayer(
          defender,
          {
            message: dieMsg,
            setTarget: null,
            sfx: SoundEffect.CombatDie,
          },
          [MessageType.Combat, MessageType.Other, MessageType.Kill],
        );

        // killllllllllllllllllll
        this.game.deathHelper.kill(attacker, defender);

        // but everyone die()s
        this.game.deathHelper.die(defender, attacker);

        // otherwise, we just let everyone know this person died. probably their own fault. probably.
      } else {
        this.game.messageHelper.sendLogMessageToRadius(
          defender,
          4,
          {
            message: `${defender.name} was killed!`,
            sfx: isPlayer(defender)
              ? SoundEffect.CombatDie
              : SoundEffect.CombatKill,
            except: [defender.uuid],
          },
          [MessageType.Combat, MessageType.Self, MessageType.Kill],
        );

        this.game.messageHelper.sendLogMessageToPlayer(
          defender,
          {
            message: 'You were killed!',
            sfx: SoundEffect.CombatDie,
            setTarget: null,
          },
          [MessageType.Combat, MessageType.Other, MessageType.Kill],
        );

        this.game.deathHelper.die(defender);
      }
    }
  }

  private determineSfx({
    itemClass,
    isMelee,
    damage,
  }): SoundEffect | undefined {
    if (damage < 0) return;
    if (itemClass === ItemClass.Blunderbuss) {
      return SoundEffect.CombatSpecialBlunderbuss;
    }

    return isMelee ? SoundEffect.CombatHitMelee : SoundEffect.CombatHitSpell;
  }

  private getElementalDebuff(
    damageClass: DamageClass,
  ): [string, string, string] {
    switch (damageClass) {
      case DamageClass.Energy:
        return ['BuildupEnergy', 'Overcharged', 'RecentlyOvercharged'];
      case DamageClass.Fire:
        return ['BuildupHeat', 'Burning', 'RecentlyBurned'];
      case DamageClass.Ice:
        return ['BuildupChill', 'Chilled', 'RecentlyChilled'];
      case DamageClass.Acid:
        return ['BuildupAcid', 'Corroded', 'RecentlyCorroded'];
      case DamageClass.Water:
        return ['BuildupWater', 'Suffocating', 'RecentlySuffocated'];
      case DamageClass.Lightning:
        return ['BuildupElectricity', 'TeslaCoil', 'RecentlyShocked'];
    }

    return ['', '', ''];
  }

  public damageRandomItemForCharacter(
    character: ICharacter,
    loss: number,
  ): void {
    const allEquipment = Object.keys(character.items.equipment)
      .filter(
        (slot) => ![ItemSlot.Potion, ItemSlot.Ammo].includes(slot as ItemSlot),
      )
      .map((i) => character.items.equipment[i as ItemSlot])
      .filter(Boolean)
      .filter((item) => (item?.mods.condition ?? 20000) > 0);

    const itemToDamage = sample(allEquipment);
    if (itemToDamage) {
      const durabilityLoss = isPlayer(character) ? loss : loss * 5;
      this.game.itemHelper.loseCondition(
        itemToDamage,
        durabilityLoss,
        character,
      );
      this.game.messageHelper.sendLogMessageToPlayer(character, {
        message: `Your ${itemPropertyGet(itemToDamage, 'itemClass')?.toLowerCase() ?? 'item'} takes corrosion damage!`,
      });
    }
  }

  private doElementalDebuffing(
    defender: ICharacter,
    damageClass: DamageClass,
    damage: number,
    source?: ICharacter | undefined,
  ): void {
    if (damage === 0) return;

    const [buildup, burst, recently] = this.getElementalDebuff(damageClass);
    if (!buildup || !burst || !recently) return;

    if (
      hasEffect(defender, burst) ||
      hasEffect(defender, recently) ||
      (burst === 'Chilled' && hasEffect(defender, 'Frozen'))
    ) {
      return;
    }

    const buildupEffect = getEffect(defender, buildup);
    if (!buildupEffect) {
      const { buildUpDecay, buildUpCurrent, buildUpMax, buildUpScale } =
        settingGameGet('combat');

      this.game.effectHelper.addEffect(defender, source ?? '', buildup, {
        effect: {
          extra: {
            buildUpDecay: buildUpDecay ?? 3,
            buildUpCurrent: 25 + (buildUpCurrent ?? 5),
            buildUpMax:
              (buildUpMax ?? 200) + defender.level * (buildUpScale ?? 10),
          },
        },
      });
    }
  }

  public attemptArrowBounce(
    attacker: ICharacter,
    defender: ICharacter,
    args: PhysicalAttackArgs = {},
  ) {
    if (!rollTraitValue(attacker, 'BouncingArrows')) {
      return;
    }

    // bouncing arrows
    const nearby = this.game.targettingHelper
      .getPossibleAOETargets(attacker, attacker, 4)
      .filter((x) => x !== defender);

    const bounceTo = sample(nearby);
    if (bounceTo) {
      this.game.combatHelper.physicalAttack(attacker, bounceTo, args);
    }
  }
}
