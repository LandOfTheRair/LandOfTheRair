import { random, sample } from 'lodash';
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { Currency, descTextFor, GameServerResponse, IAIBehavior, INPC, IPeddlerBehavior, IPlayer, ItemSlot, MessageType } from '../../../../interfaces';

export class IdentifierBehavior implements IAIBehavior {

  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: IPeddlerBehavior, props: any = {}) {

    const { identifyCurrency, identifyCost, identifyTier } = props;

    const useCurrency = identifyCurrency || Currency.Gold;

    this.messages = [
      `I ask only ${identifyCost.toLocaleString()} ${useCurrency}, to help my poor children!`,
      `${identifyCost.toLocaleString()} ${useCurrency} for the best identify service in town!`,
      `${identifyCost.toLocaleString()} ${useCurrency} to identify your items!`,
      `Identify services going for ${identifyCost.toLocaleString()} ${useCurrency}!`
    ];

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: `Identify Item?`,
          content: `Would you like to identify the item in your right hand for ${identifyCost.toLocaleString()} ${useCurrency}?`,
          extraData: { npcSprite: npc.sprite, okText: 'Yes, identify!', cancelText: 'No, not now' },
          okAction: { command: `!privatesay`, args: `${npc.uuid}, identify` }
        });

        return `Hello, ${player.name}! Would you like to IDENTIFY the item in your right hand for ${identifyCost.toLocaleString()} ${useCurrency}?`;
      });

    parser.addCommand('identify')
      .setSyntax(['identify'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You do not have anything in your right hand!';
        if (!game.characterHelper.hasCurrency(player, identifyCost, useCurrency)) return `You do not have enough ${useCurrency} for that!`;

        game.characterHelper.loseCurrency(player, identifyCost, useCurrency);

        const identMsg = descTextFor(player, rightHand, game.itemHelper.getItemDefinition(rightHand.name));

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: `Identify`,
          content: identMsg,
          extraData: { itemName: rightHand.name },
        });

        game.messageHelper.sendSimpleMessage(player, identMsg);

        return `Thanks, ${player.name}!`;
      });
  }

  tick(game: Game, npc: INPC) {
    if (this.ticksForNextMessage > 0) {
      this.ticksForNextMessage--;
      return;
    }

    this.ticksForNextMessage = random(5, 10);
    const nextMessage = sample(this.messages.filter(x => x !== this.lastMessageShouted));
    this.lastMessageShouted = nextMessage;

    game.messageHelper.sendLogMessageToRadius(npc, 8, { message: nextMessage, from: npc.name }, [MessageType.NPCChatter]);
  }
}
