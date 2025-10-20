import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';

export class GMGG extends MacroCommand {
  override aliases = ['@killself', '@gg'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.combatHelper.dealOnesidedDamage(player, {
      damage: player.hp.maximum,
      damageClass: DamageClass.GM,
      damageMessage: 'Well why did you do that?',
      suppressIfNegative: true,
    });
  }
}
