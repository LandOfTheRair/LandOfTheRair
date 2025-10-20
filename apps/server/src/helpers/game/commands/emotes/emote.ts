import { MacroCommand, worldMapStateGetForCharacter } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { cleanMessage } from '@lotr/shared';

export class Emote extends MacroCommand {
  override aliases = ['emote'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = worldMapStateGetForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);

    const cleanedEmote = cleanMessage(args.stringArgs);
    if (args.stringArgs !== cleanedEmote) {
      this.sendChatMessage(player, 'Have some decency!');
      return;
    }

    playersInView.forEach((p) => {
      this.sendChatMessage(p, `${player.name} ${cleanedEmote}!`);
    });
  }
}
