import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HolyBath extends SpellCommand {
  override aliases = ['holybath', 'cast holybath'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'HolyBath';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'HolyBath');
  }

  override use(executor: ICharacter, target: ICharacter) {
    super.use(executor, executor);
  }
}
