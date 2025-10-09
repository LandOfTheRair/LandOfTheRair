import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class FrostfireMist extends SpellCommand {
  override aliases = ['frostfiremist', 'cast frostfiremist'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'FrostfireMist';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'FrostfireMist');
  }

  override use(executor: ICharacter, target: ICharacter) {
    super.use(executor, executor);
  }
}
