
export interface IAI {
  tick(): void;
  mechanicTick(): void;
  damageTaken(): void;
  death(): void;
}
