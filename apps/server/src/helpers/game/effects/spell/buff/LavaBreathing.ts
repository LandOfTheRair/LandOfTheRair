import { isPlayer } from '@lotr/characters';
import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import type { Player } from '../../../../../models';
import { Effect } from '../../../../../models';

export class LavaBreathing extends Effect {
  override apply(char: ICharacter) {
    if ((char as IPlayer).swimElement === DamageClass.Fire) {
      this.game.effectHelper.removeEffectByName(char, 'Swimming');
      this.game.effectHelper.removeEffectByName(char, 'Drowning');
    }
  }

  override unapply(char: ICharacter) {
    if (!isPlayer(char)) return;
    this.game.playerHelper.resetStatus(char as Player, {
      ignoreMessages: true,
      sendFOV: false,
    });
  }
}
