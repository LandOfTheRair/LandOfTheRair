import { getBaseStat } from '@lotr/characters';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentLUK extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const max =
      this.game.configManager.MAX_POTION_STAT[
        effect.effectInfo.tier as string
      ] ?? 13;
    if (getBaseStat(char, Stat.LUK) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(
      char,
      Stat.LUK,
      effect.effectInfo.potency,
    );
    this.sendMessage(char, {
      message: 'Your drink had a four-leaf clover in it!',
    });
  }
}
