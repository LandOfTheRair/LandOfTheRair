import { INPC } from './npc';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  currentTarget: string;
  itemTooltip: string;
  player: IPlayer;
  map: any;
  trainerInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcMaxLevel: number;
    npcMaxSkill: number;
  },
  mapInfo: {
    players: Record<string, Partial<IPlayer>>;
    npcs: Record<string, Partial<INPC>>;
    ground: any;
    openDoors: Record<number, boolean>;
  };
}
