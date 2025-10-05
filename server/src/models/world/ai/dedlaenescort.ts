import { random, sample } from 'lodash';

import { Hostility, IPlayer, Stat } from '../../../interfaces';
import { DefaultAIBehavior } from './default';

import { distanceFrom } from '../../../helpers/external';
export class DedlaenEscortAI extends DefaultAIBehavior {
  private following: IPlayer | undefined;
  private notFollowingTicks = 0;

  override tick(): void {
    const npc = this.npc;

    if (this.game.characterHelper.isDead(npc)) return;
    if (npc.hostility === Hostility.Never) return;

    const nearbyPlayers = this.game.worldManager
      .getMapStateForCharacter(npc)
      ?.getAllPlayersInRange(npc, 4);

    const target = sample(nearbyPlayers ?? []);
    this.following = target;

    const responses: string[] = [];
    const moveRate = this.game.characterHelper.getStat(npc, Stat.Move);

    if (this.following) {
      this.notFollowingTicks = 0;

      this.game.movementHelper.moveTowards(npc, this.following);

      responses.push(
        ...[
          'Thanks for taking me home!',
          "Are you sure you know where you're going?",
          'Are we there yet?',
        ],
      );
    } else {
      this.notFollowingTicks++;

      this.moveRandomly(random(0, moveRate));

      responses.push(
        ...[
          "Someone! Help! We're under siege here!",
          'Can anyone come help us?! Please!',
          'Help!',
        ],
      );
    }

    if (this.game.diceRollerHelper.OneInX(30)) {
      const message = sample(responses) as string;
      this.game.messageHelper.sendSimpleMessage(npc, message);
    }

    const startPos = this.startLoc || this.spawner.pos;
    const distFrom = distanceFrom(npc, startPos);
    if (!this.following && distFrom > 5 && this.notFollowingTicks > 10) {
      this.sendLeashMessage();
      npc.x = startPos.x;
      npc.y = startPos.y;
    }
  }
}
