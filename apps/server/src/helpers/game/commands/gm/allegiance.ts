import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Allegiance } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMAllegiance extends MacroCommand {
  override aliases = ['@allegiance', '@a'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: NewAllegiance');
      return;
    }

    const allegiance = Allegiance[args.stringArgs];
    if (!allegiance) {
return this.sendMessage(player, 'That is not a valid allegiance.');
}
    player.allegiance = allegiance;
    this.sendMessage(player, `Your allegiance is now ${allegiance}.`);
  }
}
