import { INPC, IPlayer } from '../../interfaces';

// synced to client side: do not put any complex data structures in here
export class PlayerState {
  npcs: Record<string, Partial<INPC>>;
  players: Record<string, Partial<IPlayer>>;
  ground: any;
  openDoors: Record<number, boolean>;
}
