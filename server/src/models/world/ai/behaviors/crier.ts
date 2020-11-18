import { random, sample } from 'lodash';
import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { IAIBehavior, ICrierBehavior, INPC, MessageType } from '../../../../interfaces';

export class CrierBehavior implements IAIBehavior {

  private messages: string[] = [];
  private lastMessageShouted = '';
  private ticksForNextMessage = 0;

  init(game: Game, npc: INPC, parser: Parser, behavior: ICrierBehavior) {
    this.messages = behavior.messages;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => {
        return `Hello, adventurer! I love yelling out helpful things, feel free to stick around!`;
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
