import type { ICharacter } from '@lotr/interfaces';
import type { Player } from '../../../../../models';
import { Effect } from '../../../../../models';

export class TrueSight extends Effect {
  // update everyone in sight so they can't see us (maybe)
  override apply(char: ICharacter) {
    if (this.game.characterHelper.isPlayer(char)) {
      this.game.playerHelper.refreshPlayerMapState(char as Player);
    }
  }

  // update everyone in sight so they can see us again (if they couldn't before)
  override unapply(char: ICharacter) {
    if (this.game.characterHelper.isPlayer(char)) {
      this.game.playerHelper.refreshPlayerMapState(char as Player);
    }
  }
}
