import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { select, Store } from '@ngxs/store';
import { isNumber } from 'lodash';

import {
  ArmorClass,
  EquipHash,
  EquippableItemClasses,
  IPlayer,
  ISimpleItem,
  ItemClass,
  ItemSlot,
  WeaponClass,
} from '@lotr/interfaces';
import { canUseItem, descTextFor } from '@lotr/shared';
import { GameState, SetCurrentItemTooltip } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';
import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';
import { UIService } from '../../../services/ui.service';

export type MenuContext =
  | 'Sack'
  | 'Belt'
  | 'Ground'
  | 'DemiMagicPouch'
  | 'GroundGroup'
  | 'Equipment'
  | 'Left'
  | 'Right'
  | 'Coin'
  | 'Merchant'
  | 'Potion'
  | 'Obtainagain'
  | 'Wardrobe'
  | 'Kollection'
  | 'Tradeskill';

export type ItemSize = 'xsmall' | 'small' | 'normal';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss', './item.cosmetics.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent implements OnDestroy {
  private store = inject(Store);
  private assetService = inject(AssetService);
  private optionsService = inject(OptionsService);
  private uiService = inject(UIService);
  public gameService = inject(GameService);

  public vendor = select(GameState.currentVendorWindow);

  private hasTooltip: boolean;

  public item = input<ISimpleItem>();

  public count = input<number>();
  public ounces = input<number>();
  public showDesc = input<boolean>(true);
  public showValue = input<boolean>(false);
  public showOunces = input<boolean>(false);
  public showCount = input<boolean>(true);
  public showBackground = input<boolean>(false);
  public showEncrust = input<boolean>(true);
  public showOutline = input<boolean>(false);
  public context = input<MenuContext | string>();
  public contextSlot = input<number | string>();
  public containerUUID = input<string>();
  public overrideValue = input<number | string>();
  public viewingPlayer = input<IPlayer>();
  public transparent = input<boolean>(false);
  public withdrawInStacks = input<boolean>(false);
  public canDrag = input<boolean>(true);
  public size = input<ItemSize>('normal');

  public scopes = computed(() => {
    const context = this.context();
    const item = this.item();
    const realItem = this.realItem();
    const realItemClass = realItem?.itemClass;
    const viewingPlayer = this.viewingPlayer();

    if (!context || !item || !realItem || !viewingPlayer || !this.canDrag()) {
      return [];
    }

    const scopes = new Set<string>();

    if (context === 'Left' || context === 'Right') {
      scopes.add('trade');
    }

    // if any hands are empty, or you're looking at left/right hand, they can move into the hand area
    if (
      !viewingPlayer.items.equipment[ItemSlot.LeftHand] ||
      !viewingPlayer.items.equipment[ItemSlot.RightHand] ||
      context === 'Left' ||
      context === 'Right'
    ) {
      scopes.add('right');
      scopes.add('left');
    }

    // if you have a coin, it can go... to your coin
    if (realItemClass === ItemClass.Coin) {
      scopes.add('coin');
    }

    // if we're not buying back stuff or looking at a merchant, we can drag to the ground
    // also, it can go to its equipment slot if possible
    if (context !== 'Obtainagain' && context !== 'Merchant') {
      scopes.add('ground');
      scopes.add('mapground');

      const itemType = EquipHash[realItemClass] as ItemSlot;
      if (itemType) scopes.add(itemType.toLowerCase());
    }

    // materials can additionally go to left, right, sack
    if (context === 'Kollection') {
      scopes.add('left');
      scopes.add('right');
      scopes.add('sack');
    }

    // you can sell anything on your person if it isn't a coin or a corpse
    if (
      realItemClass !== ItemClass.Coin &&
      realItemClass !== ItemClass.Corpse &&
      context !== 'Obtainagain' &&
      context !== 'Equipment' &&
      context !== 'GroundGroup' &&
      context !== 'Wardrobe' &&
      context !== 'Kollection' &&
      context !== 'Merchant' &&
      context !== 'Ground'
    ) {
      scopes.add('merchant');
    }

    // you can stash anything that's not a coin or a corpse
    // who the hell would put a corpse in their locker anyway?
    if (
      realItemClass !== ItemClass.Coin &&
      realItemClass !== ItemClass.Corpse
    ) {
      scopes.add('wardrobe');
      scopes.add('kollection');
    }

    // if we have a bottle and it's on our person, we can equip it
    if (
      realItemClass === ItemClass.Bottle &&
      (context === 'Sack' ||
        context === 'DemiMagicPouch' ||
        context === 'Ground' ||
        context === 'Right' ||
        context === 'Left')
    ) {
      scopes.add('potion');
    }

    // if the item is sackable or beltable, it can go there
    if (realItemClass && context !== 'Coin') {
      scopes.add('sack');
      scopes.add('demimagicpouch');
    }

    if (realItem.isBeltable) {
      scopes.add('belt');
      scopes.add('demimagicpouch');
    }

    // special cases...
    if (
      realItemClass === ItemClass.Halberd &&
      viewingPlayer?.allTraits?.BigBelt
    ) {
      scopes.add('belt');
    }

    // item is usable if we can use it, if it's a bottle, and it's not coming from ground or equipment
    if (
      (canUseItem(viewingPlayer, item, realItem) ||
        realItemClass === ItemClass.Bottle) &&
      context !== 'GroundGroup' &&
      context !== 'Merchant' &&
      context !== 'Obtainagain' &&
      context !== 'Kollection' &&
      context !== 'Wardrobe'
    ) {
      scopes.add('use');
    }

    return [...scopes];
  });

  get shouldAnimate(): boolean {
    return !this.optionsService.stopItemAnimations;
  }

  @HostBinding('style.--animation-index')
  get spriteAnimation(): number {
    return this.item()?.mods?.animation ?? this.realItem()?.animation;
  }

  get hasSpriteAnimation(): boolean {
    return isNumber(this.spriteAnimation);
  }

  get shouldSpriteAnimate(): boolean {
    return this.hasSpriteAnimation && true;
  }

  constructor() {
    effect(() => {
      const item = this.item();

      if (!item) {
        this.removeDesc();
      }
    });
  }

  public realItem = computed(() => {
    if (!this.item()) return null;
    return this.assetService.getItem(this.item().name);
  });

  public displayOnly = computed(() => !this.context());

  get isEquippable(): boolean {
    if (!this.item() || !this.realItem()) return false;
    return EquippableItemClasses.includes(
      this.realItem().itemClass as WeaponClass | ArmorClass,
    );
  }

  public realSuccorInfo = computed(
    () => this.item().mods?.succorInfo ?? this.realItem()?.succorInfo,
  );
  public realOunces = computed(
    () => this.item().mods?.ounces ?? this.realItem()?.ounces,
  );
  public realCount = computed(() => this.count() ?? this.item()?.mods.shots);

  public imgUrl = computed(() => {
    if (!this.item() || !this.realItem()) return this.assetService.itemsUrl;

    if (this.item() && this.realItem().itemClass === ItemClass.Corpse) {
      return this.assetService.creaturesUrl;
    }

    return this.assetService.itemsUrl;
  });

  public animUrl = computed(() => {
    if (!this.item() || !this.realItem()) {
      return this.assetService.itemsAnimationsUrl;
    }

    return this.assetService.itemsAnimationsUrl;
  });

  public cosmeticName = computed(() => {
    if (!this.item() || !this.realItem()) return '';
    if (
      this.item().mods.searchItems &&
      this.item().mods.searchItems.length > 0
    ) {
      return 'UnsearchedCorpse';
    }

    const cosmetic = this.item().mods?.cosmetic || this.realItem().cosmetic;

    if (!cosmetic) return '';
    if (this.item().mods.condition <= 10000) return '';

    return cosmetic.name;
  });

  public glowColor = computed(() => {
    if (this.item().mods.condition <= 0) return 'glow-black';
    if (this.item().mods.condition <= 5000) return 'glow-red';
    if (this.item().mods.condition <= 10000) return 'glow-yellow';
    return 'glow-none';
  });

  public spriteLocation = computed(() => {
    if (!this.item() || !this.realItem()) return '0px 0px';
    const divisor = this.realItem().itemClass === ItemClass.Corpse ? 40 : 32;
    const sprite = this.item().mods.sprite || this.realItem().sprite;
    const y = Math.floor(sprite / divisor);
    const x = sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  });

  public encrustLocation = computed(() => {
    if (!this.item() || !this.item().mods?.encrustItem) return '0px 0px';
    const encrustItem = this.assetService.getItem(this.item().mods.encrustItem);
    if (!encrustItem) return '0px 0px';

    const divisor = 32;
    const y = Math.floor(encrustItem.sprite / divisor);
    const x = encrustItem.sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  });

  public descText = computed(() => {
    if (!this.item()) return '';
    const encrustItem = this.item().mods?.encrustItem
      ? this.assetService.getItem(this.item().mods.encrustItem)
      : null;
    return descTextFor(
      this.viewingPlayer(),
      this.item(),
      this.realItem(),
      encrustItem,
      0,
      this.viewingPlayer()?.traits?.traitsLearned?.Appraise ? 1 : 0,
    );
  });

  public isStackableMaterial = computed(() => {
    if (!this.item()) return false;
    return this.withdrawInStacks();
  });

  ngOnDestroy(): void {
    setTimeout(() => {
      this.removeDesc();
    }, 0);
  }

  getDragData() {
    return {
      item: this.item(),
      realItem: this.realItem(),
      context: this.context(),
      contextSlot: this.contextSlot(),
      containerUUID: this.containerUUID(),
      isStackableMaterial: this.isStackableMaterial(),
    };
  }

  attemptToMultiselect($event) {
    if (
      !this.item() ||
      !['Belt', 'Sack', 'Equipment'].includes(this.context())
    ) {
      return;
    }

    if (!$event.ctrlKey) {
      this.uiService.resetSelection();
      return;
    }

    this.uiService.select(
      this.context().toLowerCase(),
      this.contextSlot(),
      this.getDragData(),
    );
  }

  doMoveAction(choice: string, args: { dropUUID?: string } = {}): void {
    this.uiService.doDropAction(
      {
        context: this.context(),
        contextSlot: this.contextSlot(),
        containerUUID: this.containerUUID(),
        isStackableMaterial: this.isStackableMaterial(),
        item: this.item(),
        realItem: this.realItem(),
      },
      choice,
      args.dropUUID,
    );
  }

  doUseAction(): void {
    this.gameService.sendCommandString(`!use ${this.context().toLowerCase()}`);
  }

  automaticallyTakeActionBasedOnOpenWindows(): void {
    const context = this.context();
    const realItem = this.realItem();

    if (!context || !this.item() || !this.viewingPlayer()) return;

    // these items shouldn't be dropped accidentally
    if (this.realItem()?.destroyOnDrop || this.item().mods?.destroyOnDrop) {
      return;
    }

    const vendor = this.vendor();
    // if we have a vendor open, we auto-sell stuff
    if (vendor) {
      if (
        ['Right', 'Left', 'Sack', 'Belt', 'DemiMagicPouch'].includes(context)
      ) {
        this.doMoveAction('M', { dropUUID: vendor.npcUUID });
        return;
      }

      if (realItem.isBeltable) {
        this.doMoveAction('B');
      } else if (realItem.isSackable) {
        this.doMoveAction('S');
      } else {
        this.doMoveAction('R');
      }

      return;
    }

    // if we have a wardrobe open, we try to belt, then sack, if nothing else equip
    if (context.includes('Wardrobe')) {
      if (realItem.isBeltable) {
        this.doMoveAction('B');
      } else if (realItem.isSackable) {
        this.doMoveAction('S');
      } else {
        this.doMoveAction('E');
      }

      return;
    }

    // if we can use it, we use it
    if (
      canUseItem(this.viewingPlayer(), this.item(), realItem) &&
      (context === 'Right' || context === 'Left')
    ) {
      this.doUseAction();
      return;
    } else if (context !== 'Ground' && context !== 'GroundGroup') {
      if (context === 'Equipment' && realItem.isSackable) {
        this.doMoveAction('S');
        return;
      }

      if (context === 'Equipment' && realItem.isBeltable) {
        this.doMoveAction('B');
        return;
      }

      if (context === 'Right' || context === 'Left') {
        this.doMoveAction('B');
        return;
      }

      if (context === 'Belt') {
        this.doMoveAction('R');
        return;
      }

      if (context === 'Sack' && this.isEquippable) {
        this.doMoveAction('E');
        return;
      }

      this.doMoveAction('G');
      return;
    } else if (context === 'Ground' || context === 'GroundGroup') {
      if (realItem.isBeltable) {
        this.doMoveAction('B');
        return;
      } else if (realItem.isSackable) {
        this.doMoveAction('S');
        return;
      }

      if (!this.viewingPlayer().items.equipment[ItemSlot.RightHand]) {
        this.doMoveAction('R');
        return;
      }

      if (!this.viewingPlayer().items.equipment[ItemSlot.LeftHand]) {
        this.doMoveAction('L');
        return;
      }
    }
  }

  updateWithDesc(): void {
    if (!this.item() || !this.showDesc()) return;

    this.store.dispatch(
      new SetCurrentItemTooltip(
        this.descText(),
        this.item().mods?.upgrades ?? [],
      ),
    );
    this.hasTooltip = true;
  }

  removeDesc(): void {
    if (!this.hasTooltip) return;

    this.store.dispatch(new SetCurrentItemTooltip('', []));
    this.hasTooltip = false;
  }
}
