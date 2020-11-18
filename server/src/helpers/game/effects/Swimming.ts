import { ICharacter, IStatusEffect } from '../../../interfaces';
import { Effect } from '../../../models';

export class Swimming extends Effect {

  unapply(char: ICharacter, effect: IStatusEffect) {
    this.game.effectHelper.addEffect(char, '', 'Drowning', { effect: { duration: -1 } });
  }

}
