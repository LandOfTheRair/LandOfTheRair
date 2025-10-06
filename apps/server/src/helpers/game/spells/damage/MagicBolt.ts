import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MagicBolt extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (
      caster &&
      target &&
      this.game.traitHelper.rollTraitValue(caster, 'ConcussiveBolt') &&
      !this.game.effectHelper.hasEffect(target, 'Stun')
    ) {
      this.game.effectHelper.addEffect(target, caster, 'Stun', {
        effect: {
          duration: 5,
          extra: { disableMessages: true, disableRecently: true },
        },
      });
    }
  }
}
