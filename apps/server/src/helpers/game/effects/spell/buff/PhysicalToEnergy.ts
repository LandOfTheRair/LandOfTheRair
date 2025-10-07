import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { rollInOneHundred } from '@lotr/rng';
import { Effect } from '../../../../../models';

export class PhysicalToEnergy extends Effect {
  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;

    if (!rollInOneHundred(20)) return;

    this.game.combatHelper.magicalAttack(char, target, {
      damage: damageArgs.damage * (effect.effectInfo.potency ?? 1),
      damageClass: DamageClass.Energy,
      atkMsg: 'You strike %0 with raw energy!',
      defMsg: '%0 struck you with raw energy!',
    });
  }
}
