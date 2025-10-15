import type { IGround, INPC, IPlayer, IPlayerState } from '@lotr/interfaces';

// synced to client side: do not put any complex data structures in here
export class PlayerState implements IPlayerState {
  npcs: Record<string, Partial<INPC>>;
  players: Record<string, Partial<IPlayer>>;
  ground: IGround;
  openDoors: Record<number, boolean>;
}
