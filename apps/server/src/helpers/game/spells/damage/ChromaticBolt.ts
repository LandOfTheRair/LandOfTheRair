import type {
  ICharacter,
  SpellCastArgs } from '@lotr/interfaces';
import {
  DamageClass,
  SoundEffect
} from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class ChromaticBolt extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    const damage = this.game.spellManager.getPotency(
      caster,
      target,
      spellCastArgs.spellData,
    );

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with chromatic fire!',
      defMsg: '%0 struck you with chromatic fire!',
      sfx: SoundEffect.CombatHitSpell,
      damage,
      damageClass: DamageClass.Fire,
      spellData: spellCastArgs.spellData,
    });

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with chromatic frost!',
      defMsg: '%0 struck you with chromatic frost!',
      sfx: SoundEffect.CombatHitSpell,
      damage,
      damageClass: DamageClass.Ice,
      spellData: spellCastArgs.spellData,
    });

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with chromatic water!',
      defMsg: '%0 struck you with chromatic water!',
      sfx: SoundEffect.CombatHitSpell,
      damage,
      damageClass: DamageClass.Water,
      spellData: spellCastArgs.spellData,
    });

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with chromatic energy!',
      defMsg: '%0 struck you with chromatic energy!',
      sfx: SoundEffect.CombatHitSpell,
      damage,
      damageClass: DamageClass.Energy,
      spellData: spellCastArgs.spellData,
    });

    this.game.combatHelper.magicalAttack(caster, target, {
      atkMsg: 'You strike %0 with chromatic necrosis!',
      defMsg: '%0 struck you with chromatic necrosis!',
      sfx: SoundEffect.CombatHitSpell,
      damage,
      damageClass: DamageClass.Necrotic,
      spellData: spellCastArgs.spellData,
    });
  }
}
