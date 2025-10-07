import { getBaseStat } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class LowCON extends Effect {
  override tick(char: ICharacter) {
    if (getBaseStat(char, Stat.CON) <= 3) return;
    this.game.effectHelper.removeEffectByName(char, 'LowCON');
  }
}
