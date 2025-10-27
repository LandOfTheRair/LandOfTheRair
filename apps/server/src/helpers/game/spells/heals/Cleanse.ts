import { getEffectLike, hasEffectLike } from '@lotr/effects';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { sample } from 'lodash';
import { Spell } from '../../../../models/world/Spell';

export class Cleanse extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;
    const hasCurse = hasEffectLike(target, 'Curse');

    if (caster) {
      if (hasCurse) {
        this.sendMessage(caster, {
          message: `You removed a curse from ${target.name}!`,
        });
      } else {
        this.sendMessage(caster, { message: `${target.name} is not cursed.` });
      }
    }

    if (hasCurse) {
      const curses = getEffectLike(target, 'Curse');
      const curse = sample(curses);
      if (curse) {
        this.game.effectHelper.removeEffectByName(target, curse.effectName);
      }
    }
  }
}
