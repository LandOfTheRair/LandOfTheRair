import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Nourishment extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {
    if (effect.effectInfo.message) {
      this.sendMessage(char, { message: effect.effectInfo.message });
    }

    this.game.effectHelper.removeEffectByName(char, 'Malnourished');
    this.game.effectHelper.removeEffectByName(char, 'Sated');
  }

  unapply(char: ICharacter) {
    this.game.effectHelper.addEffect(char, '', 'Sated', { effect: { duration: 21600 } });
  }

}
