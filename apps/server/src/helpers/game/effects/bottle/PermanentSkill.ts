import { sample } from 'lodash';

import type { ICharacter, IPlayer, IStatusEffect, Skill } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class PermanentSkill extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const randomSkill = sample(
      Object.keys(char.skills).filter((x) => char.skills[x] > 0),
    ) as Skill;
    this.game.playerHelper.gainSkill(
      char as IPlayer,
      randomSkill,
      effect.effectInfo.potency ?? 1,
    );
    this.sendMessage(char, { message: 'You feel more skilled!' });
  }
}
