import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Excogitation extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Accuracy]: effect.effectInfo.potency,
      [Stat.Offense]: effect.effectInfo.potency,
      [Stat.STR]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.INT]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.WIS]: Math.floor(effect.effectInfo.potency / 5),
    };
  }
}
