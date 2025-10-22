import { heal } from '@lotr/characters';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class BloodyTears extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const potency = Math.max(effect.effectInfo.potency ?? 1, 1);
    effect.effectInfo.tooltip = `Draining ${potency}% of physical damage as HP.`;
  }

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;

    const potency = Math.max(effect.effectInfo.potency ?? 1, 1);

    const healAmount = Math.floor(damageArgs.damage * (potency / 100));
    if (healAmount === 0) return;

    heal(char, healAmount);
    this.sendMessage(char, {
      message: `You drain ${healAmount} life from your foe!`,
    });
  }
}
