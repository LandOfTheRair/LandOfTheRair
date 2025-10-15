import { uniq } from 'lodash';

import {
  itemIsOwnedBy,
  itemPropertiesGet,
  itemPropertyGet,
} from '@lotr/content';
import { transmissionSendResponseToAccount } from '@lotr/core';
import { calcTradeskillLevelForCharacter } from '@lotr/exp';
import type {
  IDialogChatAction,
  IMacroCommandArgs,
  IPlayer,
  ISimpleItem,
} from '@lotr/interfaces';
import {
  GameServerResponse,
  ItemClass,
  ItemSlot,
  SoundEffect,
  Tradeskill,
} from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Shatter extends MacroCommand {
  override aliases = ['shatter'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const item = player.items.equipment[ItemSlot.RightHand];

    const getOzFromItem = (gem: ISimpleItem): number => {
      const { requirements } = itemPropertiesGet(gem, ['requirements']);
      return Math.max(1, Math.floor((requirements?.level ?? 1) / 5)) ?? 1;
    };

    if (item && args.stringArgs) {
      return this.sendMessage(
        player,
        'You need to empty your right hand to mass shatter!',
      );
    }

    // no right hand = mass DE
    if (!item) {
      // send popup
      if (!args.stringArgs) {
        const options: string[] = uniq(
          player.items.sack.items
            .filter((x) => itemPropertyGet(x, 'itemClass') === ItemClass.Gem)
            .map((x) => itemPropertyGet(x, 'itemClass')),
        ).sort();

        if (options.length === 0) {
          return this.sendMessage(
            player,
            'You do not have any shatterable items in your sack!',
          );
        }

        const message =
          'What would you like to shatter all of (from your sack)?';

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: 'Mass Shatter',
          options: [
            ...options.map((x) => ({ text: x, action: `shatter ${x}` })),
            { text: 'Nothing', action: 'noop' },
          ],
        };

        transmissionSendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return;
      }

      // DE all items
      if (args.stringArgs) {
        const items = player.items.sack.items
          .filter((x) => itemPropertyGet(x, 'itemClass') === args.stringArgs)
          .filter((x) => itemPropertyGet(x, 'itemClass') === ItemClass.Gem)
          .filter((x) => itemIsOwnedBy(player, x));

        if (items.length === 0) {
          return this.sendMessage(
            player,
            'You do not have any matching shatterable items in your sack!',
          );
        }

        const uuids = items.map((x) => x.uuid);

        const gemDust = this.game.itemCreator.getSimpleItem('Gem Dust');
        gemDust.mods.ounces = 0;

        items.forEach(
          (cItem) =>
            (gemDust.mods.ounces =
              (gemDust.mods.ounces ?? 0) + getOzFromItem(cItem)),
        );

        this.game.characterHelper.setEquipmentSlot(
          player,
          ItemSlot.RightHand,
          gemDust,
        );

        const skill = calcTradeskillLevelForCharacter(
          player,
          Tradeskill.Gemcrafting,
        );
        if (skill < 10) {
          this.game.playerHelper.gainTradeskill(
            player,
            Tradeskill.Gemcrafting,
            gemDust.mods.ounces,
          );
        }

        this.game.inventoryHelper.removeItemsFromSackByUUID(player, uuids);

        const message = `You shatter the ${args.stringArgs.toLowerCase()} items in your sack and get ${gemDust.mods.ounces}oz dust!`;
        this.sendMessage(player, message, SoundEffect.CombatBlockArmor);

        return;
      }
    }

    // right hand = single DE (we check stringArgs in case a mistake happened)
    if (item && !args.stringArgs) {
      const { itemClass } = itemPropertiesGet(item, ['itemClass']);
      if (itemClass !== ItemClass.Gem) {
        return this.sendMessage(player, 'That is not shatterable!');
      }
      if (!itemIsOwnedBy(player, item)) {
        return this.sendMessage(player, 'That item is not yours to shatter!');
      }

      const oz = getOzFromItem(item);

      const gemDust = this.game.itemCreator.getSimpleItem('Gem Dust');
      gemDust.mods.ounces = oz;

      this.game.characterHelper.setEquipmentSlot(
        player,
        ItemSlot.RightHand,
        gemDust,
      );

      const skill = calcTradeskillLevelForCharacter(
        player,
        Tradeskill.Gemcrafting,
      );
      if (skill < 10) {
        this.game.playerHelper.gainTradeskill(
          player,
          Tradeskill.Gemcrafting,
          oz,
        );
      }

      this.sendMessage(
        player,
        `You shatter the item in your right hand and get ${oz}oz dust!`,
        SoundEffect.CombatBlockArmor,
      );
    }
  }
}
