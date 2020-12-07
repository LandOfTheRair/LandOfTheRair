import { ICharacter, IStatusEffect } from '../../../shared/interfaces';

export interface BaseEffect {

  create(target: ICharacter, effect: IStatusEffect): void;
  apply(target: ICharacter, effect: IStatusEffect): void;
  tick(target: ICharacter, effect: IStatusEffect): void;
  unapply(target: ICharacter, effect: IStatusEffect): void;
  destroy(target: ICharacter, effect: IStatusEffect): void;

}
