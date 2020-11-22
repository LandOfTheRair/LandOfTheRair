import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';

import { ArmorClass, canUseItem, descTextFor, EquipHash, EquippableItemClasses,
  IItem, IPlayer, ISimpleItem, ItemClass, ItemSlot, WeaponClass } from '../../../../interfaces';
import { SetCurrentItemTooltip } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';

// const POSSIBLE_TRADESKILL_SCOPES = ['Alchemy', 'Spellforging', 'Metalworking'];

export type MenuContext = 'Sack' | 'Belt' | 'Ground' | 'DemiMagicPouch'
                        | 'GroundGroup' | 'Equipment' | 'Left'
                        | 'Right' | 'Coin' | 'Merchant' | 'Potion'
                        | 'Obtainagain' | 'Wardrobe' | 'WardrobeMaterial' | 'Tradeskill';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: [
    './item.component.scss',
    './item.cosmetics.scss'
  ]
})
export class ItemComponent implements OnDestroy {

  private simpleItem: ISimpleItem;
  private hasTooltip: boolean;

  @Input()
  public set item(item: ISimpleItem) {
    this.simpleItem = item;
    this.determineScopes();

    if (!item) this.removeDesc();
  }

  public get item(): ISimpleItem {
    return this.simpleItem;
  }

  public get realItem(): IItem {
    if (!this.item) return null;
    return this.assetService.getItem(this.item.name);
  }

  @Input() public count: number;
  @Input() public ounces: number;
  @Input() public showDesc = true;
  @Input() public showValue = false;
  @Input() public showOunces = false;
  @Input() public showCount = true;
  @Input() public showBackground: boolean;
  @Input() public showEncrust = true;
  @Input() public showOutline = false;
  @Input() public context: MenuContext;
  @Input() public contextSlot: number|string;
  @Input() public containerUUID: string;
  @Input() public overrideValue: number|string;
  @Input() public viewingPlayer: IPlayer;
  @Input() public size: 'xsmall' | 'small' | 'normal' = 'normal';

  public scopes: string[] = [];

  // TODO: option to animate
  get shouldAnimate(): boolean {
    return true;
  }

  get displayOnly(): boolean {
    return !this.context;
  }

  get isEquippable(): boolean {
    if (!this.item) return false;
    return EquippableItemClasses.includes(this.realItem.itemClass as WeaponClass|ArmorClass);
  }

  get realOunces() {
    return this.item.mods.ounces;
  }

  get realCount() {
    return this.count || this.item.mods.shots;
  }

  get imgUrl() {
    if (this.item && this.realItem.itemClass === ItemClass.Corpse) {
      return this.assetService.creaturesUrl;
    }

    return this.assetService.itemsUrl;
  }

  get cosmeticName(): string {
    if (!this.item) return '';
    if (this.item.mods.searchItems) return 'UnsearchedCorpse';

    const cosmetic = this.item.mods?.cosmetic || this.realItem.cosmetic;

    if (!cosmetic) return '';
    if (this.item.mods.condition <= 10000) return '';

    return cosmetic.name;
  }

  get glowColor() {
    if (this.item.mods.condition <= 0)     return 'glow-black';
    if (this.item.mods.condition <= 5000)  return 'glow-red';
    if (this.item.mods.condition <= 10000) return 'glow-yellow';
    return 'glow-none';
  }

  get spriteLocation() {
    if (!this.item) return '0px 0px';
    const divisor = this.realItem.itemClass === ItemClass.Corpse ? 40 : 32;
    const sprite = this.item.mods.sprite || this.realItem.sprite;
    const y = Math.floor(sprite / divisor);
    const x = sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  }

  get encrustLocation() {
    if (!this.item || !this.item.mods.encrustItem) return '0px 0px';
    const encrustItem = this.assetService.getItem(this.item.mods.encrustItem);
    const divisor = 32;
    const y = Math.floor(encrustItem.sprite / divisor);
    const x = encrustItem.sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  }

  get descText() {
    if (!this.item) return '';
    return descTextFor(this.viewingPlayer, this.item, this.realItem);
  }

  get isStackableMaterial(): boolean {
    if (!this.item) return false;
    return false;
    // if (!isNumber(ValidMaterialItems[this.item.name])) return false;
    // return MaterialSlotInfo[ValidMaterialItems[this.item.name]].withdrawInOunces;
  }

  constructor(private store: Store, private assetService: AssetService) {}

  ngOnDestroy(): void {
    setTimeout(() => {
      this.removeDesc();
    }, 0);
  }

