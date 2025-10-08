import { traitLevelValue } from '@lotr/content';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Boost extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = 3 + traitLevelValue(char, 'BoostedBoost');
    effect.effectInfo.statChanges = {
      [Stat.STR]: effect.effectInfo.potency,
      [Stat.DEX]: effect.effectInfo.potency,
      [Stat.AGI]: effect.effectInfo.potency,
    };

    this.game.effectHelper.addEffect(char, char, 'Stun', {
      effect: {
        duration: 5,
        extra: { disableMessages: true, disableRecently: true },
      },
    });
  }
}
