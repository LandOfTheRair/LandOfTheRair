import { hasEffect } from '@lotr/effects';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Antidote extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;
    const hasPoison = hasEffect(target, 'Poison');
    const hasDisease = hasEffect(target, 'Disease');
    const hasVenom = hasEffect(target, 'Venom');

    if (!hasPoison && !hasDisease && !hasVenom && caster) {
      this.sendMessage(caster, {
        message: `${target.name} is not poisoned, diseased, or affected by venom.`,
      });
      return;
    }

    if (hasPoison) this.game.effectHelper.removeEffectByName(target, 'Poison');
    if (hasDisease) {
      this.game.effectHelper.removeEffectByName(target, 'Disease');
    }
    if (hasVenom) this.game.effectHelper.removeEffectByName(target, 'Venom');
  }
}
