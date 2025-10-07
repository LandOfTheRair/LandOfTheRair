import { getBaseStat } from '@lotr/characters';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { rollInOneHundred } from '@lotr/rng';
import { Effect } from '../../../../models';

export class ThanksgivingLUK extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.effectHelper.addEffect(char, 'Cornbread', 'Nourishment', {
      effect: {
        duration: 14400,
        extra: {
          potency: 1,
          tooltip: '+2 CHA',
          message: 'The cornbread is delicious!',
          statChanges: { [Stat.CHA]: 2 },
        },
      },
    });

    if (getBaseStat(char, Stat.LUK) < 17 && rollInOneHundred(1)) {
      this.game.characterHelper.gainPermanentStat(char, Stat.LUK, 1);
      this.sendMessage(char, { message: 'You feel more lucky!' });
    }
  }
}
