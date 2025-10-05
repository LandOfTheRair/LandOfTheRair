import { sample } from 'lodash';
import { Parser } from 'muud';

import { distanceFrom, Game } from '../../../../helpers';
import {
  IAIBehavior,
  INPC,
  IPlayer,
  IVendorBehavior,
  MapLayer,
} from '../../../../interfaces';
import { Player } from '../../../orm';

export class ExitWarperBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IVendorBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const mapData = game.worldManager.getMap(npc.map);
        if (!mapData || !mapData.map) return 'We seem to be lost!';

        const exits = mapData.map.tiledJSON.layers[
          MapLayer.Interactables
        ].objects.filter((x) => x.type === 'Teleport');

        if (exits.length === 0) {
          return "Whoops! Sorry! You can't leave yet!";
        }

        const chosenPoint = sample(exits);

        game.teleportHelper.teleport(player as Player, {
          x: chosenPoint.x / 64,
          y: chosenPoint.y / 64,
        });

        return `Hello, ${env?.player.name}! And goodbye!`;
      });
  }

  tick() {}
}
