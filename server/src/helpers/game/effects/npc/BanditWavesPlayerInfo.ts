import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class BanditWavesPlayerInfo extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (!char.map.includes('BanditCave-Dungeon')) {
      this.game.effectHelper.removeEffect(char, effect);
      return;
    }
  }
}
