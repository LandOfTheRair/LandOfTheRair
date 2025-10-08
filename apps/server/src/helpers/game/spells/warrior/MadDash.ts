import { mana } from '@lotr/characters';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MadDash extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    const maddashData = this.game.spellManager.getSpellData(
      'MadDash',
      `MD:${caster?.name}`,
    );
    const maddashPotency = this.game.spellManager.getPotency(
      caster,
      caster,
      maddashData,
    );

    this.game.movementHelper.moveTowards(caster, target);

    this.game.combatHelper.physicalAttack(caster, target, {
      damageMult: maddashPotency,
    });

    mana(caster, 30);
  }
}
