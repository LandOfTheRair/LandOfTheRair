import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class Manapool extends SpellCommand {
  override aliases = ['manapool', 'cast manapool'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Manapool';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !hasEffect(target, 'Lifepool') &&
      !hasEffect(target, 'Manapool')
    );
  }
}
