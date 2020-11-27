
import { Injectable } from 'injection-js';

import { BaseService, CombatEffect, DamageClass, ICharacter, MagicalAttackArgs } from '../../interfaces';

@Injectable()
export class DamageHelperMagic extends BaseService {

  public init() {}

  magicalAttack(attacker: ICharacter | null, defender: ICharacter, args: MagicalAttackArgs) {
    if (attacker) this.game.characterHelper.engageInCombat(attacker);
    this.game.characterHelper.engageInCombat(defender);

    // TODO: will check, cut damage

    const damage = this.game.combatHelper.modifyDamage(attacker, defender, {
      damage: args.damage ?? 0,
      damageClass: args.damageClass || DamageClass.Physical
    });

    this.game.combatHelper.dealDamage(attacker, defender, {
      damage,
      damageClass: args.damageClass || DamageClass.Physical,
      customSfx: args.sfx,
      isOverTime: args.isOverTime,
      attackerDamageMessage: args.atkMsg,
      defenderDamageMessage: args.defMsg
    });

    if (attacker && !args.isAoE && !args.isOverTime) {
      this.game.combatHelper.combatEffect(attacker, defender.uuid, `hit-${damage > 0 ? 'magic' : 'heal'}` as CombatEffect);
    }
  }

}
