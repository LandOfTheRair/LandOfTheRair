import { DamageClass, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMXP extends MacroCommand {

  aliases = ['@xp'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const value = +args.stringArgs;
    this.game.playerHelper.gainExp(player, value);
  }
}
