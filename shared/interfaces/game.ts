import { ISimpleNPC } from './npc';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  player: IPlayer;
  map: any;
  npcs: ISimpleNPC[];
}
