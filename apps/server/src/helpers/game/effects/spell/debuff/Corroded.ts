import { type ICharacter, type IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Corroded extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.combatHelper.damageRandomItemForCharacter(char, 500);
  }
}
