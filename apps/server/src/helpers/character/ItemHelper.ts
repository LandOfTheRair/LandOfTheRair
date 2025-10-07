import { Injectable } from 'injection-js';
import { cloneDeep, isNumber, isUndefined } from 'lodash';

import type {
  ICharacter,
  IDialogChatAction,
  IItem,
  IItemDefinition,
  IItemRequirements,
  IPlayer,
  ISimpleItem,
  ItemSlot,
  Stat,
  WeaponClass,
} from '@lotr/interfaces';
import {
  Allegiance,
  GameServerResponse,
  ItemClass,
  WeaponClasses,
} from '@lotr/interfaces';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

import { isPlayer } from '@lotr/characters';
import {
  coreRNGDungeonConfig,
  itemAllGet,
  itemGet,
  recipeGet,
  settingGameGet,
} from '@lotr/content';
import { calcTradeskillLevelForCharacter } from '@lotr/exp';
import { canUseItem, isOwnedBy } from '@lotr/shared';

// functions related to MODIFYING an item
// not to be confused with ItemCreator which is for HELPER FUNCTIONS that CREATE ITEMS

@Injectable()
export class ItemHelper extends BaseService {
  private conditionThresholds = {
    broken: 0,
    rough: 2500,
    tattered: 5000,
    belowAverage: 10000,
    average: 20000,
    aboveAverage: 30000,
    mint: 40000,
    aboveMint: 50000,
    perfect: 99999,
    heavenly: 999999,
  };

  private conditionACMods = {
    broken: -4,
    rough: -3,
    tattered: -2,
    belowAverage: -1,
    average: 0,
    aboveAverage: 1,
    mint: 2,
    aboveMint: 3,
    perfect: 4,
    heavenly: 5,
  };

  public init() {
    this.conditionThresholds = settingGameGet(
      'item',
      'conditionThresholds',
    ) ?? {
      broken: 0,
      rough: 2500,
      tattered: 5000,
      belowAverage: 10000,
      average: 20000,
      aboveAverage: 30000,
      mint: 40000,
      aboveMint: 50000,
      perfect: 99999,
      heavenly: 999999,
    };

    this.conditionACMods = settingGameGet('item', 'conditionACMods') ?? {
      broken: -4,
      rough: -3,
      tattered: -2,
      belowAverage: -1,
      average: 0,
      aboveAverage: 1,
      mint: 2,
      aboveMint: 3,
      perfect: 4,
      heavenly: 5,
    };
  }

  // get the real item for base information lookup
  public getItemDefinition(itemName: string): IItemDefinition {
    return itemGet(itemName)!;
  }

  public getItemProperty(
    item: ISimpleItem | undefined,
    prop: keyof IItem,
  ): any | undefined {
    if (!item) return undefined;

    if (!isUndefined(item.mods[prop])) return item.mods[prop];

    if (item.name === 'hands' || item.name === 'feet') return undefined;

    const realItem = this.getItemDefinition(item.name);
    if (!realItem) return undefined;

    return realItem[prop];
  }

  public getItemProperties(
    item: ISimpleItem | undefined,
    props: Array<keyof IItem>,
  ): Partial<IItem> {
    const hash = {};
    props.forEach((prop) => (hash[prop] = this.getItemProperty(item, prop)));
    return hash;
  }

  public setItemProperty(
    item: ISimpleItem,
    prop: keyof IItem,
    value: any,
  ): void {
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
  public upgradeItem(
    baseItem: ISimpleItem,
    upgradeItem: string,
    bypassLimit = false,
  ): boolean {
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
      if (encrustItem) {
        encrustStat = encrustItem.encrustGive?.stats?.[stat] ?? 0;
      }
    }

    let upgradeStat = 0;
    if (item.mods.upgrades) {
      item.mods.upgrades.forEach((upgrade) => {
        const upgradeItem = this.getItemDefinition(upgrade);
        if (!upgradeItem) return;

        upgradeStat += upgradeItem.stats?.[stat] ?? 0;
        upgradeStat += upgradeItem.randomStats?.[stat]?.min ?? 0;
      });
    }

    return statMod + baseStat + encrustStat + upgradeStat;
  }

