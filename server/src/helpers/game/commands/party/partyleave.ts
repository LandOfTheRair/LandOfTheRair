import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyLeave extends MacroCommand {

  aliases = ['party leave'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are not in a party!');

    this.game.partyHelper.leaveParty(player);
    this.sendMessage(player, 'You\'ve left the party.');
  }

}
