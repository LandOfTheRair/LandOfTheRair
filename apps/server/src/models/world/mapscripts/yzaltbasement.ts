import type { IMapScript } from '@lotr/interfaces';

import type { WorldMap } from '@lotr/core';
import type { Game } from '../../../helpers';
import type { MapState } from '../MapState';

export class YzaltBasementScript implements IMapScript {
  readonly name = 'Yzalt Basement';

  setup(game: Game, map: WorldMap, mapState: MapState) {
    if (!game.groundManager.isChestLooted(map.name, 'Chest 1')) {
      const possibleItems = [
        'Steffen Offensive Sash',
        'Yzalt Basic Sash',
        'Heniz Agility Sash',
        'Yzalt MagicResist Bracers',
        'Heniz Dexterity Bracers',
        'Yzalt Defensive Claws',
        'Yzalt Combat Boots',
        'Yzalt Combat Amulet',
        'Yzalt Armor Ring',
        'Steffen DamageResist Ring',
        'Heniz Intelligence Ring',
        'Heniz Battlemage Gloves',
        'Steffen Strength Gloves',
        'Steffen Mana Ring',
        'Steffen Wisdom Amulet',
      ];

      const items = game.lootHelper
        .chooseWithReplacement(possibleItems)
        .map((x) => game.itemCreator.getSimpleItem(x));
      const chest1 = map.findInteractableByName('Chest 1');
      chest1.searchItems = items;
    }
  }

  events() {}

  handleEvent() {}
}
