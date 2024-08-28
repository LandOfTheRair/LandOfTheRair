import { ICharacter, isMPClass, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ExactHealMP extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    if (!isMPClass(char.baseClass)) {
      this.sendMessage(char, { message: 'This tastes like slime mold juice.' });
      return;
    }

    this.game.characterHelper.mana(char, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'You feel a rush of magic energy.' });
  }
}
