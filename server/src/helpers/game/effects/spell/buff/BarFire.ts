import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarFire extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    const boost = 1 + (this.game.traitHelper.traitLevelValue(char, 'ThermalBarrier'));
    effect.effectInfo.potency = Math.floor(boost * effect.effectInfo.potency);
    effect.effectInfo.statChanges = { [Stat.FireResist]: effect.effectInfo.potency };
  }

}
