import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyGive extends MacroCommand {

  aliases = ['party give'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are not in a party!');
    if (!this.game.partyHelper.isLeader(player)) return this.sendMessage(player, 'You are not the party leader!');
    if (player.username === args.stringArgs) return this.sendMessage(player, 'You cannot give lead to yourself!');

    const newLeaderPlayer = this.game.playerManager.getPlayerByUsername(args.stringArgs);
    if (!newLeaderPlayer) return this.sendMessage(player, 'That person is not in game!');

    if (!this.game.partyHelper.isInSameParty(player, newLeaderPlayer)) return this.sendMessage(player, 'That person is not in your party!');

    this.game.partyHelper.giveParty(newLeaderPlayer);

    this.sendMessage(player, `${newLeaderPlayer.name} is the new party leader.`);
  }

}
