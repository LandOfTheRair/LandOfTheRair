import type {
  DamageArgs,
  ICharacter,
  IStatusEffect } from '@lotr/interfaces';
import {
  DamageClass
} from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class PhysicalToIce extends Effect {
  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;

    if (!this.game.diceRollerHelper.XInOneHundred(20)) return;

    this.game.combatHelper.magicalAttack(char, target, {
      damage: damageArgs.damage * (effect.effectInfo.potency ?? 1),
      damageClass: DamageClass.Ice,
      atkMsg: 'You strike %0 with glacial chill!',
      defMsg: '%0 struck you with glacial chill!',
    });
  }
}
