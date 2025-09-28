import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class FerociousRoarVigor extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.PhysicalResist]: effect.effectInfo.potency,
    };
  }
}
