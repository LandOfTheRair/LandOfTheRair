import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { GameServerResponse, IAIBehavior, IAlchemistBehavior, IDialogChatAction, INPC, IPlayer, ItemSlot } from '../../../../interfaces';

export class AlchemistBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IAlchemistBehavior) {

    let { alchCost, alchOz } = behavior;
    alchCost ??= 1000;
    alchOz ??= 10;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        const maxOz = game.subscriptionHelper.maxAlchemistOz(player, alchOz);

        const message = `Hello, ${player.name}!
        You can tell me COMBINE while holding a bottle in your right hand to
        mix together that with other bottles of the same type in your sack.
        I can combine up to ${maxOz} oz into one bottle. It will cost ${alchCost} gold per ounce to do this.`;

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options: [
            { text: 'Combine Potions', action: 'combine' },
            { text: 'Leave', action: 'noop' },
          ]
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });


    parser.addCommand('combine')
      .setSyntax(['combine'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You need to hold something in your right hand!';

        const maxOz = game.subscriptionHelper.maxAlchemistOz(player, alchOz);
        const { itemClass, ounces, useEffect } = game.itemHelper.getItemProperties(rightHand, ['itemClass', 'ounces', 'useEffect']);

        const itemOunces = ounces ?? 0;

        if (itemClass !== 'Bottle') return 'You are not holding a bottle.';
        if (itemOunces >= maxOz) return 'That bottle is already too full for me.';
        if (!useEffect) return 'That bottle cannot be combined!';

        let itemsRemoved = 0;
        const removeUUIDs: string[] = [];

        player.items.sack.items.forEach((item) => {
          const { useEffect: checkEffect, ounces: checkOunces } = game.itemHelper.getItemProperties(item, ['useEffect', 'ounces']);
          const checkItemOunces = checkOunces ?? 0;

          if (rightHand.name !== item.name) return;
          if (!checkEffect) return;
          if (checkEffect.name !== useEffect.name) return;
          if (checkEffect.potency !== useEffect.potency) return;
          if ((rightHand.mods.ounces || itemOunces) + checkItemOunces > maxOz) return;
          if (checkOunces === 0) return;

          const cost = checkItemOunces * (alchCost ?? 1);
          if (!game.currencyHelper.hasCurrency(player, cost)) return;
          game.currencyHelper.loseCurrency(player, cost);

          removeUUIDs.push(item.uuid);
          rightHand.mods.ounces = (rightHand.mods.ounces ?? itemOunces) + checkItemOunces;
          itemsRemoved++;
        });

        if (itemsRemoved === 0) return 'I was not able to combine any bottles.';

        game.inventoryHelper.removeItemsFromSackByUUID(player, removeUUIDs);

        game.itemHelper.setOwner(player, rightHand);

        return `I've combined ${itemsRemoved} bottles from your sack and combined them with the one in your hand, enjoy!`;
      });
  }

  tick() {}
}
