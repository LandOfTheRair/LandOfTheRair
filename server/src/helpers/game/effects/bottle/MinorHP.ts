import { ICharacter, IStatusEffect, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class MinorHP extends Effect {

  apply(char: ICharacter, effect: IStatusEffect) {

    if (this.game.characterHelper.getBaseStat(char, Stat.HP) >= 200) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(char, Stat.HP, effect.effectInfo.potency);
    this.sendMessage(char, { message: 'You feel like you could take on the world!' });
  }

}
