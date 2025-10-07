import { heal } from '@lotr/characters';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class FillSpringWater extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    heal(char, char.hp.maximum * 0.1);
    this.sendMessage(char, { message: 'The spring water is refreshing!' });
  }
}
