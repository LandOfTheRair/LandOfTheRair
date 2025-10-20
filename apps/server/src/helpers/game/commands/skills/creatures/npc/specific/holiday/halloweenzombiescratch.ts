import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, INPC } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

export class HalloweenZombieScratch extends SpellCommand {
  override aliases = ['halloweenzombiescratch'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !hasEffect(target, 'Dangerous') &&
      !hasEffect(target, 'ZombieScratch') &&
      (target as INPC).monsterClass === 'Humanoid' &&
      !isPlayer(target) &&
      !(target as INPC).owner
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.effectHelper.addEffect(target, executor, 'ZombieScratch');
  }
}
