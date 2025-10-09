import { VisualEffect } from './combat';
import { SoundEffect } from './sfx';

export enum MessageType {
  Banner = 'banner',
  Environment = 'environment',
  Miscellaneous = 'misc',
  Private = 'private',
  NPCChatter = 'npcchat',
  PlayerChat = 'playerchat',
  Lobby = 'lobby',
  Chatter = 'chatter',
  Other = 'other',
  Kill = 'kill',
  Hit = 'hit',
  Heal = 'heal',
  Description = 'description',
  NotMe = 'notme',
  Player = 'player',
  NPC = 'npc',
  Quest = 'quest',
  Muted = 'muted',

  // combat subtypes
  Combat = 'combat',
  Self = 'self',
  Miss = 'miss',
  Block = 'block',
  Blocked = 'blocked',
  Armor = 'armor',
  Weapon = 'weapon',
  Shield = 'shield',
  Offhand = 'offhand',
  OutOvertime = 'out-overtime',
  InOvertime = 'in-overtime',
  Melee = 'melee',
  Magic = 'magic',
}

export interface LogInfo {
  damage: number;
  monsterName: string;
  uuid: string;
  type: string;
  weapon: string;
}

export type MessageVFX = {
  vfx: VisualEffect;
  vfxTimeout: number;
  vfxTiles: { x: number; y: number }[];
};

export type MessageSFX = {
  sfx: SoundEffect;
};

export type MessageInfo = {
  message: string;
  fromDiscord?: string;
  from?: string;
  setTarget?: string | null | undefined;
  overrideIfOnly?: string;
  logInfo?: LogInfo;
  useSight?: boolean;
  except?: string[];
} & Partial<MessageVFX> &
  Partial<MessageSFX>;
