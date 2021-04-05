import { DamageClass, ICharacter, IPlayer, IStatusEffect, SoundEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Drowning extends Effect {

  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = (char as IPlayer).swimLevel || 4;
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    const hpLost = Math.floor(char.hp.maximum * (effect.effectInfo.potency / 100));
    this.game.combatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: (char as IPlayer).swimElement as DamageClass || DamageClass.Water,
      damageMessage: 'You are drowning!',
      suppressIfNegative: true,
      overrideSfx: SoundEffect.CombatHitMelee
    });
  }

}
