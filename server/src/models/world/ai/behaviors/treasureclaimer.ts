
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, INPC, IPlayer, distanceFrom, ITreasureClaimer } from '../../../../interfaces';

export class TreasureClaimerBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: ITreasureClaimer) {

    const { treasureMap } = behavior;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (!treasureMap) return 'Hello, I seem to not have a valid map!';

        /*
        const messages = [`Hello, ${env?.player.name}! I've done some scouting of ${spoilerLog}, and here are my findings:<br><br>`];

        const log = game.rngDungeonGenerator.getSpoilerLog(spoilerLog);
        const visibleLogs = (player as Player).isGM ? log : log.filter(x => !x.isGM);

        messages.push(...visibleLogs.map(x => `• ${x.message}`));

        const formattedChat: IDialogChatAction = {
          message: messages.join('<br>'),
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Thanks', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return messages;
        */
        return 'test!';
      });

  }

  tick() {}
}
