
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

    const { requireSkill, requireClass, requireLearn, requireSpell, ingredients, ozIngredients, transferOwnerFrom } = recipe;

    if (player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'Empty your right hand first!');
    if (skill < requireSkill) return this.sendMessage(player, 'You do not know that recipe!');
    if (requireClass && !requireClass.includes(player.baseClass)) return this.sendMessage(player, 'You do not know that recipe!');
    if (requireLearn && !player.learnedRecipes.includes(recipe.name)) return this.sendMessage(player, 'You do not know that recipe!');

    if (requireSpell && !this.game.characterHelper.hasLearned(player, requireSpell)) {
      return this.sendMessage(player, `You don't know ${requireSpell}, so you can't craft this!`);
    }

    const materialStorageSlots = this.game.contentManager.materialStorageData.slots;

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

        // check sack for materials
        player.items.sack.items.forEach(checkItem => {
          if (!canUseItemForRecipe(checkItem)) return;

          if (checkItem.name.includes(ing.filter)) {
            ouncesFound[ing.filter] += checkItem.mods.ounces ?? 0;
          }
        });

        // last, check material storage for materials
        Object.keys(materialStorageSlots).forEach(slot => {
          const slotData = materialStorageSlots[slot];
          if (!slotData.items.some(x => x.includes(ing.filter))) return;

          const totalOz = (player.accountLockers.materials || {})[slot] ?? 0;
          ouncesFound[ing.filter] += totalOz;
        });

        // if we don't have enough, bail
        if (ouncesFound[ing.filter] < ing.ounces) {
          enoughOz = false;
        }
      });

      if (!enoughOz) {
        return this.sendMessage(player, 'You do not have enough of the ingredients!');
      }
    }

    const foundIngredients: Array<{ name: string; uuid: string; source: 'left'|'sack'|'material' }> = [];

    // check for ingredients
    if (ingredients) {

      ingredients.forEach(ing => {

        // check left hand first
        const leftHand = player.items.equipment[ItemSlot.LeftHand];
        if (leftHand && !foundIngredients.some(x => x.source === 'left')) {
          if (ing === leftHand.name && canUseItemForRecipe(leftHand)) {
            foundIngredients.push({ name: ing, uuid: leftHand.uuid, source: 'left' });
            return;
          }
        }

        // check sack next
        let foundInSack = false;
        player.items.sack.items.forEach(checkItem => {
          if (foundInSack) return;
          if (!canUseItemForRecipe(checkItem)) return;
          if (checkItem.name !== ing) return;
          if (foundIngredients.map(x => x.uuid).includes(checkItem.uuid)) return;

          foundInSack = true;
          foundIngredients.push({ name: ing, uuid: checkItem.uuid, source: 'sack' });
        });

        // check material storage last
        if (!foundInSack) {
          Object.keys(materialStorageSlots).forEach(slot => {
            const slotData = materialStorageSlots[slot];
            if (!slotData.items.some(x => x === ing)) return;

            const totalContained = (player.accountLockers.materials || {})[slot] ?? 0;
            const totalConsuming = foundIngredients.filter(x => x.source === 'material' && x.name === ing).length;

            // +1 because we count the current one ahead of time
            if (totalConsuming + 1 > totalContained) return;

            foundIngredients.push({ name: ing, uuid: slot, source: 'material' });
          });
        }

      });

      if (foundIngredients.length !== ingredients.length) return this.sendMessage(player, 'You do not have all of the ingredients!');
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

        // take from sack first
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

        // then take the rest from material storage
        Object.keys(materialStorageSlots).forEach(slot => {
          const slotData = materialStorageSlots[slot];
          if (!slotData.items.some(x => x.includes(ing.filter))) return;

          const ozRemaining = ing.ounces - (ouncesTaken[ing.filter] ?? 0);
          if (ozRemaining <= 0) return;

          const itemOz = (player.accountLockers.materials || {})[slot] ?? 0;
          const lostOz = Math.min(ozRemaining, itemOz);

          this.game.inventoryHelper.removeMaterial(player, slot, lostOz);

          ouncesTaken[ing.filter] += lostOz;
        });
      });

      this.game.inventoryHelper.removeItemsFromSackByUUID(player, removeItems);
    }

    // take raw ingredients
    if (ingredients) {

      foundIngredients.forEach(foundItem => {
        if (foundItem.source === 'left') {
          this.game.characterHelper.setLeftHand(player, undefined);
          return;
        }

        if (foundItem.source === 'material') {
          const slot = foundItem.uuid;
          this.game.inventoryHelper.removeMaterial(player, slot, 1);
          return;
        }
      });

      this.game.inventoryHelper.removeItemsFromSackByUUID(player, foundIngredients.filter(x => x.source === 'sack').map(x => x.uuid));
    }

    const item = this.game.itemCreator.getSimpleItem(recipe.item);
    item.mods.craftedBy = player.name;

    if (newOwner) {
      item.mods.owner = newOwner;
    }

    if (recipe.copySkillToPotency) {
      const effect = this.game.itemHelper.getItemProperty(item, 'useEffect');
      if (!effect) return;

      item.mods.useEffect = { ...effect, uses: skill, potency: (recipe.potencyScalar ?? 1) * skill };
    }

    const isSackable = this.game.itemHelper.getItemProperty(item, 'isSackable');
    if (isSackable && this.game.inventoryHelper.sackSpaceLeft(player) > 0) {
      this.game.inventoryHelper.addItemToSack(player, item);
    } else {
      this.game.characterHelper.setRightHand(player, item);
    }

    this.game.statisticsHelper.addStatistic(player, `${recipe.recipeType}crafts` as TrackedStatistic, 1);
  }
}
