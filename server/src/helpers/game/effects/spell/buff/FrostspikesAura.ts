
import { ICharacter, IStatusEffect, DamageArgs, DamageClass } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class FrostspikesAura extends Effect {

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number
  ): number {
    if (!attacker || damageArgs.damageClass !== DamageClass.Physical) return currentDamage;

    this.game.damageHelperMagic.magicalAttack(char, attacker, {
      atkMsg: 'Your frostspikes strike %0!',
      defMsg: '%0\'s spiky aura struck you!',
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Ice
    });

    return currentDamage;
  }

}
