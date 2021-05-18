import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ExactHeal extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    const bonus = this.game.traitHelper.traitLevelValue(char, 'EffectivePotions')
                + this.game.traitHelper.traitLevelValue(char, 'AncientPotions');
    this.game.characterHelper.heal(char, effect.effectInfo.potency + bonus);
    this.sendMessage(char, { message: 'You\'ve been healed.' });
  }

}
