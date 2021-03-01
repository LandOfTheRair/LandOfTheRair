
export interface IInternalCommand {
  name: string;
}

export interface IDiscordCommand extends IInternalCommand {
  do(message, game): void;
}

export interface ILobbyCommand extends IInternalCommand {
  syntax: string;
  do(message: string, game, emit: (args) => void): boolean;
}
