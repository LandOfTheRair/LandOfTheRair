
import { uniq } from 'lodash';

import { GameServerResponse, IDialogChatAction, IMacroCommandArgs,
  IPlayer, ISimpleItem, ItemClass, ItemSlot, MiscClass, SoundEffect, Tradeskill } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Tear extends MacroCommand {

  override aliases = ['tear'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const item = player.items.equipment[ItemSlot.RightHand];

    const fiberClasses = [ItemClass.Flower];
    const stringClasses = [ItemClass.Cloak, ItemClass.Robe, ItemClass.Sash, ItemClass.Fur, ItemClass.Tunic];
    const allClasses = [...fiberClasses, ...stringClasses];

    const determineClass = (itemClass: MiscClass) => fiberClasses.includes(itemClass) ? 'String - Fiber' : 'String - Spell';

    const getOzFromItem = (ozItem: ISimpleItem): number => {
      const { requirements } = this.game.itemHelper.getItemProperties(ozItem, ['requirements']);
      return Math.max(1, Math.floor((requirements?.level ?? 1) / 5)) ?? 1;
    };

    if (item && args.stringArgs) {
      return this.sendMessage(player, 'You need to empty your right hand to mass tear!');
    }

    // no right hand = mass DE
    if (!item) {

      // send popup
      if (!args.stringArgs) {

        const options: string[] = uniq(player.items.sack.items
          .filter(x => this.game.itemHelper.getItemProperty(x, 'quality') >= 1 || this.game.itemHelper.getItemProperty(x, 'itemClass') === ItemClass.Flower)
          .filter(x => allClasses.includes(this.game.itemHelper.getItemProperty(x, 'itemClass')))
          .map(x => this.game.itemHelper.getItemProperty(x, 'itemClass')))
          .sort();

        if (options.length === 0) return this.sendMessage(player, 'You do not have any tearable items in your sack!');

        const message = 'What would you like to tear all of (from your sack)?';

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: 'Mass Tear',
          options: [
            ...options.map(x => ({ text: x, action: `tear ${x}` })),
            { text: 'Nothing', action: 'noop' },
          ]
        };

        this.game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return;

      }

      // DE all items
      if (args.stringArgs) {
        const items = player.items.sack.items
          .filter(x => allClasses.includes(this.game.itemHelper.getItemProperty(x, 'itemClass')))
          .filter(x => this.game.itemHelper.getItemProperty(x, 'itemClass') === args.stringArgs)
          .filter(x => this.game.itemHelper.getItemProperty(x, 'quality') >= 1 || this.game.itemHelper.getItemProperty(x, 'itemClass') === ItemClass.Flower)
          .filter(x => this.game.itemHelper.isOwnedBy(player, x));

        if (items.length === 0) return this.sendMessage(player, 'You do not have any matching tearable items in your sack!');

        const uuids = items.map(x => x.uuid);

        const string = this.game.itemCreator.getSimpleItem(determineClass(args.stringArgs as MiscClass));
        string.mods.ounces = 0;

        items.forEach(cItem => string.mods.ounces = (string.mods.ounces ?? 0) + getOzFromItem(cItem));

        this.game.characterHelper.setEquipmentSlot(player, ItemSlot.RightHand, string);

        const skill = this.game.calculatorHelper.calcTradeskillLevelForCharacter(player, Tradeskill.Weavefabricating);
        if (skill < 10) {
          this.game.playerHelper.gainTradeskill(player, Tradeskill.Weavefabricating, string.mods.ounces);
        }

        this.game.inventoryHelper.removeItemsFromSackByUUID(player, uuids);

        const message = `You tear the ${args.stringArgs.toLowerCase()} items in your sack and get ${string.mods.ounces}oz fiber!`;
        this.sendMessage(player, message, SoundEffect.CombatBlockArmor);

        return;
      }
    }

    // right hand = single DE (we check stringArgs in case a mistake happened)
    if (item && !args.stringArgs) {
      const { itemClass, quality } = this.game.itemHelper.getItemProperties(item, ['itemClass', 'quality']);
      if ((quality ?? 0) < 1 && this.game.itemHelper.getItemProperty(x, 'itemClass') !== ItemClass.Flower) return this.sendMessage(player, 'That item offers no threads!');
      if (!allClasses.includes(itemClass as MiscClass)) return this.sendMessage(player, 'That is not tearable!');
      if (!this.game.itemHelper.isOwnedBy(player, item)) return this.sendMessage(player, 'That item is not yours to tear!');

      const oz = getOzFromItem(item);

      const string = this.game.itemCreator.getSimpleItem(determineClass(itemClass as MiscClass));
      string.mods.ounces = oz;

      this.game.characterHelper.setEquipmentSlot(player, ItemSlot.RightHand, string);
      this.game.playerHelper.gainTradeskill(player, Tradeskill.Weavefabricating, oz);

      this.sendMessage(player, `You tear the item in your right hand and get ${oz}oz fiber!`, SoundEffect.CombatBlockArmor);
    }
  }
}
