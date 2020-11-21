import { ICharacter, IStatusEffect, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class PermanentSTR extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {

    const max = this.game.configManager.MAX_POTION_STAT[effect.effectInfo.tier as string];
    if (this.game.characterHelper.getBaseStat(char, Stat.STR) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(char, Stat.STR, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'Your muscles are bulging!' });
  }

}
