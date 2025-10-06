import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyLeave extends MacroCommand {
  override aliases = ['party leave'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) {
return this.sendMessage(player, 'You are not in a party!');
}

    this.game.partyHelper.leaveParty(player);
    this.sendMessage(player, "You've left the party.");
  }
}
