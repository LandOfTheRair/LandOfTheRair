import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class BarLightning extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = Math.floor(effect.effectInfo.potency);
    effect.effectInfo.statChanges = {
      [Stat.LightningResist]: effect.effectInfo.potency,
    };
  }
}
