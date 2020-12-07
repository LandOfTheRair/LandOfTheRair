
import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { CombatEffect, DamageClass, ICharacter, MagicalAttackArgs, Stat } from '../../interfaces';
import { BaseService } from '../../models';

@Injectable()
export class DamageHelperMagic extends BaseService {

  public init() {}

  magicalAttack(attacker: ICharacter | null, defender: ICharacter, args: MagicalAttackArgs) {
    if (attacker) this.game.characterHelper.engageInCombat(attacker);
    this.game.characterHelper.engageInCombat(defender);

    let startDamage = args.damage ?? 0;

    // try to do a WIL save if possible, default is a 20/30 save
    if (args.spellData) {
      const { willSaveThreshold, willSavePercent } = args.spellData;
      const defWIL = this.game.characterHelper.getStat(defender, Stat.WIL);

      if (random(0, defWIL) >= (willSaveThreshold ?? 20)) {
        startDamage -= (startDamage * (willSavePercent ?? 30) / 100);
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
      defenderDamageMessage: args.defMsg
    });

    // send combat effects for heals and stuff
    if (attacker && !args.isAoE && !args.isOverTime) {
      this.game.combatHelper.combatEffect(attacker, defender.uuid, `hit-${damage > 0 ? 'magic' : 'heal'}` as CombatEffect);
    }
  }

}
