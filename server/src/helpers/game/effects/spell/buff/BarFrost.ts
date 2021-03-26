import { DamageClass, ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarFrost extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = { [Stat.IceResist]: effect.effectInfo.potency };
  }

}
