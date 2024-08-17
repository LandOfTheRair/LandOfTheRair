import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class ChristmasCarrot extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.effectHelper.addEffect(char, 'Carrot', 'DarkVision', {
      effect: { duration: 7200 },
    });
    this.game.effectHelper.addEffect(char, 'Carrot', 'EagleEye', {
      effect: { duration: 7200 },
    });
    this.game.effectHelper.addEffect(char, 'Carrot', 'TrueSight', {
      effect: { duration: 7200 },
    });

    this.sendMessage(char, { message: 'Your eyes are far-out, man!' });
  }
}
