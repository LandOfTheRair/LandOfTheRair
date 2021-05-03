
import { random, sample } from 'lodash';

import { Hostility, IPlayer, Stat } from '../../../interfaces';
import { DefaultAIBehavior } from './default';

export class DedlaenEscortAI extends DefaultAIBehavior {

  private following: IPlayer;

  override tick(): void {
    const npc = this.npc;

    if (this.game.characterHelper.isDead(npc)) return;
    if (npc.hostility === Hostility.Never) return;

    const nearbyPlayers = this.game.worldManager.getMapStateForCharacter(npc)?.getAllPlayersInRange(npc, 4);

    const target = sample(nearbyPlayers ?? []);
    this.following = target;

    let diffX = 0;
    let diffY = 0;

    const responses: string[] = [];
    const moveRate = this.game.characterHelper.getStat(npc, Stat.Move);

    if (this.following) {
      this.game.movementHelper.moveTowards(npc, this.following);

      responses.push(...[
        'Thanks for taking me home!',
        'Are you sure you know where you\'re going?',
        'Are we there yet?'
      ]);

    } else {
      const oldX = npc.x;
      const oldY = npc.y;

      this.moveRandomly(random(0, moveRate));

      diffX = npc.x - oldX;
      diffY = npc.y - oldY;

      responses.push(...[
        'Someone! Help! We\'re under siege here!',
        'Can anyone come help us?! Please!',
        'Help!'
      ]);
    }

    if (this.game.diceRollerHelper.OneInX(30)) {
      const message = sample(responses);
      this.game.messageHelper.sendSimpleMessage(npc, message);
    }

    if (diffX || diffY) this.game.directionHelper.setDirBasedOnXYDiff(npc, diffX, diffY);

    const startPos = this.startLoc || this.spawner.pos;
    const distFrom = this.game.directionHelper.distFrom(npc, startPos);
    if (!this.following && distFrom > 5) {
      this.sendLeashMessage();
      npc.x = startPos.x;
      npc.y = startPos.y;

    }
  }
}
