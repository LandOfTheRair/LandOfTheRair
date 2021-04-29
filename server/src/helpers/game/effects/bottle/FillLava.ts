import { DamageClass, ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class FillLava extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    const damage = Math.floor(char.hp.maximum * 5);

    this.game.combatHelper.dealOnesidedDamage(char, {
      damage,
      damageClass: DamageClass.Fire,
      damageMessage: 'The lava sears your insides!'
    });

    if (!this.game.characterHelper.isDead(char)) {
      this.game.effectHelper.addEffect(char, char, 'BarFire', { effect: { duration: 7200, extra: { potency: damage } } });
    }
  }

}
