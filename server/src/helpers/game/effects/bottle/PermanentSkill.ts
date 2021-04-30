
import { sample } from 'lodash';

import { ICharacter, IPlayer, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class PermanentSkill extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    this.game.playerHelper.gainSkill(char as IPlayer, sample(Object.keys(char.skills)), effect.effectInfo.potency ?? 1);
    this.sendMessage(char, { message: 'You feel more skilled!' });
  }

}
