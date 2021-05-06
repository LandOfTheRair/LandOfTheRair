
import { sample } from 'lodash';

import { ICharacter, IStatusEffect, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Dispel extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;

    const effects = this.game.effectHelper.dispellableEffects(target);
    if (effects.length === 0) {
      if (caster) {
        this.sendMessage(caster, { message: `${target.name} has no dispellable effects.` });
      }
      return;
    }

    const lostEffect = sample(effects) as IStatusEffect;
    this.game.effectHelper.removeEffect(target, lostEffect);

    if (caster) {
      this.sendMessage(caster, { message: `Dispelled an effect from ${target.name}!` });
    }
  }

}
