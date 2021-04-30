
import { sample } from 'lodash';

import { ICharacter, IPlayer, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class PermanentSkill extends Effect {

  override apply(char: ICharacter, effect: IStatusEffect) {
    const randomSkill = sample(Object.keys(char.skills).filter(x => char.skills[x] > 0));
    this.game.playerHelper.gainSkill(char as IPlayer, randomSkill, effect.effectInfo.potency ?? 1);
    this.sendMessage(char, { message: 'You feel more skilled!' });
  }

}
