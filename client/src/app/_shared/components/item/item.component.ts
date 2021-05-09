import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { isNumber } from 'lodash';

import { ArmorClass, canUseItem, descTextFor, EquipHash, EquippableItemClasses,
  IItem, IPlayer, ISimpleItem, ItemClass, ItemSlot, WeaponClass } from '../../../../interfaces';
import { GameState, SetCurrentItemTooltip } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';
import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';
import { UIService } from '../../../services/ui.service';

// const POSSIBLE_TRADESKILL_SCOPES = ['Alchemy', 'Spellforging', 'Metalworking'];

export type MenuContext = 'Sack' | 'Belt' | 'Ground' | 'DemiMagicPouch'
                        | 'GroundGroup' | 'Equipment' | 'Left'
                        | 'Right' | 'Coin' | 'Merchant' | 'Potion'
                        | 'Obtainagain' | 'Wardrobe' | 'Kollection' | 'Tradeskill';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: [
    './item.component.scss',
    './item.cosmetics.scss'
  ]
})
export class ItemComponent implements OnDestroy {

  @Select(GameState.currentVendorWindow) vendor$: Observable<any>;

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
  @Input() public transparent = false;
  @Input() public withdrawInStacks = false;
  @Input() public canDrag = true;
  @Input() public size: 'xsmall' | 'small' | 'normal' = 'normal';

  public scopes: string[] = [];

  get shouldAnimate(): boolean {
    return !this.optionsService.stopItemAnimations;
  }

  get displayOnly(): boolean {
    return !this.context;
  }

  get isEquippable(): boolean {
    if (!this.item || !this.realItem) return false;
    return EquippableItemClasses.includes(this.realItem.itemClass as WeaponClass|ArmorClass);
  }

  get realSuccorInfo() {
    return this.item.mods?.succorInfo ?? this.realItem?.succorInfo;
  }

  get realOunces() {
    return this.item.mods?.ounces ?? this.realItem?.ounces;
  }

  get realCount() {
    return this.count ?? this.item?.mods.shots;
  }

  get imgUrl() {
    if (!this.item || !this.realItem) return this.assetService.itemsUrl;

    if (this.item && this.realItem.itemClass === ItemClass.Corpse) {
      return this.assetService.creaturesUrl;
    }

    return this.assetService.itemsUrl;
  }

  get animUrl() {
    if (!this.item || !this.realItem) return this.assetService.itemsAnimationsUrl;
    return this.assetService.itemsAnimationsUrl;
  }

  get cosmeticName(): string {
    if (!this.item || !this.realItem) return '';
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
    if (!this.item || !this.realItem) return '0px 0px';
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
    return descTextFor(this.viewingPlayer, this.item, this.realItem, null, 0, this.viewingPlayer.traits?.traitsLearned?.Appraise ? 1 : 0);
  }

  get isStackableMaterial(): boolean {
    if (!this.item) return false;
    return this.withdrawInStacks;
  }

  @HostBinding('style.--animation-index')
  get spriteAnimation(): number {
    return (this.item?.mods?.animation ?? this.realItem?.animation);
  }

  get hasSpriteAnimation(): boolean {
    return isNumber(this.spriteAnimation);
  }

  get shouldSpriteAnimate(): boolean {
    return this.hasSpriteAnimation && true;
  }

  constructor(
    private store: Store,
    private assetService: AssetService,
    private optionsService: OptionsService,
    private uiService: UIService,
    public gameService: GameService
  ) {}

  ngOnDestroy(): void {
    setTimeout(() => {
      this.removeDesc();
    }, 0);
  }

  getDragData() {
    return {
      item: this.item,
      realItem: this.realItem,
      context: this.context,
      contextSlot: this.contextSlot,
      containerUUID: this.containerUUID,
      isStackableMaterial: this.isStackableMaterial
    };
  }

  attemptToMultiselect($event) {
    if (!this.item || !['Belt', 'Sack', 'Equipment'].includes(this.context)) return;

    if (!$event.ctrlKey) {
      this.uiService.resetSelection();
      return;
    }

    this.uiService.select(this.context.toLowerCase(), this.contextSlot, this.getDragData());
  }

