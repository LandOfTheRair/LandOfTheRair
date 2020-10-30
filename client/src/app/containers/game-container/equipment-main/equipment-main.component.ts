import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { IPlayer, ISimpleItem, ItemClass, ItemSlot } from '../../../../models';
import { GameState } from '../../../../stores';
import { AssetService } from '../../../asset.service';

import { GameService } from '../../../game.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-equipment-main',
  templateUrl: './equipment-main.component.html',
  styleUrls: ['./equipment-main.component.scss']
})
export class EquipmentMainComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;

  public readonly slots = [
    // coins are special, we skip that slot

    {
      template: 'coin'
    },
    {
      slot: 'ear',
      name: 'Earring',
    },
    {
      slot: 'head',
      name: 'Helm'
    },
    {
      slot: 'neck',
      name: 'Amulet'
    },
    {},

    {
      slot: 'waist',
      name: 'Sash'
    },
    {},
    {},
    {},
    {
      slot: 'wrists',
      name: 'Bracers'
    },

    {
      slot: 'ring1',
      name: 'Ring'
    },
    {
      template: 'hand',
      name: 'Right Hand',
      slot: 'rightHand',
      hand: 'Right'
    },
    {},
    {
      template: 'hand',
      name: 'Left Hand',
      slot: 'leftHand',
      hand: 'Left'
    },
    {
      slot: 'ring2',
      name: 'Ring'
    },

    {
      slot: 'hands',
      name: 'Gloves'
    },
    {},
    {},
    {},
    {
      slot: 'feet',
      name: 'Boots'
    },

    {
      template: 'potion',
      slot: 'potion',
      name: 'Potion'
    },
    {
      slot: 'body',
      name: 'Armor'
    },
    {
      slot: 'robe1',
      name: 'Robe'
    },
    {
      slot: 'robe2',
      name: 'Robe'
    },
    {}

  ];

  constructor(
    public gameService: GameService,
    public assetService: AssetService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  createContext(slot: any, player: IPlayer) {
    return { slot, player };
  }

  canShowValue(slot: ItemSlot, item: ISimpleItem): boolean {
    if (!item) return false;
    return this.assetService.getItem(item.name).itemClass === ItemClass.Coin;
  }

}
