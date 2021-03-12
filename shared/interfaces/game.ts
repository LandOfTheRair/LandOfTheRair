import { IVendorItem } from './behaviors';
import { Currency } from './building-blocks';
import { ICharacter, IItemContainer } from './character';
import { INPC } from './npc';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  currentTarget: string;
  itemTooltip: { tooltip: string, upgrades: string[] };
  player: IPlayer;
  map: any;

  trainerInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcMaxLevel: number;
    npcMaxSkill: number;
  };

  vendorInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcVendorCurrency: Currency;
    npcVendorItems: IVendorItem[];
    npcVendorDailyItems: IVendorItem[];
  };

  bankInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcBank: string;
    npcBranch: string;
  };

  mapInfo: {
    players: Record<string, Partial<IPlayer>>;
    npcs: Record<string, Partial<INPC>>;
    ground: any;
    openDoors: Record<number, boolean>;
  };

  lockerInfo: {
    regionId: string;
    lockerName: string;
    showLockers: Array<{ regionId: string, lockerId: string }>;
    playerLockers: Record<string, Record<string, IItemContainer>>;
  };

  inspectingCharacter: ICharacter | null;
}
