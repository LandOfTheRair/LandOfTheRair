import { DamageClass, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMGG extends MacroCommand {

  override aliases = ['@gg'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.combatHelper.dealOnesidedDamage(player, {
      damage: player.hp.maximum,
      damageClass: DamageClass.GM,
      damageMessage: 'Well why did you do that?',
      suppressIfNegative: true
    });

  }
}
