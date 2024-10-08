import { BaseClass } from './building-blocks';

export enum GuildRole {
  Owner = 10,
  Administrator = 5,
  Member = 3,
  Invited = 0,
}

export enum GuildLevel {
  HasGuildHall = 1,
  Basic = 0,
}

export interface IGuildMember {
  playerId: string;
  playerName: string;
  playerUsername: string;
  playerLevel: number;
  playerClass: BaseClass;
  playerRole: GuildRole;
  joinedAt: Date;
}

export interface IGuild {
  timestamp: number;

  name: string;
  tag: string;

  motd: string;

  treasury: number;

  level: GuildLevel;

  members: Record<string, IGuildMember>;
}
