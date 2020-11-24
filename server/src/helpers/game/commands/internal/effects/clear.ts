import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';


export class ClearCommand extends MacroCommand {

  aliases = ['clear'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.playerHelper.clearActionQueue(player);
    this.game.messageHelper.sendLogMessageToPlayer(player, { message: 'Command buffer and current target cleared.', setTarget: null });
  }

}
