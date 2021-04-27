import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMXP extends MacroCommand {

  override aliases = ['@gainexp', '@xp'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: XPGained');
      return;
    }

    const value = +args.stringArgs;
    this.game.playerHelper.gainExp(player, value);

    this.sendMessage(player, `You gained ${value} XP.`);
  }
}
