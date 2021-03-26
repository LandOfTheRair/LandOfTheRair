import { DamageClass, ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarFire extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = { [Stat.FireResist]: effect.effectInfo.potency };
  }

}