  // set the owner of an item
  public setOwner(player: IPlayer, item: ISimpleItem): void {
    this.setItemProperty(item, 'owner', player.username);
  }

  // check if an item is broken
  public isItemBroken(item: ISimpleItem) {
    const condition = this.getItemProperty(item, 'condition');
    return condition <= 0;
  }

  public isOwnedBy(character: ICharacter, item: ISimpleItem): boolean {
    return isOwnedBy(character as IPlayer, item);
  }

  public ownsAndItemUnbroken(
    character: ICharacter,
    item: ISimpleItem,
  ): boolean {
    if (!this.isOwnedBy(character as IPlayer, item)) return false; // this is safe to coerce, because npcs never tie items
    if (this.isItemBroken(item)) return false;

    return true;
  }

  // check if an item is usable
  public canGetBenefitsFromItem(char: ICharacter, item: ISimpleItem): boolean {
    if (!this.ownsAndItemUnbroken(char, item)) return false;

    // GMs can wear everything disregarding requirements
    if (char.allegiance === Allegiance.GM) return true;

    const requirements: IItemRequirements =
      this.game.itemHelper.getItemProperty(item, 'requirements');
    if (requirements) {
      if (requirements.alignment && char.alignment !== requirements.alignment) {
        return false;
      }
      if (requirements.baseClass && char.baseClass !== requirements.baseClass) {
        return false;
      }
      if (requirements.level && char.level < requirements.level) return false;
    }

    return true;
  }

  public mergeItemRequirements(
    firstItemRequirements: IItemRequirements | undefined,
    secondItemRequirements: IItemRequirements,
  ) {
    if (!secondItemRequirements) {
      return firstItemRequirements;
    }
    if (!firstItemRequirements) {
      return secondItemRequirements;
    }

    const requirements = cloneDeep(firstItemRequirements);
    if (
      secondItemRequirements?.alignment &&
      !firstItemRequirements?.alignment
    ) {
      requirements.alignment = secondItemRequirements.alignment;
    }
    if (secondItemRequirements?.baseClass && !firstItemRequirements.baseClass) {
      requirements.baseClass = secondItemRequirements.baseClass;
    }
    if (
      (secondItemRequirements?.level ?? 1) > (firstItemRequirements?.level ?? 1)
    ) {
      requirements.level = secondItemRequirements.level ?? 0;
    }
    if (secondItemRequirements?.quest && !firstItemRequirements.quest) {
      requirements.quest = secondItemRequirements.quest;
    }

    return requirements;
  }

  // check if an item is usable
  public reasonCantGetBenefitsFromItem(
    player: IPlayer,
    item: ISimpleItem,
  ): string {
    const requirements: IItemRequirements =
      this.game.itemHelper.getItemProperty(item, 'requirements');
    if (requirements) {
      if (
        requirements.alignment &&
        player.alignment !== requirements.alignment
      ) {
        return 'Your alignment does not match this items!';
      }
      if (
        requirements.baseClass &&
        player.baseClass !== requirements.baseClass
      ) {
        return 'You are not the correct class for this item!';
      }
      if (requirements.level && player.level < requirements.level) {
        return 'You are not high enough level for this item!';
      }
    }

    return 'You cannot use this item. Who knows why, the item must not like you?';
  }

