import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class BarFire extends SpellCommand {
  override aliases = ['barfire', 'cast barfire'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'BarFire';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'BarFire');
  }
}
