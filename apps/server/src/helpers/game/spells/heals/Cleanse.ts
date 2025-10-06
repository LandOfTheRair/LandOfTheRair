import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Cleanse extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;
    const hasCurse = this.game.effectHelper.hasEffectLike(target, 'Curse');

    if (caster) {
      if (hasCurse) {
        this.sendMessage(caster, {
          message: `You removed curses from ${target.name}!`,
        });
      } else {
        this.sendMessage(caster, { message: `${target.name} is not cursed.` });
      }
    }

    if (hasCurse) {
      const curses = this.game.effectHelper.getEffectLike(target, 'Curse');
      curses.forEach((c) => {
        this.game.effectHelper.removeEffectByName(target, c.effectName);
      });
    }
  }
}
