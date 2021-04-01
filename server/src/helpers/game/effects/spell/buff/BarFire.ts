import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarFire extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    const boost = 1 + (this.game.traitHelper.traitLevel(char, 'ThermalBarrier') * 0.1);
    effect.effectInfo.potency = Math.floor(boost * effect.effectInfo.potency);
    effect.effectInfo.statChanges = { [Stat.FireResist]: effect.effectInfo.potency };
  }

}
