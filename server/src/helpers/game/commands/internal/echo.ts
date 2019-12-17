import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Echo extends MacroCommand {

  aliases = ['echo'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.sendMessage(player, args.stringArgs);
  }

}
