import { DamageArgs, DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class ImbueFlame extends Effect {

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;
    if (!this.game.diceRollerHelper.XInOneHundred(15)) return;

    this.game.damageHelperMagic.magicalAttack(char, target, {
      atkMsg: 'You strike %0 for bonus fire damage!',
      defMsg: '%0 struck you with a blast of heat!',
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Fire
    });
  }

}
