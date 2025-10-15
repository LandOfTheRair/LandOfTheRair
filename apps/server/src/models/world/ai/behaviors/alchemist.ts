import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IAlchemistBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
} from '@lotr/interfaces';
import { GameServerResponse, ItemSlot, LearnedSpell } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { forceSpellLearnStatus, hasLearned } from '@lotr/characters';
import { itemPropertiesGet, itemSetOwner } from '@lotr/content';
import { transmissionSendResponseToAccount } from '@lotr/core';
import { hasCurrency, loseCurrency } from '@lotr/currency';
import type { Game } from '../../../../helpers';

export class AlchemistBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IAlchemistBehavior) {
    let { alchCost, alchOz } = behavior;
    alchCost ??= 1000;
    alchOz ??= 10;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const maxOz = game.subscriptionHelper.maxAlchemistOz(player, alchOz);

        const message = `Hello, ${player.name}!
        You can tell me COMBINE while holding a bottle in your right hand to
        mix together that with other bottles of the same type in your sack.
        I can combine up to ${maxOz} oz into one bottle. It will cost ${alchCost} gold per ounce to do this.`;

        const options = [
          { text: 'Combine Potions', action: 'combine' },
          { text: 'Leave', action: 'noop' },
        ];

        if (!hasLearned(player, 'Alchemy')) {
          options.unshift({ text: 'Teach me about Alchemy', action: 'teach' });
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
      .addCommand('combine')
      .setSyntax(['combine'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You need to hold something in your right hand!';

        const maxOz = game.subscriptionHelper.maxAlchemistOz(player, alchOz);
        const { itemClass, ounces, useEffect } = itemPropertiesGet(rightHand, [
          'itemClass',
          'ounces',
          'useEffect',
        ]);

        const itemOunces = ounces ?? 0;

        if (itemClass !== 'Bottle') return 'You are not holding a bottle.';
        if (itemOunces >= maxOz) {
          return 'That bottle is already too full for me.';
        }
        if (!useEffect) return 'That bottle cannot be combined!';

        let itemsRemoved = 0;
        const removeUUIDs: string[] = [];

        player.items.sack.items.forEach((item) => {
          const { useEffect: checkEffect, ounces: checkOunces } =
            itemPropertiesGet(item, ['useEffect', 'ounces']);
          const checkItemOunces = checkOunces ?? 0;

          if (rightHand.name !== item.name) return;
          if (!checkEffect) return;
          if (checkEffect.name !== useEffect.name) return;
          if (checkEffect.potency !== useEffect.potency) return;
          if ((rightHand.mods.ounces || itemOunces) + checkItemOunces > maxOz) {
            return;
          }
          if (checkOunces === 0) return;

          const cost = checkItemOunces * (alchCost ?? 1);
          if (!hasCurrency(player, cost)) return;
          loseCurrency(player, cost);

          removeUUIDs.push(item.uuid);
          rightHand.mods.ounces =
            (rightHand.mods.ounces ?? itemOunces) + checkItemOunces;
          itemsRemoved++;
        });

        if (itemsRemoved === 0) return 'I was not able to combine any bottles.';

        game.inventoryHelper.removeItemsFromSackByUUID(player, removeUUIDs);

        itemSetOwner(player, rightHand);

        return `I've combined ${itemsRemoved} bottles from your sack and combined them with the one in your hand, enjoy!`;
      });

    parser
      .addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (hasLearned(player, 'Alchemy')) {
          return 'You already know Alchemy!';
        }

        forceSpellLearnStatus(player, 'Alchemy', LearnedSpell.FromFate);

        return 'Go forth and make potions!';
      });
  }

  tick() {}
}