  // gain or lose condition
  public gainCondition(
    item: ISimpleItem,
    conditionLoss: number,
    character: ICharacter,
  ) {
    if (!item) return;

    const conditionLossModifier =
      Math.abs(conditionLoss) *
      (this.game.traitHelper.traitLevelValue(character, 'CarefulTouch') / 100);
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

  public loseCondition(
    item: ISimpleItem,
    conditionLoss: number,
    character: ICharacter,
  ) {
    this.gainCondition(item, -conditionLoss, character);
  }

  // the AC modifier for an item in good or bad condition
  public conditionACModifier(item: ISimpleItem): number {
    item.mods.condition = item.mods.condition || 20000;

    if (item.mods.condition <= this.conditionThresholds.broken) {
      return this.conditionACMods.broken;
    }
    if (item.mods.condition <= this.conditionThresholds.rough) {
      return this.conditionACMods.rough;
    }
    if (item.mods.condition <= this.conditionThresholds.tattered) {
      return this.conditionACMods.tattered;
    }
    if (item.mods.condition <= this.conditionThresholds.belowAverage) {
      return this.conditionACMods.belowAverage;
    }
    if (item.mods.condition <= this.conditionThresholds.average) {
      return this.conditionACMods.average;
    }
    if (item.mods.condition <= this.conditionThresholds.aboveAverage) {
      return this.conditionACMods.aboveAverage;
    }
    if (item.mods.condition <= this.conditionThresholds.mint) {
      return this.conditionACMods.mint;
    }
    if (item.mods.condition <= this.conditionThresholds.aboveMint) {
      return this.conditionACMods.aboveMint;
    }
    if (item.mods.condition <= this.conditionThresholds.perfect) {
      return this.conditionACMods.perfect;
    }

    return this.conditionACMods.heavenly;
  }

  // whether or not the player can use the item
  public canUseItem(player: IPlayer, item: ISimpleItem): boolean {
    return canUseItem(
      player,
      item,
      this.game.itemHelper.getItemDefinition(item.name)!,
    );
  }

  // try to use the item in the equipment slot for the player
  public useItemInSlot(player: IPlayer, source: ItemSlot, tryEffect = true) {
    const item = player.items.equipment[source];
    if (!item) return;

    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return;

    const { succorInfo, ounces, itemClass, trait, recipe } =
      this.getItemProperties(item, [
        'succorInfo',
        'ounces',
        'itemClass',
        'trait',
        'recipe',
      ]);

    if (succorInfo && !map.canSuccor(player)) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'You stop, unable to envision the place in your memory!',
      );
      return;
    }

    const canGetBenefits = this.canGetBenefitsFromItem(player, item);
    if (!canGetBenefits) {
      return this.game.messageHelper.sendSimpleMessage(
        player,
        'You cannot use that item!',
      );
    }
    if (tryEffect && !this.tryToUseItem(player, item, source)) {
      return this.game.messageHelper.sendSimpleMessage(
        player,
        'You cannot use that item like that!',
      );
    }

    const isUsableScroll =
      item.name.includes('Rune Scroll') && itemClass === ItemClass.Scroll;
    if (trait && isUsableScroll) {
      if (player.learnedRunes.includes(item.name)) {
        return this.game.messageHelper.sendSimpleMessage(
          player,
          'You already know that rune!',
        );
      }

      if (
        trait.restrict &&
        trait.restrict.length > 0 &&
        !trait.restrict.includes(player.baseClass)
      ) {
        return this.game.messageHelper.sendSimpleMessage(
          player,
          'You cannot learn that rune!',
        );
      }

      player.learnedRunes.push(item.name);
      this.game.messageHelper.sendSimpleMessage(
        player,
        `You've learned the rune symbol to enhance "${trait?.name}"!`,
      );
    }

    const isUsableRecipe =
      item.name.includes('Recipe Book') && itemClass === ItemClass.Scroll;
    if (recipe && isUsableRecipe) {
      if (player.learnedRecipes.includes(recipe)) {
        return this.game.messageHelper.sendSimpleMessage(
          player,
          'You already know that recipe!',
        );
      }

      const recipeRef = recipeGet(recipe);
      if (!recipeRef) {
        return this.game.messageHelper.sendSimpleMessage(
          player,
          'That recipe does not exist!',
        );
      }

      const skill = calcTradeskillLevelForCharacter(
        player,
        recipeRef.recipeType,
      );
      if (skill < recipeRef.requireSkill) {
        return this.game.messageHelper.sendSimpleMessage(
          player,
          `You are not skilled enough for that!
          You must be at least skill ${recipeRef.requireSkill} in ${recipeRef.recipeType} to learn this!`,
        );
      }

      player.learnedRecipes.push(recipe);
      this.game.messageHelper.sendSimpleMessage(
        player,
        `You've learned the recipe for "${recipe}"!`,
      );
    }

