import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Poison extends Effect {

  tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.combatHelper.dealDamage(null, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Poison,
      defenderDamageMessage: 'You are poisoned!'
    });
  }

}
