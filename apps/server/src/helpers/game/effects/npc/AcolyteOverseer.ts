import { heal } from '@lotr/characters';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';
import type { CrazedSaraxaAIBehavior } from '../../../../models/world/ai/crazedsaraxa';

export class AcolyteOverseer extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const clear = () => {
      this.game.effectHelper.removeEffectByName(char, 'AcolyteOverseer');
    };

    const ai = this.game.worldManager
      .getMap(char.map)
      ?.state.getNPCSpawner(char.uuid)
      ?.getNPCAI(char.uuid) as CrazedSaraxaAIBehavior;
    if (!ai) {
      clear();
      return;
    }

    const livingAcolytes = ai.livingAcolytes.length;

    if (livingAcolytes > 0) {
      if ((effect.effectInfo.currentTick ?? 0) % 5 !== 0) return;
      heal(char, char.hp.maximum * 0.04 * livingAcolytes);
      return;
    }

    clear();
  }
}
