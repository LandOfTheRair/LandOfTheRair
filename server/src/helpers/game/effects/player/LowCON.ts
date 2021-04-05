import { ICharacter, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class LowCON extends Effect {

  override tick(char: ICharacter) {
    if (this.game.characterHelper.getBaseStat(char, Stat.CON) <= 3) return;
    this.game.effectHelper.removeEffectByName(char, 'LowCON');
  }

}
