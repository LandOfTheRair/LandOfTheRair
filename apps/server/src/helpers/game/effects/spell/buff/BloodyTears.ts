import type {
  DamageArgs,
  ICharacter,
  IStatusEffect } from '@lotr/interfaces';
import {
  DamageClass
} from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class BloodyTears extends Effect {
  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;

    const healAmount = Math.floor(damageArgs.damage * (1 / 100));
    if (healAmount === 0) return;

    this.game.characterHelper.heal(target, healAmount);
    this.sendMessage(char, {
      message: `You drain ${healAmount} life from your foe!`,
    });
  }
}
