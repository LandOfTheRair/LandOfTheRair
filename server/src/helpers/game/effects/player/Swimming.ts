import {
  DamageClass,
  ICharacter,
  IPlayer,
  IStatusEffect,
} from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Swimming extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    if ((char as IPlayer).swimElement === DamageClass.Fire) {
      this.game.effectHelper.removeEffectByName(char, 'Swimming');
    }
  }

  override unapply(char: ICharacter, effect: IStatusEffect) {
    if (
      (char as IPlayer).swimElement === DamageClass.Water &&
      this.game.effectHelper.hasEffect(char, 'WaterBreathing')
    ) {
      return;
    }

    this.game.effectHelper.addEffect(char, '', 'Drowning', {
      effect: { duration: -1 },
    });
  }
}
