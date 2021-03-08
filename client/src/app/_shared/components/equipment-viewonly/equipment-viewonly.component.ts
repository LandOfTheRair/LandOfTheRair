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
  @Input() public hideGold = false;

  public readonly slots = [
    {
      template: 'coin',
      scope: 'coin',
      dropScope: 'Sack',
      canShow: () => !this.hideGold
    },
    {
      slot: 'ear',
      name: 'Earring',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
      slot: 'head',
      name: 'Helm',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
      slot: 'neck',
      name: 'Amulet',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {},

    {
      slot: 'waist',
      name: 'Sash',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {},
    {},
    {},
    {
      slot: 'wrists',
      name: 'Bracers',
      dropScope: 'Equipment',
      canShow: () => true
    },

    {
      slot: 'ring1',
      name: 'Ring',
      scope: 'ring',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
      template: 'hand',
      name: 'Right Hand',
      slot: 'rightHand',
      scope: 'right',
      dropScope: 'Right',
      hand: 'Right',
      canShow: () => true
    },
    {},
    {
      template: 'hand',
      name: 'Left Hand',
      slot: 'leftHand',
      scope: 'left',
      dropScope: 'Left',
      hand: 'Left',
      canShow: () => true
    },
    {
      slot: 'ring2',
      name: 'Ring',
      scope: 'ring',
      dropScope: 'Equipment',
      canShow: () => true
    },

    {
      slot: 'hands',
      name: 'Gloves',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {},
    {},
    {},
    {
      slot: 'feet',
      name: 'Boots',
      dropScope: 'Equipment',
      canShow: () => true
    },

    {
      slot: 'potion',
      name: 'Potion',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
      slot: 'armor',
      scope: ['armor', 'robe'],
      name: 'Armor',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
      slot: 'robe1',
      name: 'Robe',
      scope: 'robe',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
    slot: 'robe2',
      name: 'Robe',
      scope: 'robe',
      dropScope: 'Equipment',
      canShow: () => true
    },
    {
      slot: 'ammo',
      name: 'Ammo',
      dropScope: 'Equipment',
      canShow: () => true
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
