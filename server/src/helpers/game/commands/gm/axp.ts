import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMAXP extends MacroCommand {

  override aliases = ['@gainaxp', '@axp'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: AXPGained');
      return;
    }

    const value = +args.stringArgs;
    this.game.playerHelper.gainAxp(player, value);

    this.sendMessage(player, `You gained ${value} AXP.`);
  }
}
