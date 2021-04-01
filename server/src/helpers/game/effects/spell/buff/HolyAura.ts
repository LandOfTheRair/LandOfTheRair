
import { ICharacter, IStatusEffect, DamageArgs } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class HolyAura extends Effect {

  public create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.charges = effect.effectInfo.potency * 50;
  }

  public incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number
  ): number {
    if(effect.effectInfo.charges) {
      effect.effectInfo.charges -= currentDamage;
      if (effect.effectInfo.charges <= 0) {
        this.game.effectHelper.removeEffect(char, effect);
      }
    }

    return 0;
  }

}
