import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Burning extends Effect {

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.combatHelper.magicalAttack(null, char, {
      damage: effect.effectInfo.potency / 20,
      damageClass: DamageClass.Fire,
      defMsg: 'You are burning!'
    });
  }

}
