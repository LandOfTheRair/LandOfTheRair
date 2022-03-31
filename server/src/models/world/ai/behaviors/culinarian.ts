import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { Currency, distanceFrom, foodTextFor, GameServerResponse, IAIBehavior,
  ICulinarianBehavior, INPC, IPlayer, ItemClass, ItemSlot } from '../../../../interfaces';

export class CulinarianBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: ICulinarianBehavior) {

    let { identifyCurrency, identifyCost } = behavior;

    identifyCurrency ??= Currency.Gold;
    identifyCost ??= 1000;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Identify Item?',
          content: `Would you like to identify the food item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`,
          extraData: { npcSprite: npc.sprite, okText: 'Yes, identify!', cancelText: 'No, not now' },
          okAction: { command: '!privatesay', args: `${npc.uuid}, identify` }
        });

        return `Hello, ${player.name}!
        Would you like to IDENTIFY the food item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`;
      });

    parser.addCommand('identify')
      .setSyntax(['identify'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You do not have anything in your right hand!';
        if (!game.currencyHelper.hasCurrency(player, identifyCost, identifyCurrency)) {
          return `You do not have enough ${identifyCurrency} for that!`;
        }

        const { itemClass, useEffect } = game.itemHelper.getItemProperties(rightHand, ['itemClass', 'useEffect']);

        if (itemClass !== ItemClass.Food) {
          return 'You do not have a food item in your right hand!';
        }

        if (!useEffect || useEffect.name !== 'Nourishment') {
          return 'You do not have a food item in your right hand!';
        }

        game.currencyHelper.loseCurrency(player, identifyCost, identifyCurrency);

        const identMsg = foodTextFor(
          player,
          rightHand,
          game.itemHelper.getItemDefinition(rightHand.name)
        );

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: 'Foodsense',
          content: identMsg,
          extraData: { itemName: rightHand.name, displayItemSprite: game.itemHelper.getItemProperty(rightHand, 'sprite') },
        });

        game.messageHelper.sendSimpleMessage(player, identMsg);

        return `Thanks, ${player.name}!`;
      });
  }

  tick() {}
}
