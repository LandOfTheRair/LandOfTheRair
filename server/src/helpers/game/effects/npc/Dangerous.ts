import { ICharacter, Stat } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Dangerous extends Effect {

  // dangerous creatures heal 1% per tick out of combat
  tick(char: ICharacter) {
    if (char.combatTicks) return;
    this.game.characterHelper.heal(char, Math.floor(char.hp.maximum / 100));
  }

}
