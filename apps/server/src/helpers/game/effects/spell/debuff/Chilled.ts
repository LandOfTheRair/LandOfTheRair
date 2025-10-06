import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Chilled extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    effect.effectInfo.isFrozen = !effect.effectInfo.isFrozen;
  }
}
