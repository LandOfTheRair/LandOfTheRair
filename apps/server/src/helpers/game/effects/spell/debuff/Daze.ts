import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Daze extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {}
}
