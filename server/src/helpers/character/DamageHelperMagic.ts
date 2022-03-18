
import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { CombatEffect, DamageClass, ICharacter, MagicalAttackArgs, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class DamageHelperMagic extends BaseService {

  private magicCriticalMultiplier = 2;
  private willSaveThresholdDefault = 20;
  private willSavePercentDefault = 30;

  public init() {
    this.magicCriticalMultiplier = this.game.contentManager.getGameSetting('combat', 'magicCriticalMultiplier') ?? 2;
    this.willSaveThresholdDefault = this.game.contentManager.getGameSetting('combat', 'willSaveThresholdDefault') ?? 20;
    this.willSavePercentDefault = this.game.contentManager.getGameSetting('combat', 'willSavePercentDefault') ?? 30;
  }

  magicalAttack(attacker: ICharacter | null, defender: ICharacter, args: MagicalAttackArgs) {
    if (this.game.characterHelper.isDead(defender)) return;

    let startDamage = args.damage ?? 0;

    // only engage in combat if damage > 0
    if (startDamage > 0) {
      if (attacker) this.game.characterHelper.engageInCombat(attacker);
      this.game.characterHelper.engageInCombat(defender);
    }

    // try to do critical damage if possible
    if (attacker && this.game.diceRollerHelper.XInOneHundred(this.game.characterHelper.getStat(attacker, Stat.SpellCriticalPercent))) {
      startDamage *= this.magicCriticalMultiplier;
    }

    // try to do a WIL save if possible, default is a 20/30 save
    if (args.spellData) {
      const { willSaveThreshold, willSavePercent } = args.spellData;
      const defWIL = this.game.characterHelper.getStat(defender, Stat.WIL);

      if (random(0, defWIL) >= (willSaveThreshold ?? this.willSaveThresholdDefault)) {
        startDamage -= (startDamage * (willSavePercent ?? this.willSavePercentDefault) / 100);
      }
    }

    // modify the spell damage before inflicting int
    const damage = this.game.combatHelper.modifyDamage(attacker, defender, {
      damage: startDamage,
      damageClass: args.damageClass || DamageClass.Physical
    });

    // and, do the damage
    this.game.combatHelper.dealDamage(attacker, defender, {
      damage,
      damageClass: args.damageClass || DamageClass.Physical,
      customSfx: args.sfx,
      isHeal: damage < 0,
      isOverTime: args.isOverTime,
      attackerDamageMessage: args.atkMsg,
      defenderDamageMessage: args.defMsg,
      attackNum: args.attackNum
    });

    // send combat effects for heals and stuff
    if (attacker && !args.isAoE && !args.isOverTime) {
      this.game.combatHelper.combatEffect(attacker, defender.uuid, `hit-${damage > 0 ? 'magic' : 'heal'}` as CombatEffect);
    }
  }

}
