import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class BarNecro extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    const boost = 1 + (this.game.traitHelper.traitLevelValue(char, 'NecroticWard'));
    effect.effectInfo.potency = Math.floor(boost * effect.effectInfo.potency);

    effect.effectInfo.statChanges = {
      [Stat.NecroticResist]: effect.effectInfo.potency,
      [Stat.PoisonResist]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.DiseaseResist]: Math.floor(effect.effectInfo.potency / 10)
    };
  }

}
