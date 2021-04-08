import { DamageClass, ICharacter, SoundEffect, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Antipode extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !target) return;

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with antipodes!',
      defMsg: '%0 struck you with antipodes!',
      sfx: SoundEffect.CombatHitSpell,
      damage: this.getPotency(caster, target, spellCastArgs.spellData),
      damageClass: DamageClass.Fire,
      spellData: spellCastArgs.spellData
    });

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with antipodes!',
      defMsg: '%0 struck you with antipodes!',
      sfx: SoundEffect.CombatHitSpell,
      damage: this.getPotency(caster, target, spellCastArgs.spellData),
      damageClass: DamageClass.Ice,
      spellData: spellCastArgs.spellData
    });
  }

}
