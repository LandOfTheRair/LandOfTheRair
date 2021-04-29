import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class FillFateWater extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.spellManager.castSpell('Fate', char);
  }

}
