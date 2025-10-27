import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class BarLightning extends SpellCommand {
  override aliases = ['barlightning', 'cast barlightning'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'BarLightning';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !hasEffect(target, 'BarLightning');
  }
}
