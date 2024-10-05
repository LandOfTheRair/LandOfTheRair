import { SlashCommandOptionsOnlyBuilder } from 'discord.js';

export interface IInternalCommand {
  name: string;
}

export interface IDiscordCommand {
  command: SlashCommandOptionsOnlyBuilder;
  do(message, game): void;
}

export interface ILobbyCommand extends IInternalCommand {
  syntax: string;
  do(message: string, game, emit: (args) => void): Promise<boolean>;
}
