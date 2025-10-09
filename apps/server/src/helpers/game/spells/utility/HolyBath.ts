import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class HolyBath extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || target) return;

    const center = {
      x: spellCastArgs.x ?? 0,
      y: spellCastArgs.y ?? 0,
      map: spellCastArgs.map ?? '',
    };

    this.game.effectHelper.addEffect(caster, caster, 'HolyBath', {
      effect: {
        duration: 60,
        extra: {
          potency: spellCastArgs.potency ?? 100,
          center,
        },
      },
    });
  }
}
