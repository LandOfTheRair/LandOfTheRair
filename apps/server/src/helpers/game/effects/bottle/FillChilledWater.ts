import { isDead } from '@lotr/characters';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class FillChilledWater extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const damage = Math.floor(char.hp.maximum * 0.2);

    this.game.combatHelper.dealOnesidedDamage(char, {
      damage,
      damageClass: DamageClass.Ice,
      damageMessage: 'The water is freezing!',
    });

    if (!isDead(char)) {
      this.game.effectHelper.addEffect(char, char, 'BarFrost', {
        effect: { duration: 7200, extra: { potency: damage } },
      });
    }
  }
}
