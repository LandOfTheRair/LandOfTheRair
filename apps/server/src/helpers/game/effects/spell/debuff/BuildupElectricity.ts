import { random } from 'lodash';

import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class BuildupElectricity extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    effect.effectInfo.buildUpMax = 100;

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
    if (currentDamage < 0) return currentDamage;

    if (damageArgs.damageClass === DamageClass.Lightning) {
      effect.effectInfo.potency =
        (effect.effectInfo.potency ?? 0) + currentDamage;

      effect.effectInfo.buildUpCurrent ??= 0;
      effect.effectInfo.buildUpCurrent += random(10, 25);

      if (
        effect.effectInfo.buildUpCurrent >=
        (effect.effectInfo.buildUpMax ?? 100)
      ) {
        this.game.effectHelper.removeEffect(char, effect);

        const shockTotal = effect.effectInfo.potency;
        this.game.effectHelper.addEffect(
          char,
          { name: effect.sourceName, uuid: effect.sourceUUID ?? '' },
          'TeslaCoil',
          { effect: { extra: { potency: shockTotal / 15 } } },
        );
      }
    }

    return currentDamage;
  }
}
