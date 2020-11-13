
import { GameAction, IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class SearchCommand extends MacroCommand {

  aliases = ['search'];
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    args.callbacks.emit({
      action: GameAction.SettingsShowWindow,
      windowName: 'ground'
    });

    args.callbacks.emit({
      action: GameAction.SettingsActiveWindow,
      windowName: 'ground'
    });

    // TODO: search corpses
  }

}
