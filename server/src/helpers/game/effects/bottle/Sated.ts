import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Sated extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {
  }

  unapply(char: ICharacter) {
    this.game.effectHelper.addEffect(char, '', 'Malnourished', { effect: { duration: -1 } });
  }

}
