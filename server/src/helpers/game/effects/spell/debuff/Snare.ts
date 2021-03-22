import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Snare extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = { [Stat.Move]: -2 };
  }

}
