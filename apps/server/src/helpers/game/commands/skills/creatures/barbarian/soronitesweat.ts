import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class SoroniteSweat extends SpellCommand {
  override aliases = ['art soronitesweat'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'SoroniteSweat';
  override spellRef = 'SoroniteSweat';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'SoroniteSweat');
  }
}
