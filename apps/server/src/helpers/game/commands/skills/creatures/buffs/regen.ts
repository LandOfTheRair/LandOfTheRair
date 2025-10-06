import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Regen extends SpellCommand {
  override aliases = ['regen', 'cast regen'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Regen';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !hasEffect(target, 'Regen') &&
      target.hp.current < target.hp.maximum * 0.75
    );
  }
}
