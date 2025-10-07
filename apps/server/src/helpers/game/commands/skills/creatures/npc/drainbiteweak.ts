import { getStat, isPlayer } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { diceRoll } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';
import { random } from 'lodash';
import { SpellCommand } from '../../../../../../models/macro';

export class DrainBiteWeak extends SpellCommand {
  override aliases = ['drainbiteweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) === 0;
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

    this.game.spellManager.castSpell('Drain', executor, target, {
      potency: random(1, 3) * executor.level,
      chance: 100,
    });
  }
}
