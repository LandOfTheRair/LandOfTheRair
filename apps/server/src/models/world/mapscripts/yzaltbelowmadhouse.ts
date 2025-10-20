import type { IMapScript } from '@lotr/interfaces';

import type { MapState, WorldMap } from '@lotr/core';
import type { IServerGame } from '@lotr/interfaces';

export class YzaltBelowMadhouseScript implements IMapScript {
  readonly name = 'Yzalt Below Madhouse';

  setup(game: IServerGame, map: WorldMap, mapState: MapState) {
    if (!game.groundManager.isChestLooted(map.name, 'Chest 1')) {
      const gold = game.itemCreator.getGold(100000);
      const scale = game.itemCreator.getSimpleItem('Ether Scale');
      const scale2 = game.itemCreator.getSimpleItem('Ether Scale');

      const chest1 = map.findInteractableByName('Chest 1');
      chest1.searchItems = [gold, scale, scale2];
    }
  }

  events() {}

  handleEvent() {}
}
