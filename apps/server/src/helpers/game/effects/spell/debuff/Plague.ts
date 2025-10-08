import { sample } from 'lodash';

import { traitHasLearned, traitLevelValue } from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IPlayer, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Plague extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        effect.effectInfo.isContagious = traitHasLearned(
          caster as IPlayer,
          'ContagiousPlague',
        );

        // pandemic lets us spread immediately
        if (!effect.effectInfo.isSpreadEffect) {
          const numSpreads = traitLevelValue(caster, 'Pandemic');
          for (let i = 0; i < numSpreads; i++) {
            this.spread(char, effect, caster);
          }
        }
      }
    }
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? undefined;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Disease,
      defMsg: 'You are plagued!',
    });

    // spread the contagion
    const curTick = effect.effectInfo.currentTick ?? 0;
    if (curTick > 3 && effect.effectInfo.isContagious && curTick % 3 === 0) {
      this.spread(char, effect, caster);
    }
  }

  private spread(
    char: ICharacter,
    effect: IStatusEffect,
    caster: ICharacter | undefined,
  ) {
    const mapState = this.game.worldManager.getMap(char.map)?.state;
    if (!mapState) return;

    const nearby = mapState
      .getAllInRange(char, 1)
      .filter((x) =>
        x !== char && caster
          ? this.game.targettingHelper.checkTargetForHostility(caster, x)
          : true && !hasEffect(x, 'Plague'),
      );

    if (nearby.length === 0) return;

    const spreadTo = sample(nearby);
    if (spreadTo) {
      this.game.effectHelper.addEffect(
        spreadTo,
        caster ?? 'somebody',
        'Plague',
        {
          effectMeta: {
            effectRef: 'Plague',
          },
          effect: {
            duration: Math.max(
              1,
              Math.floor((effect.endsAt - Date.now()) / 1000),
            ),
            extra: {
              ...effect.effectInfo,
              isSpreadEffect: true,
            },
          },
        },
      );
    }
  }
}
