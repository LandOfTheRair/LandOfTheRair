import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentAGI extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const max =
      this.game.configManager.MAX_POTION_STAT[
        effect.effectInfo.tier as string
      ] ?? 13;
    if (this.game.characterHelper.getBaseStat(char, Stat.AGI) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(
      char,
      Stat.AGI,
      effect.effectInfo.potency,
    );
    this.sendMessage(char, { message: 'You feel like you could run faster!' });
  }
}
