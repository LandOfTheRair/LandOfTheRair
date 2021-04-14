import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Boost extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = 3 + this.game.traitHelper.traitLevelValue(char, 'BoostedBoost');
    effect.effectInfo.statChanges = {
      [Stat.STR]: effect.effectInfo.potency,
      [Stat.DEX]: effect.effectInfo.potency,
      [Stat.AGI]: effect.effectInfo.potency
    };

    this.game.effectHelper.addEffect(char, char, 'Stun', { effect: { duration: 5 } });
  }

}
