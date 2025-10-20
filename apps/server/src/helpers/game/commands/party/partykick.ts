import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class PartyKick extends MacroCommand {
  override aliases = ['party kick'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) {
      return this.sendMessage(player, 'You are not in a party!');
    }
    if (!this.game.partyHelper.isLeader(player)) {
      return this.sendMessage(player, 'You are not the party leader!');
    }
    if (player.username === args.stringArgs) {
      return this.sendMessage(player, 'You cannot kick yourself!');
    }

    const kickedPlayer = this.game.playerManager.getPlayerByUsername(
      args.stringArgs,
    );
    if (!kickedPlayer) {
      return this.sendMessage(player, 'That person is not in game!');
    }

    if (!this.game.partyHelper.isInSameParty(player, kickedPlayer)) {
      return this.sendMessage(player, 'That person is not in your party!');
    }

    this.game.partyHelper.kickPartyMember(kickedPlayer);

    this.sendMessage(player, `Kicked ${kickedPlayer.name} from your party.`);
  }
}