  determineScopes(): void {
    if (!this.context || !this.item || !this.realItem || !this.viewingPlayer) return;

    const scopes = [];

    // if any hands are empty, or you're looking at left/right hand, they can move into the hand area
    if (!this.viewingPlayer.items.equipment[ItemSlot.LeftHand]
    || !this.viewingPlayer.items.equipment[ItemSlot.RightHand]
    || this.context === 'Left'
    || this.context === 'Right') {
      scopes.push('right', 'left');
    }

    // if you have a coin, it can go... to your coin
    if (this.realItem.itemClass === ItemClass.Coin) {
      scopes.push('coin');
    }

    // if we're not buying back stuff or looking at a merchant, we can drag to the ground
    // also, it can go to its equipment slot if possible
    if (this.context !== 'Obtainagain' && this.context !== 'Merchant') {
      scopes.push('ground', 'mapground');

      const itemType = EquipHash[this.realItem.itemClass] as ItemSlot;
      if (itemType) scopes.push(itemType.toLowerCase());
    }

    // you can sell anything on your person if it isn't a coin or a corpse
    if (this.realItem.itemClass !== ItemClass.Coin
    && this.realItem.itemClass !== ItemClass.Corpse
    && this.context !== 'Obtainagain'
    && this.context !== 'Equipment'
    && this.context !== 'GroundGroup'
    && this.context !== 'Merchant'
    && this.context !== 'Ground') scopes.push('merchant');

    // you can stash anything that's not a coin or a corpse
    // who the hell would put a corpse in their locker anyway?
    if (this.realItem.itemClass !== ItemClass.Coin
    && this.realItem.itemClass !== ItemClass.Corpse) {
      scopes.push('wardrobe');

      /*
      if (this.context !== 'GroundGroup') {
        POSSIBLE_TRADESKILL_SCOPES.forEach(skill => {
          if (this.colyseusGame[`show${skill}`].uuid) {
            scopes.push(skill.toLowerCase());
          }
        });
      }
      */
    }

    // if we have a bottle and it's on our person, we can equip it
    if (this.realItem.itemClass === ItemClass.Bottle
    && (this.context === 'Sack'
      || this.context === 'DemiMagicPouch'
      || this.context === 'Ground'
      || this.context === 'Right'
      || this.context === 'Left')) {
      scopes.push('potion');
    }

    // if the item is sackable or beltable, it can go there
    if (this.realItem.isSackable && this.context !== 'Coin') scopes.push('sack', 'demimagicpouch');
    if (this.realItem.isBeltable) scopes.push('belt', 'demimagicpouch');

    // item is usable if we can use it, if it's a bottle, and it's not coming from ground or equipment
    if ((canUseItem(this.viewingPlayer, this.item, this.realItem) || this.realItem.itemClass === ItemClass.Bottle)
    && this.context !== 'GroundGroup' && this.context !== 'Merchant' && this.context !== 'Obtainagain') scopes.push('use');

    this.scopes = scopes;
  }

  doColyseusMoveAction(choice): void {
    /*
    this.colyseusGame.buildAction(this.item, {
      context: this.context,
      contextSlot: this.contextSlot,
      containerUUID: this.containerUUID,
      isStackableMaterial: this.isStackableMaterial
    }, choice);
    */
  }

  doColyseusUseAction(): void {
    // this.colyseusGame.buildUseAction(this.item, this.context, this.contextSlot);
  }

  automaticallyTakeActionBasedOnOpenWindows(): void {

    /*
    if (!this.context || !this.item) return;

    if (this.context === 'Potion') {
      this.colyseusGame.sendCommandString('~drink');
      return;
    }

    if (this.colyseusGame.showShop.uuid) {

      if (this.context === 'Sack' || this.context === 'Belt' || this.context === 'DemiMagicPouch') {
        this.doColyseusMoveAction('M');
        return;

      } else if (this.context === 'Merchant' || this.context === 'Obtainagain') {

        if (this.item.isBeltable) {
          this.doColyseusMoveAction('B');
          return;

        } else if (this.item.isSackable) {
          this.doColyseusMoveAction('S');
          return;

        } else {
          this.doColyseusMoveAction('R');
          return;
        }
      }

    }

    if (this.colyseusGame.showLocker.length) {
      if (this.context === 'Wardrobe') {
        if (this.isEquippable) {

          const slot = ( this.colyseusGame.character as any).getItemSlotToEquipIn(this.item);
          if (slot === false) {
            this.doColyseusMoveAction('S');
            return;
          }

          this.doColyseusMoveAction('E');
          return;
        }

        if (this.item.isBeltable) {
          this.doColyseusMoveAction('B');
          return;
        }

        if (this.item.isSackable) {
          this.doColyseusMoveAction('S');
          return;
        }

      } else if (this.context === 'WardrobeMaterial') {
        this.doColyseusMoveAction('S');
        return;

      } else {
        this.doColyseusMoveAction('W');
        return;
      }
    }

    if (this.item.canUse && this.item.canUse(this.colyseusGame.character) && (this.context === 'Right' || this.context === 'Left')) {
      this.colyseusGame.buildUseAction(this.item, this.context);
      return;

    } else if (this.context !== 'Ground' && this.context !== 'GroundGroup') {
      if (this.context === 'Right' || this.context === 'Left') {
        this.doColyseusMoveAction('B');
        return;
      }

      if (this.context === 'Belt') {
        this.doColyseusMoveAction('R');
        return;
      }

      this.doColyseusMoveAction('G');
      return;

    } else if (this.context === 'Ground' || this.context === 'GroundGroup') {

      if (this.isEquippable) {

        const slot = ( this.colyseusGame.character as any).getItemSlotToEquipIn(this.item);
        if (slot !== false) {
          this.doColyseusMoveAction('E');
          return;
        }

      }

      if (this.item.isBeltable) {
        this.doColyseusMoveAction('B');
        return;

      } else if (this.item.isSackable) {
        this.doColyseusMoveAction('S');
        return;
      }

    }
    */

  }

  updateWithDesc(): void {
    if (!this.item || !this.showDesc) return;

    this.store.dispatch(new SetCurrentItemTooltip(this.descText));
    this.hasTooltip = true;
  }

  removeDesc(): void {
    if (!this.hasTooltip) return;

    this.store.dispatch(new SetCurrentItemTooltip(''));
    this.hasTooltip = false;
  }

}
