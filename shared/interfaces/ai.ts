import { ICharacter } from './character';

export interface IAI {
  tick(): void;
  mechanicTick(): void;
  damageTaken(): void;
  death(killer: ICharacter|undefined): void;

  sendLeashMessage(): void;
}
