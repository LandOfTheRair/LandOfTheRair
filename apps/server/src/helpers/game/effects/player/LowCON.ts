import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class LowCON extends Effect {
  override tick(char: ICharacter) {
    if (this.game.characterHelper.getBaseStat(char, Stat.CON) <= 3) return;
    this.game.effectHelper.removeEffectByName(char, 'LowCON');
  }
}
