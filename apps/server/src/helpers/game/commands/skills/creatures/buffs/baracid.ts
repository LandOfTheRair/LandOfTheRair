import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class BarAcid extends SpellCommand {
  override aliases = ['baracid', 'cast baracid'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'BarAcid';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'BarAcid');
  }
}
