import { Currency, Holiday } from './building-blocks';
import { IItemContainer } from './character';
import { IGuild } from './guild';
import { ISimpleItem } from './item';
import { INPC } from './npc';
import { IParty, IPartyMember } from './party';
import { IPlayer } from './player';

export interface IGame {
  inGame: boolean;
  currentTarget: string;
  itemTooltip: { tooltip: string; upgrades: string[] };
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
    npcGuildTeleport: boolean;
  };

  vendorInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcVendorCurrency: Currency;
    npcVendorItems: ISimpleItem[];
    npcVendorDailyItems: ISimpleItem[];
  };

  bankInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
    npcBank: string;
    npcBranch: string;
  };

  marketInfo: {
    npcUUID: string;
    npcName: string;
    npcSprite: number;
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
  };

  tradeskillInfo: {
    tradeskill: string;
  };

  guildInfo: {
    guild: IGuild | null;
    auditLog: any[];
  };

  inspectingCharacter: IPlayer | null;
}
