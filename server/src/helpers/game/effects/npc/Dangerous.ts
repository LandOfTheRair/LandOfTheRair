import { ICharacter } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class Dangerous extends Effect {

  // dangerous creatures heal 5% per tick out of combat
  tick(char: ICharacter) {
    if (char.combatTicks) return;
    this.game.characterHelper.heal(char, Math.floor(char.hp.maximum / 20));
  }

}
