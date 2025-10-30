import { getStat, isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { diceRoll } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';

export class ShockBiteStrong extends SpellCommand {
  override aliases = ['shockbitestrong'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !hasEffect(target, 'TeslaCoil') &&
      !hasEffect(target, 'RecentlyShocked')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    const damage = diceRoll(6, getStat(executor, Stat.STR));

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Lightning,
      atkMsg: 'You sunk shocking fangs into %0!',
      defMsg: '%0 sunk shocking fangs into you!',
    });
  }
}
