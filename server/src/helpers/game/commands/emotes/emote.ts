import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Emote extends MacroCommand {

  aliases = ['emote'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    const playersInView = state.getAllPlayersInRange(player, 4);

    const cleanedEmote = this.game.profanityHelper.cleanMessage(args.stringArgs);
    if (args.stringArgs !== cleanedEmote) {
      this.sendChatMessage(player, 'Have some decency!');
      return;
    }

    playersInView.forEach(p => {
      this.sendChatMessage(p, `${player.name} ${cleanedEmote}!`);
    });
  }
}
