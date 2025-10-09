import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Heathaze extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    this.game.effectHelper.addEffect(caster, caster, 'Heathaze', {
      effect: {
        duration: 60,
        extra: {
          potency: spellCastArgs.potency ?? 100,
        },
      },
    });
  }
}
