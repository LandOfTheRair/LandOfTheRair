import type {
  ICharacter,
  SpellCastArgs } from '@lotr/interfaces';
import {
  DamageClass,
  SoundEffect
} from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Antipode extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with antipodal fire!',
      defMsg: '%0 struck you with antipodal fire!',
      sfx: SoundEffect.CombatHitSpell,
      damage: this.game.spellManager.getPotency(
        caster,
        target,
        spellCastArgs.spellData,
      ),
      damageClass: DamageClass.Fire,
      spellData: spellCastArgs.spellData,
    });

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with antipodal frost!',
      defMsg: '%0 struck you with antipodal frost!',
      sfx: SoundEffect.CombatHitSpell,
      damage: this.game.spellManager.getPotency(
        caster,
        target,
        spellCastArgs.spellData,
      ),
      damageClass: DamageClass.Ice,
      spellData: spellCastArgs.spellData,
    });
  }
}
