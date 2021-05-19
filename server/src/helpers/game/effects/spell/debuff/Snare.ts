import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Snare extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.statChanges = { [Stat.Move]: -effect.effectInfo.potency };
    effect.tooltip = `Snared. -${effect.effectInfo.potency} MOVE`;
  }

}
