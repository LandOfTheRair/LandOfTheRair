
import { sample } from 'lodash';

import { DamageClass, ICharacter, IPlayer, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Plague extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        effect.effectInfo.isContagious = this.game.traitHelper.hasLearnedTrait(caster as IPlayer, 'ContagiousPlague');

        // pandemic lets us spread immediately
        if (!effect.effectInfo.isSpreadEffect) {
          const numSpreads = this.game.traitHelper.traitLevelValue(caster, 'Pandemic');
          for (let i = 0; i < numSpreads; i++) {
            this.spread(char, effect, caster);
          }
        }
      }
    }
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | null = null;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? null;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Disease,
      defMsg: 'You are plagued!'
    });

    // spread the contagion
    if (effect.effectInfo.isContagious && ((effect.effectInfo.currentTick ?? 0) % 3) === 0) {
      this.spread(char, effect, caster);
    }
  }

  private spread(char: ICharacter, effect: IStatusEffect, caster: ICharacter | null) {
    const mapState = this.game.worldManager.getMap(char.map)?.state;
    if (!mapState) return;

    const nearby = mapState.getAllAlliesInRange(char, 1).filter(x => x !== char
      && caster ? this.game.targettingHelper.checkTargetForHostility(caster, x) : true
      && !this.game.effectHelper.hasEffect(x, 'Plague'));

    if (nearby.length === 0) return;

    const spreadTo = sample(nearby);
    if (spreadTo) {
      this.game.effectHelper.addEffect(spreadTo, caster ?? 'somebody', 'Plague', {
        effectMeta: {
          effectRef: 'Plague'
        },
        effect: {
          duration: Math.floor((effect.endsAt - Date.now()) / 1000),
          extra: {
            ...effect.effectInfo,
            isSpreadEffect: true
          }
        }
      });
    }
  }

}
