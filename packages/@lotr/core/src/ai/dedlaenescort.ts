import { random, sample } from 'lodash';

import type { IPlayer } from '@lotr/interfaces';
import { Hostility, Stat } from '@lotr/interfaces';
import { DefaultAIBehavior } from './default';

import { getStat, isDead } from '@lotr/characters';
import { oneInX } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';
import { worldMapStateGetForCharacter } from '../worldstate';
export class DedlaenEscortAI extends DefaultAIBehavior {
  private following: IPlayer | undefined;
  private notFollowingTicks = 0;

  override tick(): void {
    const npc = this.npc;

    if (isDead(npc)) return;
    if (npc.hostility === Hostility.Never) return;

    const nearbyPlayers = worldMapStateGetForCharacter(
      npc,
    )?.getAllPlayersInRange(npc, 4);

    const target = sample(nearbyPlayers ?? []);
    this.following = target;

    const responses: string[] = [];
    const moveRate = getStat(npc, Stat.Move);

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

    if (oneInX(30)) {
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
