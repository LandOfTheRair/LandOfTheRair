import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyCreate extends MacroCommand {

  aliases = ['party create'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are already in a party!');
    if (this.game.partyManager.getParty(args.stringArgs)) return this.sendMessage(player, 'That party already exists!');

    this.game.partyHelper.createParty(player, args.stringArgs.substring(0, 15));
    this.sendMessage(player, `You've created the "${args.stringArgs}" party!`);
  }

}
