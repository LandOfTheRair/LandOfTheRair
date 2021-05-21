import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ExactHealMP extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.characterHelper.mana(char, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'You feel a rush of magic energy.' });
  }

}
