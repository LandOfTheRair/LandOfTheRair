import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Shield extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.MagicalResist]: effect.effectInfo.potency,
      [Stat.PhysicalResist]: effect.effectInfo.potency,
    };

    this.game.effectHelper.addEffect(char, char, 'Stun', {
      effect: {
        duration: 5,
        extra: { disableMessages: true, disableRecently: true },
      },
    });
  }
}
