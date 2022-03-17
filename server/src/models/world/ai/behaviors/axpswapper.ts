import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { distanceFrom, GameServerResponse, IAIBehavior, IAXPSwapper, IDialogChatAction, INPC, IPlayer } from '../../../../interfaces';

export class AXPSwapperBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IAXPSwapper) {

    const level = game.contentManager.getGameSetting('npcscript', 'axpswapper.level') ?? 50;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';
        if (player.level < level) return 'You might want to come back when you get a little bit stronger.';

        const message = `Greetings, ${player.name}!
        I can provide you with a way to become more powerful, at the cost of killing more powerful creatures.
        Just tell me if you want to SWAP.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: `Swap to ${player.gainingAXP ? 'normal experience' : 'ancient experience'}`, action: 'swap' },
            { text: 'Leave', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });

    parser.addCommand('swap')
      .setSyntax(['swap'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';
        if (player.level < level) return 'You might want to come back when you get a little bit stronger.';

        player.gainingAXP = !player.gainingAXP;

        const message = player.gainingAXP
          ? 'Done. Now you must kill elite creatures with strength that rivals your own, but you can gain powerful rewards instead!'
          : 'Done. Now you will gain experience like you used to.' ;

        return message;
      });
  }

  tick() {}
}
