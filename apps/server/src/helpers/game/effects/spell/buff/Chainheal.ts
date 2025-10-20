import { worldGetMapAndState } from '@lotr/core';
import {
  DamageClass,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { sample, sortBy } from 'lodash';
import { Effect } from '../../../../../models';

export class Chainheal extends Effect {
  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = worldGetMapAndState(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? undefined;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      atkMsg: 'You heal %0!',
      defMsg: 'You feel a warm surge from your neck!',
      damage: -effect.effectInfo.potency,
      damageClass: DamageClass.Heal,
    });

    if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
      const ticksLeft = (effect.endsAt - Date.now()) / 1000;
      const newDuration = ticksLeft - ticksLeft / 5 - 150;
      if (newDuration > 0) {
        const possibleTargets = sortBy(
          this.game.targettingHelper
            .getPossibleFriendlyAOETargets(char, char, 4)
            .filter((t) => t !== char),
          (c) => c.hp.current / c.hp.maximum,
        );

        const target = sample(possibleTargets);
        if (target) {
          this.game.effectHelper.addEffect(target, caster ?? '', 'Chainheal', {
            effect: {
              duration: Math.max(5, newDuration),
              extra: {
                potency: effect.effectInfo.potency,
              },
            },
          });
        }
      }

      this.game.effectHelper.removeEffect(char, effect);
    }
  }
}
