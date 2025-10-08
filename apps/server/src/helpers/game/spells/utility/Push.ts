import { random } from 'lodash';

import { hasEffect } from '@lotr/effects';
import type { ICharacter, INPC, SpellCastArgs } from '@lotr/interfaces';
import { Allegiance, Hostility } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Push extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    // yes, but, no.
    if (!target) return;
    if ((target as INPC).hostility === Hostility.Never) return;
    if ((target as INPC).allegiance === Allegiance.NaturalResource) return;

    const hasUnshakeable = hasEffect(target, 'Unshakeable');
    if (hasUnshakeable) return;

    let x = 0;
    let y = 0;

    if (target && caster) {
      if (target.x > caster.x) {
        x = 1;
      } else if (target.x < caster.x) {
        x = -1;
      }

      if (target.y > caster.y) {
        y = 1;
      } else if (target.y < caster.y) {
        y = -1;
      }
    }

    while (x === 0 && y === 0) {
      x = random(-1, 1);
      y = random(-1, 1);
    }

    // first, try to push them in a direction
    const didFirstPushWork = this.game.movementHelper.moveWithPathfinding(
      target,
      { xDiff: x, yDiff: y },
    );

    // then, reset the values and set up for another push
    let didSecondPushWork = false;

    // then, try to push them randomly if the first fails
    if (!didFirstPushWork) {
      x = 0;
      y = 0;

      while (x === 0 && y === 0) {
        x = random(-1, 1);
        y = random(-1, 1);
      }

      didSecondPushWork = this.game.movementHelper.moveWithPathfinding(target, {
        xDiff: x,
        yDiff: y,
      });
    }

    const extraText = caster ? ` by ${caster.name}` : '';
    if (didFirstPushWork || didSecondPushWork) {
      this.game.messageHelper.sendLogMessageToRadius(target, 4, {
        message: `${target.name} was knocked down${extraText}!`,
      });
    } else {
      this.game.messageHelper.sendLogMessageToRadius(target, 4, {
        message: `${target.name} was knocked over${extraText}!`,
      });

      this.game.effectHelper.addEffect(target, target, 'Stun', {
        effect: {
          duration: 1,
          extra: { disableMessages: true, disableRecently: true },
        },
      });
    }
  }
}
