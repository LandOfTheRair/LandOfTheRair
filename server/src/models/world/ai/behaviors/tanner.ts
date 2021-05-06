import { random, sample } from 'lodash';
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  distanceFrom, GameServerResponse, IAIBehavior, INPC,
  IPlayer, ITannerBehavior, ItemSlot, MessageType } from '../../../../interfaces';

export class TannerBehavior implements IAIBehavior {

  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: ITannerBehavior) {

    let { maxTanLevel } = behavior;
    maxTanLevel ??= 1;

    const tanLevel = maxTanLevel ?? 1;

    this.messages = [
      'You kill \'em, we clean \'em!',
      'Come on over and get all your hides skinned!',
      'Any scales are better than chain!',
      'Finest robes and armor made from your kills!'
    ];

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Tan Item?',
          content: 'Would you like to tan the item in your right hand?',
          extraData: { npcSprite: npc.sprite, okText: 'Yes, tan!', cancelText: 'No, not now' },
          okAction: { command: '!privatesay', args: `${npc.uuid}, tan` }
        });

        return `Hello, ${player.name}! Would you like to TAN the item in your right hand?`;
      });

    parser.addCommand('tan')
      .setSyntax(['tan'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'You do not have anything in your right hand!';

        const {
          playersHeardDeath,
          corpseLevel,
          tansFor
        } = game.itemHelper.getItemProperties(rightHand, ['playersHeardDeath', 'corpseLevel', 'tansFor']);

        if (!tansFor) return 'I can\'t do anything with that!';

        if ((corpseLevel ?? 0) > tanLevel) return 'I don\'t know what to do with that!';

        if (!playersHeardDeath?.includes(player.uuid)) return 'I don\'t think you had anything to do with this kill!';

        const item = game.itemCreator.getSimpleItem(tansFor);
        game.itemHelper.setOwner(player, item);
        game.characterHelper.setRightHand(player, item);

        return `Thanks, ${player.name}!`;
      });
  }

  tick(game: Game, npc: INPC) {
    if (this.ticksForNextMessage > 0) {
      this.ticksForNextMessage--;
      return;
    }

    this.ticksForNextMessage = random(15, 50);
    const nextMessage = sample(this.messages.filter(x => x !== this.lastMessageShouted)) as string;
    this.lastMessageShouted = nextMessage;

    game.messageHelper.sendLogMessageToRadius(npc, 8, { message: nextMessage, from: npc.name }, [MessageType.NPCChatter]);
  }
}
