import { DamageClass, ICharacter, IPlayer, IStatusEffect, SoundEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Drowning extends Effect {

  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = (char as IPlayer).swimLevel || 4;
    effect.effectInfo.startTimer = Date.now();
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    const minDamage = (Date.now() - effect.effectInfo.startTimer!) / 4000 + 1;
    const hpLost = Math.max(Math.floor(char.hp.maximum * (effect.effectInfo.potency / 100)), minDamage);
    this.game.combatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: (char as IPlayer).swimElement as DamageClass || DamageClass.Water,
      damageMessage: 'You are drowning!',
      suppressIfNegative: true,
      overrideSfx: SoundEffect.CombatHitMelee
    });
  }

}
