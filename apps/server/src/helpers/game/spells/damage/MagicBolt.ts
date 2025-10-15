import { hasEffect } from '@lotr/effects';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { rollTraitValue } from '@lotr/rng';
import { Spell } from '../../../../models/world/Spell';

export class MagicBolt extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (
      caster &&
      target &&
      rollTraitValue(caster, 'ConcussiveBolt') &&
      !hasEffect(target, 'Stun')
    ) {
      this.game.effectHelper.addEffect(target, caster, 'Stun', {
        effect: {
          duration: 5,
          extra: { disableMessages: true, disableRecently: true },
        },
      });
    }
  }
}
