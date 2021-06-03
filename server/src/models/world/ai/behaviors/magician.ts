import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  distanceFrom, GameServerResponse, IAIBehavior,
  IDialogChatAction, IMagicianBehavior, INPC, IPlayer, LearnedSpell } from '../../../../interfaces';

export class MagicianBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IMagicianBehavior) {

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const message = `Hello, ${player.name}! I am a wandering magician and I can TEACH you to do Spellforging!`;

        const options = [
          { text: 'Leave', action: 'noop' },
        ];

        if (!game.characterHelper.hasLearned(player, 'Spellforging')) {
          options.unshift({ text: 'Teach me about Spellforging', action: 'teach' });
        }

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options
        };

        game.transmissionHelper.sendResponseToAccount(player.username, GameServerResponse.DialogChat, formattedChat);

        return message;
      });


    parser.addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (game.characterHelper.hasLearned(player, 'Spellforging')) return 'You already know Spellforging!';

        game.characterHelper.forceSpellLearnStatus(player, 'Spellforging', LearnedSpell.FromFate);
        game.characterHelper.forceSpellLearnStatus(player, 'Disenchant', LearnedSpell.FromFate);

        return 'Go forth and weave magic!';
      });
  }

  tick() {}
}
