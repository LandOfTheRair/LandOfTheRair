import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IDialogChatAction,
  IMagicianBehavior,
  INPC,
  IPlayer,
} from '@lotr/interfaces';
import {
  GameServerResponse,
  ItemClass,
  ItemSlot,
  LearnedSpell,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

export class MagicianBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IMagicianBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const message = `Hello, ${player.name}! I am a wandering magician and I can
        TEACH you to do Spellforging and IMBUE earrings with rune scrolls!`;

        const options = [
          { text: 'Imbue', action: 'imbue' },
          { text: 'Leave', action: 'noop' },
        ];

        if (!game.characterHelper.hasLearned(player, 'Spellforging')) {
          options.unshift({
            text: 'Teach me about Spellforging',
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

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (game.characterHelper.hasLearned(player, 'Spellforging')) {
          return 'You already know Spellforging!';
        }

        game.characterHelper.forceSpellLearnStatus(
          player,
          'Spellforging',
          LearnedSpell.FromFate,
        );
        game.characterHelper.forceSpellLearnStatus(
          player,
          'Disenchant',
          LearnedSpell.FromFate,
        );

        return 'Go forth and weave magic!';
      });

    parser
      .addCommand('imbue')
      .setSyntax(['imbue'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (!rightHand || !leftHand) {
          return `Greetings! I can imbue your empty husks of items with rune scrolls.
        Simply hold a valid item in your right hand, and a rune scroll in your left, and I can work my magic.`;
        }

        const { trait: rightTrait } = game.itemHelper.getItemProperties(
          rightHand,
          ['trait'],
        );
        const { itemClass: leftClass, trait: leftTrait } =
          game.itemHelper.getItemProperties(leftHand, ['itemClass', 'trait']);

        if (!rightTrait || rightTrait.name !== 'Unimbued') {
          return 'The item in your right hand is not an unimbued item!';
        }
        if (leftClass !== ItemClass.Scroll || !leftTrait) {
          return 'The item in your left hand is not a rune scroll!';
        }
        if (rightTrait.level !== leftTrait.level) {
          return 'The magic level of the rune scroll and the item in your right hand do not match!';
        }

        rightHand.mods.trait = { name: leftTrait.name, level: leftTrait.level };
        game.characterHelper.setLeftHand(player, undefined);

        return 'Enjoy your new imbued item!';
      });
  }

  tick() {}
}
