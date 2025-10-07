import { getStat, isPlayer } from '@lotr/characters';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { diceRoll } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';
import { SpellCommand } from '../../../../../../models/macro';

export class HeatBiteWeak extends SpellCommand {
  override aliases = ['heatbiteweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !hasEffect(target, 'Burning') &&
      !hasEffect(target, 'RecentlyBurned')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    const damage = diceRoll(2, getStat(executor, Stat.STR));

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Fire,
      atkMsg: 'You sunk hot fangs into %0!',
      defMsg: '%0 sunk hot fangs into you!',
    });
  }
}
