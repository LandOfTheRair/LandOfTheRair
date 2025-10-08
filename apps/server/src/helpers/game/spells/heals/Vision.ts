import { hasEffect } from '@lotr/effects';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Vision extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;
    const hasBlind = hasEffect(target, 'Blind');

    if (!hasBlind && caster) {
      this.sendMessage(caster, { message: `${target.name} is not blinded.` });
      return;
    }

    this.game.effectHelper.removeEffectByName(target, 'Blind');
  }
}
