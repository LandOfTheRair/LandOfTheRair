import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyCreate extends MacroCommand {
  override aliases = ['party create'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (this.game.partyHelper.isInParty(player)) {
return this.sendMessage(player, 'You are already in a party!');
}
    if (this.game.partyManager.getParty(args.stringArgs)) {
return this.sendMessage(player, 'That party already exists!');
}

    const partyName = args.stringArgs.substring(0, 15).trim();
    if (!partyName) {
      return this.sendMessage(
        player,
        'You need to specify a valid party name!',
      );
    }

    this.game.partyHelper.createParty(player, partyName);
    this.sendMessage(player, `You've created the "${args.stringArgs}" party!`);
  }
}
