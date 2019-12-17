import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Echo extends MacroCommand {

  name = ['echo'];
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.sendMessage(args.game, player, `test`);
  }

}
