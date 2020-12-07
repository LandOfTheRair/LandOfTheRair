import { Allegiance, IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMAllegiance extends MacroCommand {

  aliases = ['@allegiance'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: NewAllegiance');
      return;
    }

    const allegiance = Allegiance[args.stringArgs];
    if (!allegiance) return this.sendMessage(player, 'That is not a valid allegiance.');
    player.allegiance = allegiance;
    this.sendMessage(player, `Your allegiance is now ${allegiance}.`);
  }
}
