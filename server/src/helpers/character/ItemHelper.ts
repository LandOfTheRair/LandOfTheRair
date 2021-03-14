
import { Injectable } from 'injection-js';
import { cloneDeep, isUndefined } from 'lodash';

import { Allegiance, canUseItem, GameServerResponse, ICharacter, IDialogChatAction, IItem, IItemRequirements,
  IPlayer, ISimpleItem, isOwnedBy, ItemClass, ItemSlot, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { ContentManager } from '../data/ContentManager';

// functions related to MODIFYING an item
// not to be confused with ItemCreator which is for HELPER FUNCTIONS that CREATE ITEMS

@Injectable()
export class ItemHelper extends BaseService {

  constructor(
    private content: ContentManager
  ) {
    super();
  }

  public init() {}

  // get the real item for base information lookup
  public getItemDefinition(itemName: string): IItem {
    return this.content.getItemDefinition(itemName);
  }

  public getItemProperty(item: ISimpleItem | undefined, prop: keyof IItem): any {
    if (!item) return null;

    if (!isUndefined(item.mods[prop])) return item.mods[prop];

    const realItem = this.getItemDefinition(item.name);
    if (!realItem) return null;

    return realItem[prop];
  }

  public getItemProperties(item: ISimpleItem | undefined, props: Array<keyof IItem>): Partial<IItem> {
    const hash = {};
    props.forEach(prop => hash[prop] = this.getItemProperty(item, prop));
    return hash;
  }

  public setItemProperty(item: ISimpleItem, prop: keyof IItem, value: any): void {
    item.mods[prop] = value;
  }

  // encrust an item with another item
  public encrustItem(baseItem: ISimpleItem, encrustItem: ISimpleItem): void {
    baseItem.mods.encrustItem = encrustItem.name;
  }

  // check if an item can be used as an upgrade material
  public canUseItemForUpgrade(upgradeItem: ISimpleItem): boolean {
    return this.getItemProperty(upgradeItem, 'canUpgradeWith');
  }

  // check if an item can be upgraded
  public canUpgradeItem(baseItem: ISimpleItem, bypassLimit = false): boolean {
    if (bypassLimit) return true;
    const { maxUpgrades } = this.getItemProperties(baseItem, ['maxUpgrades']);
    return (baseItem.mods.upgrades?.length ?? 0) < (maxUpgrades ?? 0);
  }

  // upgrade an item with another item
  public upgradeItem(baseItem: ISimpleItem, upgradeItem: string, bypassLimit = false): boolean {
    const upgradeRef = this.game.itemCreator.getSimpleItem(upgradeItem);
    if (!upgradeRef) return false;
    if (!this.canUpgradeItem(baseItem, bypassLimit)) return false;

    baseItem.mods.upgrades = baseItem.mods.upgrades || [];
    baseItem.mods.upgrades.push(upgradeItem);

    return true;
  }

  // get an items stat
  public getStat(item: ISimpleItem, stat: Stat): number {
    const statMod = item.mods?.stats?.[stat] ?? 0;

    const baseItem = this.getItemDefinition(item.name);
    const baseStat = baseItem?.stats?.[stat] ?? 0;

    let encrustStat = 0;
    if (item.mods.encrustItem) {
      const encrustItem = this.getItemDefinition(item.mods.encrustItem);
      encrustStat = encrustItem.encrustGive?.stats?.[stat] ?? 0;
    }

    let upgradeStat = 0;
    if (item.mods.upgrades) {
      item.mods.upgrades.forEach(upgrade => {
        const upgradeItem = this.getItemDefinition(upgrade);
        if (!upgradeItem) return;

        upgradeStat += upgradeItem.stats?.[stat] ?? 0;
      });
    }

    return statMod + baseStat + encrustStat + upgradeStat;
  }

  // set the owner of an item
  public setOwner(player: IPlayer, item: ISimpleItem): void {
    item.mods.owner = player.username;
  }

  // check if an item is broken
  public isItemBroken(item: ISimpleItem) {
    const condition = this.getItemProperty(item, 'condition');
    return condition <= 0;
  }

  public isOwnedBy(character: ICharacter, item: ISimpleItem): boolean {
    return isOwnedBy(character as IPlayer, item);
  }

  public ownsAndItemUnbroken(character: ICharacter, item: ISimpleItem): boolean {
    if (!this.isOwnedBy(character as IPlayer, item)) return false; // this is safe to coerce, because npcs never tie items
    if (this.isItemBroken(item)) return false;

    return true;
  }

  // check if an item is usable
  public canGetBenefitsFromItem(player: IPlayer, item: ISimpleItem): boolean {
    if (!this.ownsAndItemUnbroken(player, item)) return false;

    // GMs can wear everything disregarding requirements
    if (player.allegiance === Allegiance.GM) return true;

    const requirements: IItemRequirements = this.game.itemHelper.getItemProperty(item, 'requirements');
    if (requirements) {
      if (requirements.alignment && player.alignment !== requirements.alignment) return false;
      if (requirements.baseClass && player.baseClass !== requirements.baseClass) return false;
      if (requirements.level && player.level < requirements.level) return false;
    }

    return true;
  }

  // check if an item is usable
  public reasonCantGetBenefitsFromItem(player: IPlayer, item: ISimpleItem): string {
    const requirements: IItemRequirements = this.game.itemHelper.getItemProperty(item, 'requirements');
    if (requirements) {
      if (requirements.alignment && player.alignment !== requirements.alignment) return 'Your alignment does not match this items!';
      if (requirements.baseClass && player.baseClass !== requirements.baseClass) return 'You are not the correct class for this item!';
      if (requirements.level && player.level < requirements.level) return 'You are not high enough level for this item!';
    }

    return 'You cannot use this item. Who knows why, the item must not like you?';
  }

  // gain or lose condition
  public gainCondition(item: ISimpleItem, conditionLoss: number, character: ICharacter) {

    const conditionLossModifier = Math.abs(conditionLoss) * (this.game.traitHelper.traitLevelValue(character, 'CarefulTouch') / 100);
    if (conditionLoss < 0) {
      conditionLoss += conditionLossModifier;
    }

    item.mods.condition = item.mods.condition || 20000;
    item.mods.condition += conditionLoss;
    item.mods.condition = Math.max(0, item.mods.condition);

    if (this.isItemBroken(item)) {
      this.game.characterHelper.recalculateEverything(character);
    }
  }

  public loseCondition(item: ISimpleItem, conditionLoss: number, character: ICharacter) {
    this.gainCondition(item, -conditionLoss, character);
  }

  // the AC modifier for an item in good or bad condition
  public conditionACModifier(item: ISimpleItem): number {
    item.mods.condition = item.mods.condition || 20000;

    if (item.mods.condition <= 0)     return -3;
    if (item.mods.condition <= 5000)  return -2;
    if (item.mods.condition <= 10000) return -1;
    if (item.mods.condition <= 20000) return 0;
    if (item.mods.condition <= 30000) return 1;
    if (item.mods.condition <= 40000) return 2;
    if (item.mods.condition <= 50000) return 3;
    if (item.mods.condition <= 99999) return 4;

    return 5;
  }

  // whether or not the player can use the item
  public canUseItem(player: IPlayer, item: ISimpleItem): boolean {
    return canUseItem(player, item, this.game.itemHelper.getItemDefinition(item.name));
  }

  // try to use the item in the equipment slot for the player
  public useItemInSlot(player: IPlayer, source: ItemSlot) {
    const item = player.items.equipment[source];
    if (!item) return;

    const { map } = this.game.worldManager.getMap(player.map);
    const { succorInfo, ounces, itemClass, trait } = this.getItemProperties(item, ['succorInfo', 'ounces', 'itemClass', 'trait']);
    if (succorInfo && !map.canSuccor(player)) {
      this.game.messageHelper.sendSimpleMessage(player, 'You stop, unable to envision the place in your memory!');
      return;
    }

    const canGetBenefits = this.canGetBenefitsFromItem(player, item);
    if (!canGetBenefits) return this.game.messageHelper.sendSimpleMessage(player, 'You cannot use that item!');
    if (!this.tryToUseItem(player, item, source)) {
      return this.game.messageHelper.sendSimpleMessage(player, 'You cannot use that item like that!');
    }

    const isUsableScroll = item.name.includes('Rune Scroll') && itemClass === ItemClass.Scroll;
    if (trait && isUsableScroll) {
      if (player.learnedRunes.includes(item.name)) {
        return this.game.messageHelper.sendSimpleMessage(player, 'You already know that rune!');
      }

      if (!trait.restrict?.includes(player.baseClass)) {
        return this.game.messageHelper.sendSimpleMessage(player, 'You cannot learn that rune!');
      }

      player.learnedRunes.push(item.name);
      this.game.messageHelper.sendSimpleMessage(player, `You've learned the rune symbol to enhance ${trait?.name}!`);
    }

    const totalOunces = ounces ?? 0;
    let shouldRemove = totalOunces <= 0 && (itemClass === ItemClass.Bottle || itemClass === ItemClass.Food || isUsableScroll);

    // if it's an empty bottle currently, we just remove it
    if (itemClass === ItemClass.Bottle && totalOunces === 0) {
      shouldRemove = true;
      this.game.messageHelper.sendSimpleMessage(player, 'The bottle was empty.');

    // otherwise we take away an ounce, and if it's empty, we toss it
    } else if (totalOunces > 0) {

      item.mods.ounces = totalOunces - 1;
      if (item.mods.ounces <= 0) shouldRemove = true;
    }

    // remove if we got an empty one
    if (shouldRemove) {
      this.game.characterHelper.setEquipmentSlot(player, source, undefined);
    }

    // if we magically have succor info, we teleport
    if (succorInfo) {
      this.game.playerHelper.doSuccor(player, succorInfo);
    }
  }

  // try to break the item
  public tryToBreakItem(player: ICharacter, item: ISimpleItem, source: ItemSlot): void {
    const { itemClass, useEffect } = this.getItemProperties(item, ['itemClass', 'useEffect']);

    if (useEffect && useEffect.uses && useEffect.uses !== 0) {

      // uses === -1 = permanent use
      if (useEffect.uses > 0) {
        item.mods.useEffect = useEffect;
        item.mods.useEffect.uses = useEffect.uses - 1;

        // it broke, rip
        if (useEffect.uses - 1 <= 0) {
          this.game.characterHelper.setEquipmentSlot(player, source, undefined);
          this.game.messageHelper.sendSimpleMessage(player, `Your ${itemClass?.toLowerCase() || 'item'} has fizzled and turned to dust.`);
          this.game.characterHelper.recalculateEverything(player);
        }
      }
    }
  }

  // try to actually use the item
  public tryToUseItem(player: IPlayer, item: ISimpleItem, source: ItemSlot): boolean {
    if (!this.canUseItem(player, item)) return false;

    const { itemClass, useEffect, ounces } = this.getItemProperties(item, ['itemClass', 'useEffect', 'ounces']);

    if (useEffect && (useEffect.uses || (ounces && ounces !== 0))) {
      if (!this.game.effectManager.getEffectData(useEffect.name)) {
        return false;
      }

      const { potency, extra, duration } = useEffect;
      const extraData = cloneDeep(extra || {});
      extraData.potency = potency;

      this.game.effectHelper.addEffect(player, '', useEffect.name, { effect: { duration, extra: extraData } });
    }

    this.tryToBreakItem(player, item, source);

    if (itemClass === ItemClass.Book) {
      this.useBook(player, item, source);
    }

    if (itemClass === ItemClass.Box) {
      this.useRNGBox(player, item, source);
    }

    return true;
  }

  public useBook(player: IPlayer, book: ISimpleItem, source: ItemSlot): void {
    const { bookCurrentPage, bookPages } = this.getItemProperties(book, ['bookCurrentPage', 'bookPages']);

    const page = bookCurrentPage ?? 0;
    const readPage = (bookPages || [])[page];

    if (!readPage) {
      this.game.messageHelper.sendSimpleMessage(player, 'This book has no pages to read!');
      return;
    }

    const formattedChat: IDialogChatAction = {
      displayTitle: `Book (page ${page + 1}/${bookPages?.length ?? 0})`,
      message: readPage.text,
      displayItemName: book.name,
      options: [
        { text: 'Previous Page', action: `prevpage ${source}` },
        { text: 'Next Page', action: `nextpage ${source}` },
        { text: 'Close Book', action: 'noop' },
      ]
    };

    this.game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);
  }

  public useRNGBox(player: IPlayer, box: ISimpleItem, source: ItemSlot): void {
    if (!this.game.itemHelper.isOwnedBy(player, box)) {
      this.game.messageHelper.sendSimpleMessage(player, 'This box isn\'t yours to open!');
      return;
    }

    const { containedItems } = this.game.itemHelper.getItemProperties(box, ['containedItems']);
    if (!containedItems || containedItems.length === 0) {
      this.game.messageHelper.sendSimpleMessage(player, 'The box was empty!');
      return;
    }

    const choice = this.game.lootHelper.chooseWithReplacement(containedItems, 1)[0];
    if (choice === 'none') {
      this.game.messageHelper.sendSimpleMessage(player, 'The box was empty! Better luck next time!');
      return;
    }

    const itemRef = this.game.itemCreator.getSimpleItem(choice);
    this.game.characterHelper.setEquipmentSlot(player, source, itemRef);

    this.game.messageHelper.sendSimpleMessage(player, 'You got something out of the box!');
  }

  // try to bind the item to the player, like when picking it up or equipping it
  public tryToBindItem(character: ICharacter, item: ISimpleItem): void {

    const { binds, desc, tellsBind, itemClass, owner } = this.getItemProperties(item,
      ['binds', 'tellsBind', 'itemClass', 'owner', 'desc']
    );

    if (binds && (character as IPlayer).username && !owner) {
      this.setItemProperty(item, 'owner', (character as IPlayer).username);
      this.game.messageHelper.sendLogMessageToPlayer(character, {
        message: `The ${(itemClass || 'item').toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.`
      });

      if (tellsBind) {
        this.game.messageHelper.sendLogMessageToRadius(character, 4, { message: `*** ${character.name} has looted ${desc}.` });
      }
    }
  }

}
