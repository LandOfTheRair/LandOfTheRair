import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Newbie extends Effect {

  override tick(char: ICharacter, effect: IStatusEffect) {
    if (char.level <= 10 && !effect.effectInfo.tooltip) return;

    effect.effectInfo.statChanges = {};
    effect.effectInfo.tooltip = 'Gaining no bonus XP past level 10.';
  }

}
