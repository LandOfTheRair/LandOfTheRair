import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { engageInCombat, getStat, isDead } from '@lotr/characters';
import { settingGameGet } from '@lotr/content';
import type {
  CombatEffect,
  ICharacter,
  MagicalAttackArgs,
} from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { rollInOneHundred } from '@lotr/rng';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class DamageHelperMagic extends BaseService {
  private magicCriticalMultiplier = 2;
  private willSaveThresholdDefault = 20;
  private willSavePercentDefault = 30;

  public init() {
    this.magicCriticalMultiplier =
      settingGameGet('combat', 'magicCriticalMultiplier') ?? 2;
    this.willSaveThresholdDefault =
      settingGameGet('combat', 'willSaveThresholdDefault') ?? 20;
    this.willSavePercentDefault =
      settingGameGet('combat', 'willSavePercentDefault') ?? 30;
  }

  magicalAttack(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: MagicalAttackArgs,
  ) {
    if (isDead(defender)) return;

    let startDamage = args.damage ?? 0;

    // only engage in combat if damage > 0
    if (startDamage > 0) {
      if (attacker) engageInCombat(attacker);
      engageInCombat(defender);
    }

    // try to do critical damage if possible
    if (
      attacker &&
      rollInOneHundred(getStat(attacker, Stat.SpellCriticalPercent))
    ) {
      startDamage *= this.magicCriticalMultiplier;
    }

    // try to do a WIL save if possible, default is a 20/30 save
    if (args.spellData) {
      const { willSaveThreshold, willSavePercent } = args.spellData;
      const defWIL = getStat(defender, Stat.WIL);

      if (
        random(0, defWIL) >=
        (willSaveThreshold ?? this.willSaveThresholdDefault)
      ) {
        startDamage -=
          (startDamage * (willSavePercent ?? this.willSavePercentDefault)) /
          100;
      }
    }

    // modify the spell damage before inflicting int
    const damage = this.game.combatHelper.modifyDamage(attacker, defender, {
      damage: startDamage,
      damageClass: args.damageClass || DamageClass.Physical,
    });

    // and, do the damage
    this.game.combatHelper.dealDamage(attacker, defender, {
      damage:
        args.damageClass === DamageClass.Heal ? -Math.abs(damage) : damage,
      damageClass: args.damageClass || DamageClass.Physical,
      customSfx: args.sfx,
      isHeal: damage < 0 || args.damageClass === DamageClass.Heal,
      isOverTime: args.isOverTime,
      attackerDamageMessage: args.atkMsg,
      defenderDamageMessage: args.defMsg,
      attackNum: args.attackNum,
    });

    // send combat effects for heals and stuff
    if (attacker && !args.isAoE && !args.isOverTime) {
      this.game.combatHelper.combatEffect(
        attacker,
        defender.uuid,
        `hit-${damage > 0 ? 'magic' : 'heal'}` as CombatEffect,
      );
    }
  }
}
