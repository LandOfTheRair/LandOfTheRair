import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyBreak extends MacroCommand {
  override aliases = ['party break'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) {
return this.sendMessage(player, 'You are not in a party!');
}
    if (!this.game.partyHelper.isLeader(player)) {
return this.sendMessage(player, 'You are not the party leader!');
}

    this.game.partyHelper.breakParty(player);

    this.sendMessage(player, 'Broke up the party.');
  }
}
