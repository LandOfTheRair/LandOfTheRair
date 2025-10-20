import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class PowerwordHeal extends SpellCommand {
  override aliases = ['powerword heal'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'PowerwordHeal';
  override spellRef = 'Cure';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return false;
  }
}
