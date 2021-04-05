
import { random } from 'lodash';

import { Allegiance, Hostility, ICharacter, INPC, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Push extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {

    // yes, but, no.
    if (!target) return;
    if ((target as INPC).hostility === Hostility.Never) return;
    if ((target as INPC).allegiance === Allegiance.NaturalResource) return;

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
    const didFirstPushWork = this.game.movementHelper.takeSequenceOfSteps(target, [{ x, y }]);

    // then, reset the values and set up for another push
    x = 0;
    y = 0;
    let didSecondPushWork = false;

    while (!didFirstPushWork && x === 0 && y === 0) {
      x = random(-1, 1);
      y = random(-1, 1);
    }

    // then, try to push them randomly if the first fails
    if (!didFirstPushWork) {
      didSecondPushWork = this.game.movementHelper.takeSequenceOfSteps(target, [{ x, y }]);
    }

    if (didFirstPushWork || didSecondPushWork) {
      this.game.messageHelper.sendLogMessageToRadius(target, 4, { message: `${target.name} was knocked down!` });
    } else {
      this.game.messageHelper.sendLogMessageToRadius(target, 4, { message: `${target.name} was knocked over!` });

      this.game.spellManager.castSpell('Stun', caster, target, { potency: 1, duration: 1 });
    }
  }

}
