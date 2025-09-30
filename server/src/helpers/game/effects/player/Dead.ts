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

    if (corpse.mods.lastHeldBy) {
      if (effect.endsAt > 0) {
        effect.effectInfo.potency = effect.endsAt;
      }

      effect.endsAt = -1;
    } else if (corpse.mods.lastMap) {
      if (effect.effectInfo.potency !== 0) {
        if (Date.now() > effect.effectInfo.potency) {
          effect.endsAt = Date.now() + 15000;
        } else {
          effect.endsAt = effect.effectInfo.potency;
        }
      }

      effect.effectInfo.potency = 0;
    }
  }

  override unapply(char: ICharacter, effect: IStatusEffect) {
    // if you're not still dead, we won't rot
    if (!this.game.characterHelper.isDead(char)) return;

    this.game.deathHelper.restore(char as Player, { shouldRot: true });
  }
}
