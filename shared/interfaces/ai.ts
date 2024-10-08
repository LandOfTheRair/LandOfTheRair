import { ICharacter } from './character';

export interface IAI {
  tick(): void;
  mechanicTick(): void;
  damageTaken({
    damage,
    attacker,
  }: {
    damage: number;
    attacker: ICharacter | undefined | null;
  }): void;
  death(killer: ICharacter | undefined | null): void;
  resetAgro(full: boolean): void;
  focusTarget(character: ICharacter): void;

  sendLeashMessage(): void;
}
