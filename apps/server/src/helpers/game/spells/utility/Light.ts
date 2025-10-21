import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { darknessRemove } from '@lotr/visibility';
import { Spell } from '../../../../models/world/Spell';

export class Light extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (target) return;

    const basePotency = spellCastArgs.potency ?? 10;
    const duration = basePotency * 1500;

    const center = {
      x: spellCastArgs.x ?? 0,
      y: spellCastArgs.y ?? 0,
      map: spellCastArgs.map ?? '',
    };

    darknessRemove(
      center.map,
      center.x,
      center.y,
      spellCastArgs.range,
      Date.now() + duration,
    );
  }
}
