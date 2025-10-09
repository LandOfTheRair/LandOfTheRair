import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Indomitable extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = {
      [Stat.Mitigation]: effect.effectInfo.potency,
      [Stat.Defense]: effect.effectInfo.potency,
      [Stat.AGI]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.CON]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.WIL]: Math.floor(effect.effectInfo.potency / 5),
    };
  }
}
