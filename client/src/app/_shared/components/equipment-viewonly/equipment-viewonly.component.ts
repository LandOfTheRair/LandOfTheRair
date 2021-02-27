import { Component, Input, OnInit } from '@angular/core';
import { IPlayer, ISimpleItem, ItemClass, ItemSlot } from '../../../../interfaces';
import { AssetService } from '../../../services/asset.service';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-equipment-viewonly',
  templateUrl: './equipment-viewonly.component.html',
  styleUrls: ['./equipment-viewonly.component.scss']
})
export class EquipmentViewOnlyComponent implements OnInit {

  @Input() public player: IPlayer;

  public readonly slots = [
    {
      template: 'coin',
      scope: 'coin',
      dropScope: 'Sack'
    },
    {
      slot: 'ear',
      name: 'Earring',
      dropScope: 'Equipment'
    },
    {
      slot: 'head',
      name: 'Helm',
      dropScope: 'Equipment'
    },
    {
      slot: 'neck',
      name: 'Amulet',
      dropScope: 'Equipment'
    },
    {},

    {
      slot: 'waist',
      name: 'Sash',
      dropScope: 'Equipment'
    },
    {},
    {},
    {},
    {
      slot: 'wrists',
      name: 'Bracers',
      dropScope: 'Equipment'
    },

    {
      slot: 'ring1',
      name: 'Ring',
      scope: 'ring',
      dropScope: 'Equipment'
    },
    {
      template: 'hand',
      name: 'Right Hand',
      slot: 'rightHand',
      scope: 'right',
      dropScope: 'Right',
      hand: 'Right'
    },
    {},
    {
      template: 'hand',
      name: 'Left Hand',
      slot: 'leftHand',
      scope: 'left',
      dropScope: 'Left',
      hand: 'Left'
    },
    {
      slot: 'ring2',
      name: 'Ring',
      scope: 'ring',
      dropScope: 'Equipment'
    },

    {
      slot: 'hands',
      name: 'Gloves',
      dropScope: 'Equipment'
    },
    {},
    {},
    {},
    {
      slot: 'feet',
      name: 'Boots',
      dropScope: 'Equipment'
    },

    {
      slot: 'potion',
      name: 'Potion',
      dropScope: 'Equipment'
    },
    {
      slot: 'armor',
      scope: ['armor', 'robe'],
      name: 'Armor',
      dropScope: 'Equipment'
    },
    {
      slot: 'robe1',
      name: 'Robe',
      scope: 'robe',
      dropScope: 'Equipment'
    },
    {
    slot: 'robe2',
      name: 'Robe',
      scope: 'robe',
      dropScope: 'Equipment'
    },
    {
      slot: 'ammo',
      name: 'Ammo',
      dropScope: 'Equipment'
    },

  ];

  constructor(public uiService: UIService, public assetService: AssetService) { }

  ngOnInit() {
  }

  createContext(slot: any, player: IPlayer) {
    return { slot, player };
  }

  canShowValue(slot: ItemSlot, item: ISimpleItem): boolean {
    if (!item) return false;
    return this.assetService.getItem(item.name).itemClass === ItemClass.Coin;
  }

}
