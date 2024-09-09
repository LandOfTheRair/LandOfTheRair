import { sample } from 'lodash';

import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MagicMissile extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    // try to bounce to a nearby target
    if (
      caster &&
      target &&
      this.game.traitHelper.rollTraitValue(caster, 'BouncingMissiles')
    ) {
      const state = this.game.worldManager.getMapStateForCharacter(caster);
      if (!state) return;

      const nearby = state
        .getAllHostilesInRange(caster, 4)
        .filter((x) => x !== target);

      const bounceTo = sample(nearby);
      if (bounceTo) {
        this.game.spellManager.castSpell('MagicMissile', caster, bounceTo);
      }
    }

    if (
      caster &&
      target &&
      this.game.traitHelper.rollTraitValue(caster, 'DispellingMissiles')
    ) {
      this.game.spellManager.castSpell('Dispel', caster, target);
    }
  }
}
