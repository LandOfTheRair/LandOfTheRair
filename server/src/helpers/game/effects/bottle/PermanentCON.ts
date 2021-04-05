import { ICharacter, IStatusEffect, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class PermanentCON extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {

    const canGainHP = this.game.characterHelper.getBaseStat(char, Stat.HP) < 100;
    if (canGainHP) {
      this.game.characterHelper.gainPermanentStat(char, Stat.HP, 3);
    }

    const max = this.game.configManager.MAX_POTION_STAT[effect.effectInfo.tier as string];
    if (this.game.characterHelper.getBaseStat(char, Stat.CON) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(char, Stat.CON, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'Your stomach feels stronger!' });
  }

}
