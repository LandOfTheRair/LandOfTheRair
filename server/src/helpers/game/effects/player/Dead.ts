import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect, Player } from '../../../../models';

export class Dead extends Effect {

  override unapply(char: ICharacter, effect: IStatusEffect) {
    // if you're not still dead, we won't rot
    if (!this.game.characterHelper.isDead(char)) return;

    this.game.deathHelper.restore(char as Player, { shouldRot: true });
  }

}
