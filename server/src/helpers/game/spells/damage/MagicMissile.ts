
import { sample } from 'lodash';

import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MagicMissile extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {

    // try to bounce to a nearby target
    if (caster && target && this.game.diceRollerHelper.XInOneHundred(this.game.traitHelper.traitLevelValue(caster, 'BouncingMissiles'))) {
      const nearby = this.game.targettingHelper.getPossibleAOETargets(caster, target, 4).filter(x => x !== target);

      const bounceTo = sample(nearby);
      if (bounceTo) {
        this.game.spellManager.castSpell('MagicMissile', caster, bounceTo);
      }

    }

  }

}
