import { IVendorItem } from './behaviors';
import { Currency, Holiday } from './building-blocks';
import { ICharacter, IItemContainer } from './character';
import { INPC } from './npc';
import { IParty, IPartyMember } from './party';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  currentTarget: string;
  itemTooltip: { tooltip: string, upgrades: string[] };
  player: IPlayer;
  map: any;
  currentHoliday: Holiday | null;

  trainerInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcMaxLevel: number;
    npcMaxSkill: number;
    npcCanRevive: boolean;
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
    lockerName: string;
    showLockers: string[];
    playerLockers: Record<string, IItemContainer>;
    accountLockers: Record<string, IItemContainer>;
  };

  partyInfo: {
    party: IParty;
    partyMembers: Record<string, IPartyMember>;
  }

  inspectingCharacter: ICharacter | null;
}
