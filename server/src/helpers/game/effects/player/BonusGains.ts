import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class BonusGains extends Effect {
  override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.unique = char.map;
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    if (char.map === effect.effectInfo.unique) return;
    this.game.effectHelper.removeEffectByName(char, 'BonusGains');
  }
}
