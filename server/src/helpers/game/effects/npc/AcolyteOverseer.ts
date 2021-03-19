import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';
import { CrazedSaraxaAIBehavior } from '../../../../models/world/ai/crazedsaraxa';

export class AcolyteOverseer extends Effect {

  tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const clear = () => {
      this.game.effectHelper.removeEffectByName(char, 'AcolyteOverseer');
    };

    const ai = this.game.worldManager.getMap(char.map).state.getNPCSpawner(char.uuid)?.getNPCAI(char.uuid) as CrazedSaraxaAIBehavior;
    if (!ai) {
      clear();
      return;
    }

    const livingAcolytes = ai.livingAcolytes.length;

    if (livingAcolytes > 0) {
      if ((effect.effectInfo.currentTick ?? 0) % 5 !== 0) return;
      this.game.characterHelper.heal(char, char.hp.maximum * 0.04 * livingAcolytes);
      return;
    }

    clear();
  }

}
