import { SoundEffect } from './sfx';

export enum MessageType {
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
  Magic = 'magic'
}

export interface MessageInfo {
  message: string;
  fromDiscord?: string;
  sfx?: SoundEffect;
  from?: string;
  setTarget?: string|null;
  logInfo?: any;
  useSight?: boolean;
  except?: string[];
}
