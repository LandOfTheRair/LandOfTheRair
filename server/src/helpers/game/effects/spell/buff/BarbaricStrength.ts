import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarbaricStrength extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.STR]: effect.effectInfo.potency,
      [Stat.CON]: effect.effectInfo.potency,
    };
  }
}
