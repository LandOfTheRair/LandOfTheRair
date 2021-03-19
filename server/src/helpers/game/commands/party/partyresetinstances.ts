import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class PartyResetInstances extends MacroCommand {

  aliases = ['party resetinstances'];
  canBeInstant = true;
  canBeFast = true;

  async execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.game.partyHelper.isInParty(player)) return this.sendMessage(player, 'You are not in a party!');
    if (!this.game.partyHelper.isLeader(player)) return this.sendMessage(player, 'You are not the party leader!');

    const partyName = this.game.partyHelper.partyName(player);

    // validate if any player exists in any party map
    if (this.game.worldManager.isAnyPlayerInPartyMap(partyName)) {
      return this.sendMessage(player, 'Someone is in one of your party instances, and they cannot be cleared at this time.');
    }

    // remove all the grounds for the party that exists
    await this.game.groundManager.removeGroundsForParties(partyName);

    this.sendMessage(player, 'You\'ve reset all instances for your party!');
  }

}
