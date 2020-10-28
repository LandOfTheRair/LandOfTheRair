import { Component, Input, OnDestroy } from '@angular/core';
import { EquippableItemClasses, IItem, ISimpleItem, ItemClass } from '../../../../models';
import { AssetService } from '../../../asset.service';

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
    return EquippableItemClasses.includes(this.realItem.itemClass);
  }

  get realOunces() {
    return this.item.mods.ounces;
  }

  get realCount() {
    return this.item.mods.shots;
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

    if (!this.item.mods.cosmetic) return '';
    if (this.item.mods.condition <= 10000) return '';

    return this.item.mods.cosmetic.name;
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
    const y = Math.floor(this.realItem.sprite / divisor);
    const x = this.realItem.sprite % divisor;
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

    // TODO: sense desc etc
    return this.item.mods.desc || this.realItem.desc;
  }

  get isStackableMaterial(): boolean {
    if (!this.item) return false;
    return false;
    // if (!isNumber(ValidMaterialItems[this.item.name])) return false;
    // return MaterialSlotInfo[ValidMaterialItems[this.item.name]].withdrawInOunces;
  }

  get effectName(): string {
    if (!this.item) return '';
    if (!this.item.mods.effect) return '';
    return this.item.mods.effect.name;
  }

  constructor(private assetService: AssetService) {}

  ngOnDestroy(): void {
    this.removeDesc();
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

  determineScopes(): void {
    if (!this.context || !this.item) return;
    /*

    const scopes = [];

    if (this.context !== 'Obtainagain' && this.context !== 'Merchant') {
      scopes.push('ground', 'mapground');

      const itemType = this.player.determineItemType(this.item.itemClass);
      scopes.push(itemType.toLowerCase());
    }

    if (!this.player.leftHand || !this.player.rightHand || this.context === 'Left' || this.context === 'Right') {
      scopes.push('right', 'left');
    }

    if (this.item.itemClass === 'Coin') {
      scopes.push('coin');
    }

    if (this.item.itemClass !== 'Coin'
    && this.item.itemClass !== 'Corpse'
    && this.context !== 'Obtainagain'
    && this.context !== 'Equipment'
    && this.context !== 'GroundGroup'
    && this.context !== 'Ground') scopes.push('merchant');

    if (this.item.itemClass !== 'Coin'
    && this.item.itemClass !== 'Corpse') {
      scopes.push('wardrobe');

      if (this.context !== 'GroundGroup') {
        POSSIBLE_TRADESKILL_SCOPES.forEach(skill => {
          if (this.colyseusGame[`show${skill}`].uuid) {
            scopes.push(skill.toLowerCase());
          }
        });
      }
    }

    if (this.item.itemClass === 'Bottle'
    && (this.context === 'Sack'
      || this.context === 'DemiMagicPouch'
      || this.context === 'Ground'
      || this.context === 'Right'
      || this.context === 'Left')) {
      scopes.push('potion');
    }

    if (this.item.isSackable) scopes.push('sack', 'demimagicpouch');
    if (this.item.isBeltable) scopes.push('belt', 'demimagicpouch');

    if (
      ((this.item.canUse && this.item.canUse(this.player)) || this.item.itemClass === 'Bottle')
    && this.context !== 'GroundGroup'
    && this.context !== 'Equipment') scopes.push('use');

    this.scopes = scopes;
    */

    this.scopes = [];
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

    /*
    this.colyseusGame.updateCurrentItemDesc(this.descText);
    this.hasTooltip = true;
    */
  }

  removeDesc(): void {
    if (!this.hasTooltip) return;

    /*
    this.colyseusGame.updateCurrentItemDesc('');
    this.hasTooltip = false;
    */
  }

}