    const totalOunces = ounces ?? 0;
    let shouldRemove =
      totalOunces <= 0 &&
      (itemClass === ItemClass.Bottle ||
        itemClass === ItemClass.Food ||
        isUsableScroll ||
        isUsableRecipe);

    // if it's an empty bottle currently, we just remove it
    if (itemClass === ItemClass.Bottle && totalOunces === 0) {
      shouldRemove = true;
      this.game.messageHelper.sendSimpleMessage(
        player,
        'The bottle was empty.',
      );

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
  public tryToBreakItem(
    player: ICharacter,
    item: ISimpleItem,
    source: ItemSlot,
  ): void {
    const { itemClass, useEffect } = this.getItemProperties(item, [
      'itemClass',
      'useEffect',
    ]);

    if (useEffect && useEffect.uses && useEffect.uses !== 0) {
      // uses === -1 = permanent use
      if (useEffect.uses > 0) {
        item.mods.useEffect = cloneDeep(useEffect);
        item.mods.useEffect.uses = useEffect.uses - 1;

        // it broke, rip
        if (useEffect.uses - 1 <= 0) {
          this.game.characterHelper.setEquipmentSlot(player, source, undefined);
          this.game.messageHelper.sendSimpleMessage(
            player,
            `Your ${itemClass?.toLowerCase() || 'item'} has fizzled and turned to dust.`,
          );
          this.game.characterHelper.recalculateEverything(player);
        }
      }
    }
  }

  // try to actually use the item
  public tryToUseItem(
    player: IPlayer,
    item: ISimpleItem,
    source: ItemSlot,
  ): boolean {
    if (!this.canUseItem(player, item)) return false;

    const { itemClass, useEffect, ounces } = this.getItemProperties(item, [
      'itemClass',
      'useEffect',
      'ounces',
    ]);

    if (useEffect && (useEffect.uses || (ounces && ounces !== 0))) {
      if (
        !this.game.effectManager.getEffectData(
          useEffect.name,
          `TTUI:USE:${item.name}`,
        )
      ) {
        return false;
      }

      const { potency, extra, duration } = useEffect;
      const extraData = cloneDeep(extra || {}) as any;
      extraData.potency = potency;

      // an item with uses (ring, scroll) will cast instead of apply directly
      if (useEffect.uses) {
        this.game.spellManager.castSpell(useEffect.name, player, player, {
          duration: duration ?? 10,
          potency,
          extra: extraData,
        });

        // an item without uses (and has ounces, such as bottles) will apply the effect directly
      } else {
        this.game.effectHelper.addEffect(player, '', useEffect.name, {
          effect: { duration: duration ?? 10, extra: extraData },
        });
      }
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
    const { bookCurrentPage, bookItemFilter } = this.getItemProperties(book, [
      'bookCurrentPage',
      'bookItemFilter',
    ]);

    const page = bookCurrentPage ?? 0;

    if (bookItemFilter) {
      const pages = this.game.inventoryHelper.getItemsFromSackByName(
        player,
        bookItemFilter,
      );
      const removeItems: string[] = [];

      book.mods.bookPages = book.mods.bookPages || [];

      if (pages.length > 0) {
        pages.forEach((item) => {
          if (!this.isOwnedBy(player, item)) return;

          const { bookPage, extendedDesc } =
            this.game.itemHelper.getItemProperties(item, [
              'bookPage',
              'extendedDesc',
            ]);

          // if the item has a specific page and we don't have one, we set it
          if (isNumber(bookPage)) {
            const setPage: number = bookPage as number;

            if (!book.mods.bookPages![setPage]) {
              removeItems.push(item.uuid);
              book.mods.bookPages![setPage] = {
                id: item.name,
                text: extendedDesc ?? 'no description',
              };
            }

            // push it because the book is limitless
          } else {
            if (!book.mods.bookPages!.find((x) => x.id === item.name)) {
              removeItems.push(item.uuid);
              book.mods.bookPages!.push({
                id: item.name,
                text: extendedDesc ?? 'no description',
              });
            }
          }
        });

        if (removeItems.length > 0) {
          this.game.inventoryHelper.removeItemsFromSackByUUID(
            player,
            removeItems,
          );
          this.game.messageHelper.sendSimpleMessage(
            player,
            `You've added ${removeItems.length} pages to the book.`,
          );
          return;
        }
      }
    }

    const bookPages = this.game.itemHelper.getItemProperty(book, 'bookPages');
    const readPage = (bookPages || [])[page];

    if (!readPage) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'This book has no pages to read!',
      );
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
      ],
    };

