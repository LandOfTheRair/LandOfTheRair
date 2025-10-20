import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class PartySay extends MacroCommand {
  override aliases = ['partysay'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const partyName = this.game.partyHelper.partyName(player);
    if (!partyName) {
      this.sendMessage(player, 'You do not have a party!');
      return;
    }

    const party = this.game.partyManager.getParty(partyName);
    if (!party) {
      this.sendMessage(player, 'You do not have a party!');
      return;
    }

    this.game.partyHelper.partyMessage(
      party,
      `[Party] **${player.name}**: ${args.stringArgs}`,
    );
  }
}
