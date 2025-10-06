import type {
  DamageArgs,
  ICharacter,
  IStatusEffect } from '@lotr/interfaces';
import {
  DamageClass
} from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class ImbueFrost extends Effect {
  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;
    if (!this.game.diceRollerHelper.XInOneHundred(15)) return;

    this.game.damageHelperMagic.magicalAttack(char, target, {
      atkMsg: 'You strike %0 for bonus ice damage!',
      defMsg: '%0 struck you with a chilling burst!',
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Ice,
    });
  }
}
