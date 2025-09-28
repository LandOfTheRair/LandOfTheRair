import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class FerociousRoarDread extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Accuracy]: -effect.effectInfo.potency,
      [Stat.Defense]: -effect.effectInfo.potency,
    };
  }
}
