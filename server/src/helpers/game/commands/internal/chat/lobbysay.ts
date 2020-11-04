import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class LobbySay extends MacroCommand {

  aliases = ['lobbysay'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const msg = this.game.profanityHelper.cleanMessage(args.stringArgs);
    this.game.messageHelper.broadcastChatMessage(player, msg);
  }

}
