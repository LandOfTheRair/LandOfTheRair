import { random, sample } from 'lodash';
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  Currency,
  distanceFrom,
  GameServerResponse,
  IAIBehavior,
  INPC,
  IPeddlerBehavior,
  IPlayer,
  ItemSlot,
  MessageType,
} from '../../../../interfaces';

export class PeddlerBehavior implements IAIBehavior {
  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: IPeddlerBehavior) {
    let { peddleCurrency } = behavior;
    const { peddleItem, peddleCost, peddleDesc } = behavior;

    if (!peddleItem || !peddleCost || !peddleDesc) {
      game.logger.error(
        'Behavior:Peddle',
        new Error(
          `NPC at ${npc.map}-${npc.x},${npc.y} has invalid peddle item settings.`,
        ),
      );
      return;
    }

    peddleCurrency ??= Currency.Gold;

    game.characterHelper.setRightHand(
      npc,
      game.itemCreator.getSimpleItem(peddleItem),
    );

    this.messages = [
      `I ask only ${peddleCost.toLocaleString()} ${peddleCurrency}, to help my poor children!`,
      `${peddleItem}, ${peddleCost.toLocaleString()} ${peddleCurrency}, the best in town!`,
      `${peddleItem}, ${peddleCost.toLocaleString()} ${peddleCurrency}, you can't beat the quality!`,
      `Come on over to get your ${peddleItem}! Only ${peddleCost.toLocaleString()} ${peddleCurrency}!`,
    ];

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: `Buy ${peddleItem}?`,
          content: `Would you like to buy a ${peddleItem}? ${peddleDesc}`,
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, buy!',
            cancelText: 'No, not now',
          },
          okAction: { command: '!privatesay', args: `${npc.uuid}, buy` },
        });

        return `Hello, ${player.name}! Would you like to BUY my ${peddleItem} for ${peddleCost.toLocaleString()} ${peddleCurrency}?`;
      });

    parser
      .addCommand('buy')
      .setSyntax(['buy'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (player.items.equipment[ItemSlot.RightHand]) {
          return 'Empty your right hand first!';
        }
        if (
          !game.currencyHelper.hasCurrency(player, peddleCost, peddleCurrency)
        ) {
          return `You do not have enough ${peddleCurrency} for that!`;
        }

        game.currencyHelper.loseCurrency(player, peddleCost, peddleCurrency);

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

    this.ticksForNextMessage = random(15, 45);
    const nextMessage = sample(
      this.messages.filter((x) => x !== this.lastMessageShouted),
    ) as string;
    this.lastMessageShouted = nextMessage;

    game.messageHelper.sendLogMessageToRadius(
      npc,
      8,
      { message: nextMessage, from: npc.name },
      [MessageType.NPCChatter],
    );
  }
}
