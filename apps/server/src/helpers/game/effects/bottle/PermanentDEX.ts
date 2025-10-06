import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentDEX extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const max =
      this.game.configManager.MAX_POTION_STAT[effect.effectInfo.tier as string];
    if (this.game.characterHelper.getBaseStat(char, Stat.DEX) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(
      char,
      Stat.DEX,
      effect.effectInfo.potency,
    );
    this.sendMessage(char, { message: 'Your eyes feel sharper!' });
  }
}
