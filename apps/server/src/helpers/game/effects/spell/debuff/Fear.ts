import { random } from 'lodash';

import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Fear extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.isFrozen = true;
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.movementHelper.moveRandomly(char, random(0, 1));
  }
}
