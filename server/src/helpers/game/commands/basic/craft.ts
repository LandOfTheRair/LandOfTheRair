
import { clamp } from 'lodash';

import { IMacroCommandArgs, IPlayer, ItemSlot, TrackedStatistic } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Craft extends MacroCommand {

  override aliases = ['craft'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const recipe = this.game.contentManager.getRecipe(args.stringArgs);
    if (!recipe) return this.sendMessage(player, 'You do not know that recipe!');

    const skill = this.game.calculatorHelper.calcTradeskillLevelForCharacter(player, recipe.recipeType);

    const { requireSkill, requireClass, requireLearn, ingredients, ozIngredients, transferOwnerFrom } = recipe;

    if (player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'Empty your right hand first!');
    if (skill < requireSkill) return this.sendMessage(player, 'You do not know that recipe!');
    if (requireClass && !requireClass.includes(player.baseClass)) return this.sendMessage(player, 'You do not know that recipe!');
    if (requireLearn && !player.learnedRecipes.includes(recipe.name)) return this.sendMessage(player, 'You do not know that recipe!');

    const itemUUIDs = {};
    let newOwner = '';

    const canUseItemForRecipe = (recipeItem) => {

      if (newOwner && recipeItem.name === transferOwnerFrom) return false;

      if (transferOwnerFrom && recipeItem.name === transferOwnerFrom) {
        newOwner = recipeItem.mods.owner;
        return true;
      }

      if (!this.game.itemHelper.isOwnedBy(player, recipeItem)) return false;

      return true;
    };

    // check for ounces
    if (ozIngredients) {
      const ouncesFound = {};

      let enoughOz = true;
      ozIngredients.forEach(ing => {
        ouncesFound[ing.filter] = ouncesFound[ing.filter] ?? 0;

        player.items.sack.items.forEach(checkItem => {
          if (!canUseItemForRecipe(checkItem)) return;

          if (checkItem.name.includes(ing.filter)) {
            ouncesFound[ing.filter] += checkItem.mods.ounces ?? 0;

            itemUUIDs[checkItem.uuid] = checkItem.mods.ounces ?? 0;
          }
        });

        if (ouncesFound[ing.filter] < ing.ounces) {
          enoughOz = false;
        }
      });

      if (!enoughOz) {
        return this.sendMessage(player, 'You do not have enough of the ingredients!');
      }
    }

    // check for ingredients
    if (ingredients) {
      ingredients.forEach(ing => {

        // check left hand first
        const leftHand = player.items.equipment[ItemSlot.LeftHand];
        if (leftHand) {
          if (ing === leftHand.name && canUseItemForRecipe(leftHand)) {
            itemUUIDs[leftHand.uuid] = 'left';
            return;
          }
        }

        // check sack next
        let found = false;
        player.items.sack.items.forEach(checkItem => {
          if (found) return;
          if (!canUseItemForRecipe(checkItem)) return;

          if (checkItem.name === ing && !itemUUIDs[checkItem.uuid]) {
            found = true;
            itemUUIDs[checkItem.uuid] = 'sack';
          }
        });
      });

      if (Object.keys(itemUUIDs).length !== ingredients.length) return this.sendMessage(player, 'You do not have all the ingredients!');
    }

    const pointChance = 25 * clamp((recipe.maxSkillForGains - skill), 0, 4);
    if (this.game.diceRollerHelper.XInOneHundred(pointChance)) {
      this.game.playerHelper.gainTradeskill(player, recipe.recipeType, recipe.skillGained);
    }

    this.game.playerHelper.gainExp(player, recipe.xpGained);

    this.game.messageHelper.sendLogMessageToRadius(player, 4, { message: `${player.name} crafted ${recipe.name}.` });

    // take ounces
    if (ozIngredients) {
      const ouncesTaken = {};
      const removeItems: string[] = [];

      ozIngredients.forEach(ing => {
        ouncesTaken[ing.filter] = ouncesTaken[ing.filter] ?? 0;
        player.items.sack.items.forEach(checkItem => {
          if (!canUseItemForRecipe(checkItem)) return;

          if (checkItem.name.includes(ing.filter)) {
            const ozRemaining = ing.ounces - (ouncesTaken[ing.filter] ?? 0);
            if (ozRemaining <= 0) return;

            const itemOz = checkItem.mods.ounces ?? 0;
            const lostOz = Math.min(ozRemaining, itemOz);

            checkItem.mods.ounces = itemOz - lostOz;

            ouncesTaken[ing.filter] += lostOz;
            if (itemOz - lostOz <= 0) {
              removeItems.push(checkItem.uuid);
            }
          }
        });
      });

      this.game.inventoryHelper.removeItemsFromSackByUUID(player, removeItems);
    }

    // take raw ingredients
    if (ingredients) {
      const takeUUIDS: string[] = [];

      Object.keys(itemUUIDs).forEach(uuid => {
        if (itemUUIDs[uuid] === 'left') {
          this.game.characterHelper.setLeftHand(player, undefined);
          return;
        }

        takeUUIDS.push(uuid);
      });

      this.game.inventoryHelper.removeItemsFromSackByUUID(player, takeUUIDS);
    }

    const item = this.game.itemCreator.getSimpleItem(recipe.item);
    item.mods.craftedBy = player.name;

    if (newOwner) {
      item.mods.owner = newOwner;
    }

    this.game.characterHelper.setRightHand(player, item);

    this.game.statisticsHelper.addStatistic(player, `${recipe.recipeType}crafts` as TrackedStatistic, 1);
  }
}
