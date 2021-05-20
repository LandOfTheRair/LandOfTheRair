import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ExactHealRegen extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.effectHelper.addEffect(char, '', 'ExactHeal', { effect: { extra: { potency: effect.effectInfo.potency } } });
    this.game.effectHelper.addEffect(char, '', 'Regen', { effect: { duration: 5, extra: { potency: effect.effectInfo.potency / 10 } } });
  }

}
