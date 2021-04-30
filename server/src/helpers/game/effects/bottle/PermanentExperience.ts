import { ICharacter, IPlayer, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class PermanentExperience extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.playerHelper.gainExp(char as IPlayer, effect.effectInfo.potency ?? 1);
    this.sendMessage(char, { message: 'You feel more experienced!' });
  }

}
