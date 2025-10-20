import type { Parser } from 'muud';

import type {
  IAIBehavior,
  ICulinarianBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
  IServerGame,
} from '@lotr/interfaces';
import {
  Currency,
  GameServerResponse,
  ItemClass,
  ItemSlot,
  LearnedSpell,
} from '@lotr/interfaces';
import { distanceFrom, foodTextFor } from '@lotr/shared';

import { forceSpellLearnStatus, hasLearned } from '@lotr/characters';
import { itemGet, itemPropertiesGet, itemPropertyGet } from '@lotr/content';
import { hasCurrency, loseCurrency } from '@lotr/currency';
import { transmissionSendResponseToAccount } from '../../transmission';

export class CulinarianBehavior implements IAIBehavior {
  init(
    game: IServerGame,
    npc: INPC,
    parser: Parser,
    behavior: ICulinarianBehavior,
  ) {
    let { identifyCurrency, identifyCost } = behavior;

    identifyCurrency ??= Currency.Gold;
    identifyCost ??= 1000;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const message = `Hello, ${player.name}!
        You can tell me to talk about your FOOD, or I can TEACH you about Foodmaking!`;

        const options = [
          { text: 'Lets talk about food!', action: 'food' },
          { text: 'Leave', action: 'noop' },
        ];

        if (!hasLearned(player, 'Foodmaking')) {
          options.unshift({
            text: 'Teach me about Foodmaking',
            action: 'teach',
          });
        }

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options,
        };

        transmissionSendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('food')
      .setSyntax(['food'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Identify Item?',
          content: `Would you like to identify the food item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`,
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, identify!',
            cancelText: 'No, not now',
          },
          okAction: { command: '!privatesay', args: `${npc.uuid}, identify` },
        });

        return `Hello, ${player.name}!
        Would you like to IDENTIFY the food item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`;
      });

    parser
      .addCommand('identify')
      .setSyntax(['identify'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You do not have anything in your right hand!';
        if (!hasCurrency(player, identifyCost, identifyCurrency)) {
          return `You do not have enough ${identifyCurrency} for that!`;
        }

        const { itemClass, useEffect } = itemPropertiesGet(rightHand, [
          'itemClass',
          'useEffect',
        ]);

        if (itemClass !== ItemClass.Food) {
          return 'You do not have a food item in your right hand!';
        }

        if (!useEffect || useEffect.name !== 'Nourishment') {
          return 'You do not have a food item in your right hand!';
        }

        loseCurrency(player, identifyCost, identifyCurrency);

        const identMsg = foodTextFor(
          player,
          rightHand,
          itemGet(rightHand.name)!,
        );

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: 'Foodsense',
          content: identMsg,
          extraData: {
            itemName: rightHand.name,
            displayItemSprite: itemPropertyGet(rightHand, 'sprite'),
          },
        });

        game.messageHelper.sendSimpleMessage(player, identMsg);

        return `Thanks, ${player.name}!`;
      });

    parser
      .addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (hasLearned(player, 'Foodmaking')) {
          return 'You already know Foodmaking!';
        }

        forceSpellLearnStatus(player, 'Foodmaking', LearnedSpell.FromFate);

        return 'Go forth and make delicious food!';
      });
  }

  tick() {}
}
