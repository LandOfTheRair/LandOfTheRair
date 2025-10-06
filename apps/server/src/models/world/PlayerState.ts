import type { IGround, INPC, IPlayer } from '@lotr/interfaces';

// synced to client side: do not put any complex data structures in here
export class PlayerState {
  npcs: Record<string, Partial<INPC>>;
  players: Record<string, Partial<IPlayer>>;
  ground: IGround;
  openDoors: Record<number, boolean>;
}
