import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Protection extends SpellCommand {
  override aliases = ['protection', 'cast protection'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Protection';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !hasEffect(target, 'Protection') &&
      !hasEffect(target, 'WizardStance')
    );
  }
}
