import {
  DamageClass,
  ICharacter,
  IStatusEffect,
  SoundEffect,
} from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Suffocating extends Effect {
  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = 4;
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    const hpLost = Math.max(
      Math.floor(char.hp.maximum * (effect.effectInfo.potency / 100)),
      1,
    );
    this.game.combatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: DamageClass.Water,
      damageMessage: 'You are suffocating!',
      suppressIfNegative: true,
      overrideSfx: SoundEffect.CombatHitMelee,
    });
  }
}
