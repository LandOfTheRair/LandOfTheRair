import { MacroCommand, worldMapStateGetForCharacter } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { cleanMessage, truncateMessage } from '@lotr/shared';

export class Say extends MacroCommand {
  override aliases = ['say'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = worldMapStateGetForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const msg = truncateMessage(cleanMessage(args.stringArgs));

    playersInView.forEach((p) => {
      this.sendChatMessage(p, `**${player.name}**: ${msg}`);
    });
  }
}
