import { getBaseStat } from '@lotr/characters';
import { settingGetPotionStats } from '@lotr/content';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentCHA extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const max = settingGetPotionStats()[effect.effectInfo.tier as string] ?? 13;
    if (getBaseStat(char, Stat.CHA) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(
      char,
      Stat.CHA,
      effect.effectInfo.potency,
    );
    this.sendMessage(char, { message: 'You feel like you look better!' });
  }
}
