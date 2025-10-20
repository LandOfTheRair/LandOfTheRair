import { random, sample } from 'lodash';
import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IDialogChatAction,
  INPC,
  IPlayer,
  IServerGame,
  ITannerBehavior,
} from '@lotr/interfaces';
import {
  GameServerResponse,
  ItemSlot,
  LearnedSpell,
  MessageType,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

import { forceSpellLearnStatus, hasLearned } from '@lotr/characters';
import { itemPropertiesGet, itemSetOwner } from '@lotr/content';
import { transmissionSendResponseToAccount } from '../../transmission';
import { worldMapStateGetForCharacter } from '../../worldstate';

export class TannerBehavior implements IAIBehavior {
  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(
    game: IServerGame,
    npc: INPC,
    parser: Parser,
    behavior: ITannerBehavior,
  ) {
    let { maxTanLevel } = behavior;
    maxTanLevel ??= 1;

    const tanLevel = maxTanLevel ?? 1;

    this.messages = [
      "You kill 'em, we clean 'em!",
      'Come on over and get all your hides skinned!',
      'Any scales are better than chain!',
      'Finest robes and armor made from your kills!',
    ];

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const message = `Hello, ${player.name}!
        You can tell me to talk about your TANNING, or I can TEACH you about Weavefabricating!`;

        const options = [
          { text: 'Lets talk about tanning!', action: 'tanning' },
          { text: 'Leave', action: 'noop' },
        ];

        if (!hasLearned(player, 'Weavefabricating')) {
          options.unshift({
            text: 'Teach me about Weavefabricating',
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
      .addCommand('tanning')
      .setSyntax(['tanning'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Tan Item?',
          content: 'Would you like to tan the item in your right hand?',
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, tan!',
            cancelText: 'No, not now',
          },
          okAction: { command: '!privatesay', args: `${npc.uuid}, tan` },
        });

        return `Hello, ${player.name}! Would you like to TAN the item in your right hand?`;
      });

    parser
      .addCommand('tan')
      .setSyntax(['tan'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You do not have anything in your right hand!';

        const { playersHeardDeath, corpseLevel, tansFor, searchItems } =
          itemPropertiesGet(rightHand, [
            'playersHeardDeath',
            'corpseLevel',
            'tansFor',
            'searchItems',
          ]);

        if (!tansFor) return "I can't do anything with that!";

        if ((corpseLevel ?? 0) > tanLevel) {
          return "I don't know what to do with that!";
        }

        if (!playersHeardDeath?.includes(player.uuid)) {
          return "I don't think you had anything to do with this kill!";
        }

        const item = game.itemCreator.getSimpleItem(tansFor);
        itemSetOwner(player, item);
        game.characterHelper.setRightHand(player, item);

        if (searchItems && (searchItems?.length ?? 0) > 0) {
          const state = worldMapStateGetForCharacter(player);

          if (state) {
            state.addItemsToGround(npc.x, npc.y, searchItems);
          }
        }

        return `Thanks, ${player.name}!`;
      });

    parser
      .addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (hasLearned(player, 'Weavefabricating')) {
          return 'You already know Weavefabricating!';
        }

        forceSpellLearnStatus(
          player,
          'Weavefabricating',
          LearnedSpell.FromFate,
        );
        forceSpellLearnStatus(player, 'Tear', LearnedSpell.FromFate);

        return 'Go forth and make gorgeous fabrics!';
      });
  }

  tick(game: IServerGame, npc: INPC) {
    if (this.ticksForNextMessage > 0) {
      this.ticksForNextMessage--;
      return;
    }

    this.ticksForNextMessage = random(15, 50);
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
