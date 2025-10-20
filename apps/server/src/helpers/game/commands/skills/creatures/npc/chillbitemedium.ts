import { getStat, isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { diceRoll } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';

export class ChillBiteMedium extends SpellCommand {
  override aliases = ['chillbitemedium'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !hasEffect(target, 'Chilled') &&
      !hasEffect(target, 'RecentlyChilled')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    const damage = diceRoll(4, getStat(executor, Stat.STR));

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Ice,
      atkMsg: 'You sunk cold fangs into %0!',
      defMsg: '%0 sunk cold fangs into you!',
    });
  }
}
