import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Sated extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {
  }

  unapply(char: ICharacter) {

    // if we're nourished, we don't get malnourished
    if (this.game.effectHelper.hasEffect(char, 'Nourishment')) return;
    this.game.effectHelper.addEffect(char, '', 'Malnourished', { effect: { duration: -1 } });
  }

}
