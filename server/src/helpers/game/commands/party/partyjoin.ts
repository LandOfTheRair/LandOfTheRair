import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyJoin extends MacroCommand {

  override aliases = ['party join'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are already in a party!');

    const party = this.game.partyManager.getParty(args.stringArgs);
    if (!party) return this.sendMessage(player, 'That party does not exist!');

    const leaderPlayer = this.game.playerManager.getPlayerByUsername(party.members[0]);
    if (!leaderPlayer) return this.sendMessage(player, 'Somehow, that person is not in game!');

    if (!this.game.targettingHelper.isVisibleTo(player, leaderPlayer, true)) return this.sendMessage(player, 'You do not see the leader!');

    this.game.partyHelper.joinParty(player, party.name);

    this.sendMessage(player, `Welcome to the "${party.name}" party.`);
  }

}
