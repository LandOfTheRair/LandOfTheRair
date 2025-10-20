import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class Absorption extends SpellCommand {
  override aliases = ['absorption', 'cast absorption'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Absorption';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !hasEffect(target, 'Absorption') &&
      !hasEffect(target, 'WizardStance')
    );
  }
}
