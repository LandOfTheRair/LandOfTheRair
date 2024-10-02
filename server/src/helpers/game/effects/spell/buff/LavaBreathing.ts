import { DamageClass, ICharacter, IPlayer } from '../../../../../interfaces';
import { Effect, Player } from '../../../../../models';

export class LavaBreathing extends Effect {
  override apply(char: ICharacter) {
    if ((char as IPlayer).swimElement === DamageClass.Fire) {
      this.game.effectHelper.removeEffectByName(char, 'Swimming');
      this.game.effectHelper.removeEffectByName(char, 'Drowning');
    }
  }

  override unapply(char: ICharacter) {
    if (!this.game.characterHelper.isPlayer(char)) return;
    this.game.playerHelper.resetStatus(char as Player, {
      ignoreMessages: true,
      sendFOV: false,
    });
  }
}
