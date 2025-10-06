import { hasEffect } from '@lotr/effects';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Shred extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;
    if (hasEffect(target, 'Dangerous')) return;

    const damage = Math.floor(target.hp.maximum / (spellCastArgs.potency ?? 1));

    this.game.combatHelper.magicalAttack(caster, target, {
      damage,
      damageClass: DamageClass.Sonic,
      atkMsg: 'You shred the flesh of %0!',
      defMsg: '%0 shreds your flesh!',
    });
  }
}
