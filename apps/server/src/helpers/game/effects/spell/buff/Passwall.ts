import { worldGetMapAndState } from '@lotr/core';
import { DamageClass, type ICharacter } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Passwall extends Effect {
  override unapply(char: ICharacter) {
    const map = worldGetMapAndState(char.map)?.map;
    if (!map) return;

    if (map.getWallAt(char.x, char.y)) {
      this.game.damageHelperOnesided.dealOnesidedDamage(char, {
        damage: 999999,
        damageClass: DamageClass.Blunt,
        damageMessage: 'You were killed by a wall!',
        suppressIfNegative: true,
      });
    }
  }
}
