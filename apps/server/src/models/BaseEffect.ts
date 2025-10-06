import type { ICharacter, IStatusEffect } from '@lotr/interfaces';

export interface BaseEffect {
  create(target: ICharacter, effect: IStatusEffect): void;
  apply(target: ICharacter, effect: IStatusEffect): void;
  tick(target: ICharacter, effect: IStatusEffect): void;
  unapply(target: ICharacter, effect: IStatusEffect): void;
  expire(target: ICharacter, effect: IStatusEffect): void;
}
