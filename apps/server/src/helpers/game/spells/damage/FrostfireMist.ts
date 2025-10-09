import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FrostfireMist extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const center = {
      x: caster.x ?? 0,
      y: caster.y ?? 0,
      map: caster.map ?? '',
    };

    this.game.effectHelper.addEffect(caster, caster, 'FrostfireMist', {
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
