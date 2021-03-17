import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyKick extends MacroCommand {

  aliases = ['party kick'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are not in a party!');
    if (!this.game.partyHelper.isLeader(player)) return this.sendMessage(player, 'You are not the party leader!');
    if (player.username === args.stringArgs) return this.sendMessage(player, 'You cannot kick yourself!');

    const kickedPlayer = this.game.playerManager.getPlayerByUsername(args.stringArgs);
    if (!kickedPlayer) return this.sendMessage(player, 'That person is not in game!');

    if (!this.game.partyHelper.isInSameParty(player, kickedPlayer)) return this.sendMessage(player, 'That person is not in your party!');

    this.game.partyHelper.kickPartyMember(kickedPlayer);

    this.sendMessage(player, `Kicked ${kickedPlayer.name} from your party.`);
  }

}
