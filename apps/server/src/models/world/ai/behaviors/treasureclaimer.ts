import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
  ISimpleItem,
  ITreasureClaimer,
} from '@lotr/interfaces';
import { GameServerResponse, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';
import type { Player } from '../../../orm';

export class TreasureClaimerBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: ITreasureClaimer) {
    const { treasureMap, teleportMap, teleportX, teleportY } = behavior;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return '[The pylon does not acknowledge your existence.]';

        if (distanceFrom(player, npc) > 2) {
          return '[The pylon requires you to be closer.]';
        }

        if (!treasureMap) return '[The pylon is misconfigured.]';

        if (game.rngDungeonGenerator.hasClaimed(treasureMap, player.uuid)) {
          return '[The pylon is dim towards you.]';
        }

        const message =
          '[The pylon urges you to grasp at your desired treasure.]';

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            {
              text: 'The breastplate -- I want new armor',
              action: 'take armor',
            },
            { text: 'The sword -- I want a new weapon', action: 'take weapon' },
            { text: 'The ring -- I want new jewelry', action: 'take jewelry' },
            { text: 'The gem -- I want an encrustable', action: 'take gem' },
            { text: 'Take nothing', action: 'noop' },
          ],
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return '[The pylon urges you to grasp at your desired treasure - TAKE a WEAPON, ARMOR, JEWELRY, or GEM.]';
      });

    parser
      .addCommand('take')
      .setSyntax(['take <string:type*>'])
      .setLogic(async ({ env, args }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) {
          return '[The pylon requires you to be closer.]';
        }

        if (!treasureMap) return '[The pylon is misconfigured.]';

        if (game.rngDungeonGenerator.hasClaimed(treasureMap, player.uuid)) {
          return '[The pylon is dim towards you.]';
        }

        const type = args['type*'];
        if (!['weapon', 'armor', 'jewelry', 'gem'].includes(type)) {
          return '[The pylon finds your query confusing.]';
        }

        if (player.items.equipment[ItemSlot.RightHand]) {
          return '[The pylon requires your right hand to be empty.]';
        }

        const randomItem = game.rngDungeonGenerator.getRandomItemFromMap(
          treasureMap,
          type,
          type === 'gem' ? [] : ['Powerful', 'Legendary'],
        );

        if (!randomItem) {
          return '[The pylon finds your query confusing, and requests a different choice.]';
        }

        const item: ISimpleItem = game.itemCreator.getSimpleItem(
          randomItem.name,
        );
        game.characterHelper.setRightHand(player, item);

        game.rngDungeonGenerator.claim(treasureMap, player.uuid);

        game.teleportHelper.teleport(player as Player, {
          map: teleportMap,
          x: teleportX,
          y: teleportY,
        });

        game.achievementsHelper.achievementEarn(
          player as Player,
          'Raider of the Lost Chest',
        );

        return '[The pylon acknowledges your query.]';
      });
  }

  tick() {}
}
