import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Stun extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.isFrozen = true;
  }
}
