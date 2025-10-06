import type { ICharacter } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class EtherManipulation extends Effect {
  override tick(char: ICharacter) {
    if (this.game.worldManager.isDungeon(char.map)) return;
    this.game.effectHelper.removeEffectByName(char, 'EtherManipulation');
  }
}
