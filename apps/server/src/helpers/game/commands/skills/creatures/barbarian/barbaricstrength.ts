import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class BarbaricStrength extends SpellCommand {
  override aliases = ['art barbaricstrength'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'BarbaricStrength';
  override spellRef = 'BarbaricStrength';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) && !hasEffect(target, 'BarbaricStrength')
    );
  }
}
