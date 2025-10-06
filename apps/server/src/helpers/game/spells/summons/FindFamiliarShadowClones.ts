import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarShadowClones extends Spell {
  override getDuration(caster: ICharacter | null) {
    if (!caster) return 0;
    return Math.floor(
      this.game.characterHelper.getStat(caster, Stat.AGI) * 100,
    );
  }
}
