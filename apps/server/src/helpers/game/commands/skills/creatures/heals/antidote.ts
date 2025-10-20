import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class Antidote extends SpellCommand {
  override aliases = ['antidote', 'cast antidote'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Antidote';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      (hasEffect(target, 'Poison') || hasEffect(target, 'Disease'))
    );
  }
}
