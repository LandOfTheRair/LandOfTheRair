import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class HolyAura extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.charges = effect.effectInfo.potency * 50;
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (currentDamage < 0) return currentDamage;

    if (effect.effectInfo.charges) {
      effect.effectInfo.charges -= currentDamage;
      if (effect.effectInfo.charges <= 0) {
        this.game.effectHelper.removeEffect(char, effect);
      }
    }

    return 0;
  }
}
