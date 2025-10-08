import { random, sample } from 'lodash';
import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IIdentifierBehavior,
  INPC,
  IPlayer,
} from '@lotr/interfaces';
import {
  Currency,
  GameServerResponse,
  ItemSlot,
  MessageType,
} from '@lotr/interfaces';
import { descTextFor, distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { itemGet, itemPropertyGet } from '@lotr/content';
import { hasCurrency, loseCurrency } from '@lotr/currency';
import type { Game } from '../../../../helpers';

export class IdentifierBehavior implements IAIBehavior {
  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: IIdentifierBehavior) {
    let { identifyCurrency, identifyCost, identifyTier } = behavior;

    identifyCurrency ??= Currency.Gold;
    identifyCost ??= 1000;
    identifyTier ??= 3;

    this.messages = [
      `I ask only ${identifyCost.toLocaleString()} ${identifyCurrency}, to help my poor children!`,
      `${identifyCost.toLocaleString()} ${identifyCurrency} for the best identify service in town!`,
      `${identifyCost.toLocaleString()} ${identifyCurrency} to identify your items!`,
      `Identify services going for ${identifyCost.toLocaleString()} ${identifyCurrency}!`,
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
          title: 'Identify Item?',
          content: `Would you like to identify the item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`,
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, identify!',
            cancelText: 'No, not now',
          },

          okAction: { command: '!privatesay', args: `${npc.uuid}, identify` },
        });

        return `Hello, ${player.name}!
        Would you like to IDENTIFY the item in your right hand for ${identifyCost.toLocaleString()} ${identifyCurrency}?`;
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

        loseCurrency(player, identifyCost, identifyCurrency);

        const identMsg = descTextFor(
          player,
          rightHand,
          itemGet(rightHand.name)!,
          rightHand.mods?.encrustItem
            ? itemGet(rightHand.mods.encrustItem)
            : undefined,
          identifyTier,
        );

        env?.callbacks.emit({
          type: GameServerResponse.SendAlert,
          title: 'Identify',
          content: identMsg,
          extraData: {
            itemName: rightHand.name,
            displayItemSprite: itemPropertyGet(rightHand, 'sprite'),
          },
        });

        game.messageHelper.sendSimpleMessage(player, identMsg);

        game.itemHelper.markIdentified(rightHand, identifyTier);

        return `Thanks, ${player.name}!`;
      });
  }

  tick(game: Game, npc: INPC) {
    if (this.ticksForNextMessage > 0) {
      this.ticksForNextMessage--;
      return;
    }

    this.ticksForNextMessage = random(15, 30);
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
