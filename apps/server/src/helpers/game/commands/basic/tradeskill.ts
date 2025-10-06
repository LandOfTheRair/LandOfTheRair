import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Tradeskill extends MacroCommand {
  override aliases = ['tradeskill'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
return this.sendMessage(player, 'You must specify a tradeskill!');
}

    const validTradeskills =
      this.game.contentManager.getGameSetting(
        'tradeskill',
        'validTradeskills',
      ) || [];
    if (!validTradeskills.includes(args.stringArgs)) {
return this.sendMessage(player, 'Not a valid tradeskill!');
}

    args.callbacks.emit({
      action: GameAction.ShowTradeskill,
      tradeskill: args.stringArgs,
    });
  }
}
