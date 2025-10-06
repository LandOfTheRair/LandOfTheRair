import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class DeliriousShout extends SpellCommand {
  override aliases = ['art deliriousshout'];
  override requiresLearn = true;
  override targetsFriendly = false;
  override canTargetSelf = false;
  override spellDataRef = 'DeliriousShout';
  override spellRef = 'DeliriousShout';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'DeliriousShout');
  }
}
