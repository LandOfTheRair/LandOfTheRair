import { INPC } from './npc';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  player: IPlayer;
  map: any;
  mapInfo: {
    players: Record<string, Partial<IPlayer>>;
    npcs: Record<string, Partial<INPC>>;
    ground: any;
  };
}
