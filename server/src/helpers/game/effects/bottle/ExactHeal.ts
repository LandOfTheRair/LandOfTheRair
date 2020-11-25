import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ExactHeal extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {
    this.game.characterHelper.heal(char, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'You have been healed.' });
  }

}
