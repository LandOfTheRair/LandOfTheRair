import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import type { Player } from '../../../../../models';
import { Effect } from '../../../../../models';

export class Blind extends Effect {
  public override apply(char: ICharacter, effect: IStatusEffect) {
    if (this.game.characterHelper.isPlayer(char)) {
      this.game.visibilityHelper.calculatePlayerFOV(char as Player);
    }
  }

  public override unapply(char: ICharacter, effect: IStatusEffect) {
    if (this.game.characterHelper.isPlayer(char)) {
      this.game.visibilityHelper.calculatePlayerFOV(char as Player);
    }
  }
}
