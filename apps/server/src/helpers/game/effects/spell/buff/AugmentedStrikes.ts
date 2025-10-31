import { isDead } from '@lotr/characters';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { rollInOneHundred } from '@lotr/rng';
import { Effect } from '../../../../../models';

export class AugmentedStrikes extends Effect {
  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;
    if (isDead(target)) return;
    if (!rollInOneHundred(20)) return;

    this.game.damageHelperMagic.magicalAttack(char, target, {
      atkMsg: 'You strike is augmented by arcane energies %0!',
      defMsg: '%0 hit you with an augmented strike!',
      damage: Math.floor(damageArgs.damage * (effect.effectInfo.potency / 100)),
      damageClass: DamageClass.Physical,
      hasBeenReflected: true,
    });
  }
}
