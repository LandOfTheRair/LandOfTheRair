import { random, sample } from 'lodash';
import type { Parser } from 'muud';

import type { IAIBehavior, ICrierBehavior, INPC } from '@lotr/interfaces';
import { MessageType } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

export class CrierBehavior implements IAIBehavior {
  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: ICrierBehavior) {
    this.messages = behavior.messages;

    // add hello, if it's not added by the npc dialog
    try {
      parser
        .addCommand('hello')
        .setSyntax(['hello'])
        .setLogic(
          async () =>
            'Hello, adventurer! I love yelling out helpful things, feel free to stick around!',
        );
    } catch {}
  }

  tick(game: Game, npc: INPC) {
    if (this.ticksForNextMessage > 0) {
      this.ticksForNextMessage--;
      return;
    }

    this.ticksForNextMessage = random(5, 10);
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
