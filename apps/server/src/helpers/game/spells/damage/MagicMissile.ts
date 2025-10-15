import { sample } from 'lodash';

import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { rollTraitValue } from '@lotr/rng';
import { Spell } from '../../../../models/world/Spell';

export class MagicMissile extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    // try to bounce to a nearby target
    if (caster && target && rollTraitValue(caster, 'BouncingMissiles')) {
      const nearby = this.game.targettingHelper
        .getPossibleAOETargets(caster, caster, 4)
        .filter((x) => x !== target);

      const bounceTo = sample(nearby);
      if (bounceTo) {
        this.game.spellManager.castSpell('MagicMissile', caster, bounceTo);
      }
    }

    if (caster && target && rollTraitValue(caster, 'DispellingMissiles')) {
      this.game.spellManager.castSpell('Dispel', caster, target);
    }
  }
}
