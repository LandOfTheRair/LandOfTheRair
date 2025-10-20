import { heal } from '@lotr/characters';
import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class AcolyteOverseer extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const clear = () => {
      this.game.effectHelper.removeEffectByName(char, 'AcolyteOverseer');
    };

    const ai = worldGetMapAndState(char.map)
      .state?.getNPCSpawner(char.uuid)
      ?.getNPCAI(char.uuid);

    if (!ai) {
      clear();
      return;
    }

    const livingAcolytes = (ai as any).livingAcolytes.length;

    if (livingAcolytes > 0) {
      if ((effect.effectInfo.currentTick ?? 0) % 5 !== 0) return;
      heal(char, char.hp.maximum * 0.04 * livingAcolytes);
      return;
    }

    clear();
  }
}
