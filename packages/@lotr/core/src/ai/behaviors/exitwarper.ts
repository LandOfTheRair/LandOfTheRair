import { sample } from 'lodash';
import type { Parser } from 'muud';

import type {
  IAIBehavior,
  INPC,
  IPlayer,
  IServerGame,
  IVendorBehavior,
} from '@lotr/interfaces';
import { MapLayer } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { worldGetMapAndState } from '../../worldstate';

export class ExitWarperBehavior implements IAIBehavior {
  init(
    game: IServerGame,
    npc: INPC,
    parser: Parser,
    behavior: IVendorBehavior,
  ) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const mapData = worldGetMapAndState(npc.map);
        if (!mapData || !mapData.map) return 'We seem to be lost!';

        const exits = mapData.map.tiledJSON.layers[
          MapLayer.Interactables
        ].objects.filter((x: any) => x.type === 'Teleport');

        if (exits.length === 0) {
          return "Whoops! Sorry! You can't leave yet!";
        }

        const chosenPoint = sample(exits);

        game.teleportHelper.teleport(player as IPlayer, {
          x: chosenPoint.x / 64,
          y: chosenPoint.y / 64,
        });

        return `Hello, ${env?.player.name}! And goodbye!`;
      });
  }

  tick() {}
}
