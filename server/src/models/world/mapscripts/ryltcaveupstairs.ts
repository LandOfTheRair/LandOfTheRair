import { Game } from '../../../helpers';
import { IMapScript } from '../../../interfaces';
import { WorldMap } from '../Map';
import { MapState } from '../MapState';

export class RyltCaveUpstairsScript implements IMapScript {
  readonly name = 'Rylt Cave Upstairs';

  setup(game: Game, map: WorldMap, mapState: MapState) {

    if (!game.groundManager.isChestLooted(map.name, 'Chest 1')) {
      const gold = game.itemCreator.getGold(100000);
      const scale = game.itemCreator.getSimpleItem('Ether Scale');

      const chest1 = map.findInteractableByName('Chest 1');
      chest1.searchItems = [gold, scale];
    }
  }

  events() {

  }
}
