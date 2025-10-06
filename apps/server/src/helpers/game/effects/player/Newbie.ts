import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class Newbie extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    if (char.level <= 10 && !effect.effectInfo.tooltip) return;

    if (!this.game.characterHelper.isPlayer(char)) {
      effect.effectInfo.tooltip = 'Kill me, new adventurer!';
      return;
    }

    effect.effectInfo.statChanges = {};
    effect.effectInfo.tooltip = 'Gaining no bonus XP past level 10.';
  }
}
