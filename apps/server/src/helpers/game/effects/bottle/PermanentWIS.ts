import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentWIS extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const canGainMPFromWisPots =
      this.game.contentManager.getClassConfigSetting<'canGainMPFromWisPots'>(
        char.baseClass,
        'canGainMPFromWisPots',
      );

    const canGainMP =
      canGainMPFromWisPots &&
      this.game.characterHelper.getBaseStat(char, Stat.MP) < 200;
    if (canGainMP) {
      this.game.characterHelper.gainPermanentStat(char, Stat.MP, 2);
    }

    const max =
      this.game.configManager.MAX_POTION_STAT[
        effect.effectInfo.tier as string
      ] ?? 13;
    if (this.game.characterHelper.getBaseStat(char, Stat.WIS) >= max) {
      return this.sendMessage(char, { message: 'The fluid was tasteless.' });
    }

    this.game.characterHelper.gainPermanentStat(
      char,
      Stat.WIS,
      effect.effectInfo.potency,
    );
    this.sendMessage(char, {
      message: 'You feel like you can make better decisions!',
    });
  }
}
