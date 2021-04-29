import { ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class FillNormalWater extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    const heal = Math.floor(char.hp.maximum * 0.1);

    this.game.characterHelper.heal(char, heal);
    this.sendMessage(char, { message: 'The water is refreshing!' });

    this.game.effectHelper.addEffect(char, char, 'BarWater', { effect: { duration: 7200, extra: { potency: heal } } });
  }

}
