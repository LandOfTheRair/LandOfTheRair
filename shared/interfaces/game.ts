import { ISimpleNPC } from './npc';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  player: IPlayer;
  map: any;
  npcs: { [uuid: string]: ISimpleNPC };
  players: { [uuid: string]: IPlayer };
  ground: any;
}
