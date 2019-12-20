import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class LobbySay extends MacroCommand {

  aliases = ['lobbysay'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.messageHelper.broadcastChatMessage(player, args.stringArgs);
  }

}
