import { ISimpleNPC } from './npc';

export interface IGame {
  inGame: boolean;
  map: any;
  npcs: ISimpleNPC[];
}
