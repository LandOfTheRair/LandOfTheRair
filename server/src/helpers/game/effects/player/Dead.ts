import { ICharacter, IPlayer, IStatusEffect } from '../../../../interfaces';
import { Effect, Player } from '../../../../models';

export class Dead extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    const corpse = this.game.corpseManager.getCorpseRef(
      (char as IPlayer).username,
    );

    if (!corpse) {
      this.unapply(char, effect);
      return;
    }
  }

  override unapply(char: ICharacter, effect: IStatusEffect) {
    // if you're not still dead, we won't rot
    if (!this.game.characterHelper.isDead(char)) return;

    this.game.deathHelper.restore(char as Player, { shouldRot: true });
  }
}
