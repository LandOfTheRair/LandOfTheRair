import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyBreak extends MacroCommand {

  aliases = ['party break'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are not in a party!');
    if (!this.game.partyHelper.isLeader(player)) return this.sendMessage(player, 'You are not the party leader!');

    this.game.partyHelper.breakParty(player);

    this.sendMessage(player, 'Broke up the party.');
  }

}
