import { random } from 'lodash';

import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class BuildupEnergy extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (effect.effectInfo.buildUpCurrent) {
      effect.effectInfo.buildUpCurrent -= effect.effectInfo.buildUpDecay ?? 3;
      if (effect.effectInfo.buildUpCurrent <= 0) {
        this.game.effectHelper.removeEffect(char, effect);
      }
    }
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (damageArgs.damageClass === DamageClass.Energy) {
      effect.effectInfo.potency ??= 0;
      effect.effectInfo.buildUpCurrent ??= 0;

      effect.effectInfo.potency += currentDamage;
      effect.effectInfo.buildUpCurrent += random(7, 15);

      if (
        effect.effectInfo.buildUpCurrent >=
        (effect.effectInfo.buildUpMax ?? 200)
      ) {
        this.game.effectHelper.removeEffect(char, effect);

        this.game.effectHelper.addEffect(
          char,
          { name: effect.sourceName, uuid: effect.sourceUUID ?? '' },
          'Overcharged',
          { effect: { extra: { potency: 50 } } },
        );
      }
    }

    return currentDamage;
  }
}
