import { heal } from '@lotr/characters';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class FillNormalWater extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const healed = Math.floor(char.hp.maximum * 0.1);

    heal(char, healed);
    this.sendMessage(char, { message: 'The water is refreshing!' });

    this.game.effectHelper.addEffect(char, char, 'BarWater', {
      effect: { duration: 7200, extra: { potency: healed } },
    });
  }
}
