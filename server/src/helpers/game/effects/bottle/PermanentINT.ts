import { BaseClass, ICharacter, IStatusEffect, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class PermanentINT extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {

    const canGainMP = char.baseClass === BaseClass.Mage && this.game.characterHelper.getBaseStat(char, Stat.MP) < 200;
    if (canGainMP) {
      this.game.characterHelper.gainPermanentStat(char, Stat.MP, 2);
    }

    const max = this.game.configManager.MAX_POTION_STAT[effect.effectInfo.tier as string];
    if (this.game.characterHelper.getBaseStat(char, Stat.INT) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(char, Stat.INT, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'Your head is swimming with knowledge!' });
  }

}
