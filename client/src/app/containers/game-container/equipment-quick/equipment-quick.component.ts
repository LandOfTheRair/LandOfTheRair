import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';
import {
  IPlayer,
  ISimpleItem,
  ItemClass,
  ItemSlot,
} from '../../../../interfaces';
import { GameState } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-equipment-quick',
  templateUrl: './equipment-quick.component.html',
  styleUrls: ['./equipment-quick.component.scss'],
})
export class EquipmentQuickComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;

  public readonly slots = [
    {
      template: 'coin',
      scope: 'coin',
      dropScope: 'Sack',
    },
    {
      template: 'hand',
      name: 'Right Hand',
      slot: 'rightHand',
      scope: 'right',
      dropScope: 'Right',
      hand: 'Right',
    },
    {},
    {
      template: 'hand',
      name: 'Left Hand',
      slot: 'leftHand',
      scope: 'left',
      dropScope: 'Left',
      hand: 'Left',
    },
    {
      slot: 'potion',
      name: 'Potion',
      dropScope: 'Equipment',
    },
  ];

  public uiService = inject(UIService);
  public gameService = inject(GameService);
  public assetService = inject(AssetService);

  createContext(slot: any, player: IPlayer) {
    return { slot, player };
  }

  canShowValue(slot: ItemSlot, item: ISimpleItem): boolean {
    if (!item) return false;
    return this.assetService.getItem(item.name).itemClass === ItemClass.Coin;
  }
}
