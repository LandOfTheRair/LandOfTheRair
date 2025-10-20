import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class PowerwordBarFire extends SpellCommand {
  override aliases = ['powerword barfire'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'PowerwordBarFire';
  override spellRef = 'BarFire';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'BarFire');
  }
}
