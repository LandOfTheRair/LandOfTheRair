import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Berserk extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const existingBerserk = this.game.effectHelper.getEffect(caster, 'Berserk');

    if (!existingBerserk) {
      this.game.effectHelper.addEffect(caster, caster, 'Berserk', {
        effect: { duration: 30 },
      });
      return;
    }

    const berserkRef = this.game.effectManager.getEffectRef('Berserk');
    berserkRef.recast(existingBerserk, caster, caster);
  }
}
