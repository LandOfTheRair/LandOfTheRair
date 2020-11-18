import { ICharacter, IStatusEffect } from '../../../interfaces';
import { Effect } from '../../../models';

export class Drowning extends Effect {

  tick(char: ICharacter, effect: IStatusEffect) {
    console.log('drowning');
  }

}