  determineScopes(): void {
    if (!this.context || !this.item || !this.realItem || !this.viewingPlayer || !this.canDrag) return;

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

    // materials can additionally go to left, right, sack
    if (this.context === 'Kollection') scopes.push('left', 'right', 'sack');

    // you can sell anything on your person if it isn't a coin or a corpse
    if (this.realItem.itemClass !== ItemClass.Coin
    && this.realItem.itemClass !== ItemClass.Corpse
    && this.context !== 'Obtainagain'
    && this.context !== 'Equipment'
    && this.context !== 'GroundGroup'
    && this.context !== 'Wardrobe'
    && this.context !== 'Kollection'
    && this.context !== 'Merchant'
    && this.context !== 'Ground') scopes.push('merchant');

    // you can stash anything that's not a coin or a corpse
    // who the hell would put a corpse in their locker anyway?
    if (this.realItem.itemClass !== ItemClass.Coin
    && this.realItem.itemClass !== ItemClass.Corpse) {
      scopes.push('wardrobe', 'kollection');
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
    && this.context !== 'GroundGroup'
    && this.context !== 'Merchant'
    && this.context !== 'Obtainagain'
    && this.context !== 'Kollection'
    && this.context !== 'Wardrobe') scopes.push('use');

    this.scopes = scopes;
  }

  doMoveAction(choice: string, args: { dropUUID?: string } = {}): void {
    this.uiService.doDropAction({
      context: this.context,
      contextSlot: this.contextSlot,
      containerUUID: this.containerUUID,
      isStackableMaterial: this.isStackableMaterial,
      item: this.item,
      realItem: this.realItem
    }, choice, args.dropUUID);
  }

  doUseAction(): void {
    this.gameService.sendCommandString(`!use ${this.context.toLowerCase()}`);
  }

  automaticallyTakeActionBasedOnOpenWindows(): void {
    if (!this.context || !this.item || !this.viewingPlayer) return;

    // these items shouldn't be dropped accidentally
    if (this.realItem.destroyOnDrop || this.item.mods?.destroyOnDrop) { return; }

    combineLatest([
      this.vendor$
    ])
    .pipe(first())
    .subscribe(([vendor]) => {

      // if we have a vendor open, we auto-sell stuff
      if (vendor) {
        if (['Right', 'Left', 'Sack', 'Belt', 'DemiMagicPouch'].includes(this.context)) {
          this.doMoveAction('M', { dropUUID: vendor.npcUUID });
          return;
        }

        if (this.realItem.isBeltable) {
          this.doMoveAction('B');
        } else if (this.realItem.isSackable) {
          this.doMoveAction('S');
        } else {
          this.doMoveAction('R');
        }

        return;
      }

      // if we have a wardrobe open, we try to belt, then sack, if nothing else equip
      if (this.context.includes('Wardrobe')) {

        if (this.realItem.isBeltable) {
          this.doMoveAction('B');
        } else if (this.realItem.isSackable) {
          this.doMoveAction('S');
        } else {
          this.doMoveAction('E');
        }

        return;
      }

      // if we can use it, we use it
      if (canUseItem(this.viewingPlayer, this.item, this.realItem) && (this.context === 'Right' || this.context === 'Left')) {
        this.doUseAction();
        return;

      } else if (this.context !== 'Ground' && this.context !== 'GroundGroup') {
        if (this.context === 'Right' || this.context === 'Left') {
          this.doMoveAction('B');
          return;
        }

        if (this.context === 'Belt') {
          this.doMoveAction('R');
          return;
        }

        this.doMoveAction('G');
        return;

      } else if (this.context === 'Ground' || this.context === 'GroundGroup') {

        if (this.isEquippable) {
          this.doMoveAction('E');
          return;
        }

        if (this.realItem.isBeltable) {
          this.doMoveAction('B');
          return;

        } else if (this.realItem.isSackable) {
          this.doMoveAction('S');
          return;
        }

      }
    });

  }

  updateWithDesc(): void {
    if (!this.item || !this.showDesc) return;

    this.store.dispatch(new SetCurrentItemTooltip(this.descText, this.item.mods?.upgrades ?? []));
    this.hasTooltip = true;
  }

  removeDesc(): void {
    if (!this.hasTooltip) return;

    this.store.dispatch(new SetCurrentItemTooltip('', []));
    this.hasTooltip = false;
  }

}
