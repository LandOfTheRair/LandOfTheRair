import { getEffect } from '@lotr/effects';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Cover extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const existingCover = getEffect(caster, 'Cover');
    const coverRef = this.game.effectManager.getEffectRef('Cover');

    if (existingCover) {
      coverRef.unapply(caster, existingCover);
      return;
    }

    this.game.effectHelper.addEffect(caster, caster, 'Cover', {
      effect: {
        duration: -1,
        extra: {
          linkedTo: spellCastArgs.originalArgs?.stringArgs,
        },
      },
    });
  }
}
