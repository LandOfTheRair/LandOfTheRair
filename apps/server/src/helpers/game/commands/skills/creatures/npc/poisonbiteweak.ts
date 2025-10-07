import { random } from 'lodash';

import { getStat, isPlayer } from '@lotr/characters';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { diceRoll } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';
import { SpellCommand } from '../../../../../../models/macro';

export class PoisonBiteWeak extends SpellCommand {
  override aliases = ['poisonbiteweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) === 0 && !hasEffect(target, 'Poison');
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    const damage = diceRoll(2, getStat(executor, Stat.STR));

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Physical,
      atkMsg: 'You bit %0!',
      defMsg: '%0 bit you!',
    });

    this.game.effectHelper.addEffect(target, executor, 'Poison', {
      effect: {
        duration: 10,
        extra: {
          disableMessages: true,
          disableRecently: true,
          potency: random(1, 3) * executor.level,
        },
      },
    });
  }
}
