import {
  DamageArgs,
  DamageClass,
  ICharacter,
  IStatusEffect,
} from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class PhysicalToFire extends Effect {
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
      damageClass: DamageClass.Fire,
      atkMsg: 'You strike %0 with a blast of heat!',
      defMsg: '%0 struck you with a blast of heat!',
    });
  }
}
