import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BlurredVision extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = { [Stat.Perception]: -effect.effectInfo.potency };
  }

}
