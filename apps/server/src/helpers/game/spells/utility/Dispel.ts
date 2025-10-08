import { sample } from 'lodash';

import { dispellableEffects } from '@lotr/effects';
import type {
  ICharacter,
  IStatusEffect,
  SpellCastArgs,
} from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Dispel extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;

    const effects = dispellableEffects(target);
    if (effects.length === 0) {
      if (caster) {
        this.sendMessage(caster, {
          message: `${target.name} has no dispellable effects.`,
        });
      }
      return;
    }

    const lostEffect = sample(effects) as IStatusEffect;
    this.game.effectHelper.removeEffect(target, lostEffect);

    if (caster) {
      this.sendMessage(caster, {
        message: `Dispelled an effect from ${target.name}!`,
      });
    }
  }
}
