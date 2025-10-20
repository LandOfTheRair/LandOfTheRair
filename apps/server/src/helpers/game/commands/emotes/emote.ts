import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class Emote extends MacroCommand {
  override aliases = ['emote'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);

    const cleanedEmote = this.game.profanityHelper.cleanMessage(
      args.stringArgs,
    );
    if (args.stringArgs !== cleanedEmote) {
      this.sendChatMessage(player, 'Have some decency!');
      return;
    }

    playersInView.forEach((p) => {
      this.sendChatMessage(p, `${player.name} ${cleanedEmote}!`);
    });
  }
}