    this.game.transmissionHelper.sendResponseToAccount(
      player.username,
      GameServerResponse.DialogChat,
      formattedChat,
    );
  }

  public useRNGBox(player: IPlayer, box: ISimpleItem, source: ItemSlot): void {
    if (!this.game.itemHelper.isOwnedBy(player, box)) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        "This box isn't yours to open!",
      );
      return;
    }

    const { containedItems } = this.game.itemHelper.getItemProperties(box, [
      'containedItems',
    ]);
    if (!containedItems || containedItems.length === 0) {
      this.game.messageHelper.sendSimpleMessage(player, 'The box was empty!');
      return;
    }

    const choice = this.game.lootHelper.chooseWithReplacement(
      containedItems,
      1,
    )[0];
    if (choice === 'none') {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'The box was empty! Better luck next time!',
      );
      return;
    }

    const itemRef = this.game.itemCreator.getSimpleItem(choice);
    this.game.characterHelper.setEquipmentSlot(player, source, itemRef);

    this.game.messageHelper.sendSimpleMessage(
      player,
      'You got something out of the box!',
    );
  }

  // try to bind the item to the player, like when picking it up or equipping it
  public tryToBindItem(character: ICharacter, item: ISimpleItem): void {
    const { binds, desc, tellsBind, itemClass, owner } = this.getItemProperties(
      item,
      ['binds', 'tellsBind', 'itemClass', 'owner', 'desc'],
    );

    if (binds && (character as IPlayer).username && !owner) {
      this.setItemProperty(item, 'owner', (character as IPlayer).username);
      this.game.messageHelper.sendLogMessageToPlayer(character, {
        message: `The ${(itemClass || 'item').toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.`,
      });

      if (tellsBind) {
        this.game.messageHelper.sendLogMessageToRadius(character, 4, {
          message: `*** ${character.name} has looted ${desc}.`,
        });
      }

      const ach = this.game.achievementsHelper.getItemForAchievementUse(
        item.name,
      );
      if (isPlayer(character) && ach) {
        this.game.achievementsHelper.earnAchievement(
          character as Player,
          ach.name,
        );
      }
    }
  }

  // search all items for similar things
  public searchItems(search: string): string[] {
    return Object.keys(itemAllGet()).filter((x) =>
      new RegExp(`.*${search}.*`, 'i').test(x),
    );
  }

  // check if the item comes from an "ether force" map
  public isEtherForceItem(itemName: string): boolean {
    return coreRNGDungeonConfig()
      .dungeonConfigs.map((x) => x.name)
      .some((name) => itemName.includes(name));
  }

  public markIdentified(item: ISimpleItem, tier: number): void {
    item.mods.identifyTier = Math.max(item.mods.identifyTier ?? 0, tier);
  }

  public isWeapon(item: ISimpleItem): boolean {
    const { itemClass } = this.getItemProperties(item, ['itemClass']);
    return WeaponClasses.includes(itemClass as WeaponClass);
  }
}
