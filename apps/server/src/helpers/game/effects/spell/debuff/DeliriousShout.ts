import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class DeliriousShout extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.INT]: -effect.effectInfo.potency,
      [Stat.WIS]: -effect.effectInfo.potency,
      [Stat.WIL]: -effect.effectInfo.potency,
    };
  }
}
