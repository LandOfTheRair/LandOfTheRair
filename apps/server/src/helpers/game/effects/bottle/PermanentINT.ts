import { getBaseStat } from '@lotr/characters';
import { settingClassConfigGet } from '@lotr/content';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentINT extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const canGainMPFromIntPots = settingClassConfigGet<'canGainMPFromIntPots'>(
      char.baseClass,
      'canGainMPFromIntPots',
    );

    const canGainMP = canGainMPFromIntPots && getBaseStat(char, Stat.MP) < 200;
    if (canGainMP) {
      this.game.characterHelper.gainPermanentStat(char, Stat.MP, 2);
    }

    const max =
      this.game.configManager.MAX_POTION_STAT[
        effect.effectInfo.tier as string
      ] ?? 13;
    if (getBaseStat(char, Stat.INT) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(
      char,
      Stat.INT,
      effect.effectInfo.potency,
    );
    this.sendMessage(char, {
      message: 'Your head is swimming with knowledge!',
    });
  }
}
