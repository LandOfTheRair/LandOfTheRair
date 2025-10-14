import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class ThirdEye extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Perception]: effect.effectInfo.potency,
    };

    effect.effectInfo.tooltip = `+${effect.effectInfo.potency} perception`;
  }
}
