import { random } from 'lodash';

import { traitLevelValue } from '@lotr/content';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { rollTraitValue } from '@lotr/rng';
import { Effect } from '../../../../../models';

export class BuildupChill extends Effect {
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
    if (damageArgs.damageClass === DamageClass.Ice) {
      effect.effectInfo.potency ??= 0;
      effect.effectInfo.buildUpCurrent ??= 0;

      effect.effectInfo.potency += currentDamage;
      effect.effectInfo.buildUpCurrent +=
        random(15, 25) +
        (attacker ? traitLevelValue(attacker, 'ChilledCore') : 0);

      if (
        effect.effectInfo.buildUpCurrent >=
        (effect.effectInfo.buildUpMax ?? 200)
      ) {
        this.game.effectHelper.removeEffect(char, effect);

        // try to freeze them solid
        if (attacker && rollTraitValue(attacker, 'WintersEmbrace')) {
          this.sendMessage(attacker, {
            message: `You froze ${char.name} solid!`,
          });
          this.game.effectHelper.addEffect(
            char,
            { name: effect.sourceName, uuid: effect.sourceUUID ?? '' },
            'Frozen',
            { effect: { extra: { potency: effect.effectInfo.potency } } },
          );
        } else {
          this.game.effectHelper.addEffect(
            char,
            { name: effect.sourceName, uuid: effect.sourceUUID ?? '' },
            'Chilled',
            { effect: { extra: { potency: effect.effectInfo.potency } } },
          );
        }
      }
    }

    return currentDamage;
  }
}
