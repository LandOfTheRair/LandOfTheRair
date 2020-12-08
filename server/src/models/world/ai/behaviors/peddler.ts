import { random, sample } from 'lodash';
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { Currency, GameServerResponse, IAIBehavior, INPC, IPeddlerBehavior, IPlayer, ItemSlot, MessageType } from '../../../../interfaces';

export class PeddlerBehavior implements IAIBehavior {

  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: IPeddlerBehavior, props: any = {}) {

    const { peddleCurrency, peddleItem, peddleCost, peddleDesc } = props;

    const useCurrency = peddleCurrency || Currency.Gold;

    game.characterHelper.setRightHand(npc, game.itemCreator.getSimpleItem(peddleItem));

    this.messages = [
      `I ask only ${peddleCost.toLocaleString()} ${useCurrency}, to help my poor children!`,
      `${peddleItem}, ${peddleCost.toLocaleString()} ${useCurrency}, the best in town!`,
      `${peddleItem}, ${peddleCost.toLocaleString()} ${useCurrency}, you can't beat the quality!`,
      `Come on over to get your ${peddleItem}! Only ${peddleCost.toLocaleString()} ${useCurrency}!`,
    ];

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: `Buy ${peddleItem}?`,
          content: `Would you like to buy a ${peddleItem}? ${peddleDesc}`,
          extraData: { npcSprite: npc.sprite, okText: 'Yes, buy!', cancelText: 'No, not now' },
          okAction: { command: `!privatesay`, args: `${npc.uuid}, buy` }
        });

        return `Hello, ${player.name}! Would you like to BUY my ${peddleItem} for ${peddleCost.toLocaleString()} ${useCurrency}?`;
      });

    parser.addCommand('buy')
      .setSyntax(['buy'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 2) return 'Please come closer.';

        if (player.items.equipment[ItemSlot.RightHand]) return 'Empty your right hand first!';
        if (!game.characterHelper.hasCurrency(player, peddleCost, useCurrency)) return `You do not have enough ${useCurrency} for that!`;

        game.characterHelper.loseCurrency(player, peddleCost, useCurrency);

        const item = game.itemCreator.getSimpleItem(peddleItem);
        game.characterHelper.setRightHand(player, item);

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
