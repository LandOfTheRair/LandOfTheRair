import type { IAccount } from '@lotr/interfaces';

class LobbyState {
  userHash: Record<string, IAccount> = {};
  discordIDToName: Record<string, string> = {};
  discordOnlineCount = 0;
  blockGameEnter = false;
  lobbyPlayerCount = 0;
  gamePlayerCount = 0;
}

const lobbyState = new LobbyState();

export function lobbyGetOnlineUsernames(): string[] {
  return Object.keys(lobbyState.userHash);
}

export function lobbyGetAccount(username: string): IAccount | undefined {
  return lobbyState.userHash[username];
}

export function lobbyAddUser(username: string, account: IAccount): void {
  lobbyState.userHash[username] = account;
  lobbyState.discordIDToName[account.discordTag] = username;
  lobbyState.lobbyPlayerCount += 1;
}

export function lobbyRemoveUser(username: string): void {
  const user = lobbyState.userHash[username];
  if (!user) return;

  delete lobbyState.userHash[username];
  delete lobbyState.discordIDToName[user.discordTag];
  lobbyState.lobbyPlayerCount -= 1;
}

export function lobbyHasUser(username: string): boolean {
  return !!lobbyState.userHash[username];
}

export function lobbyUserCount(): number {
  return lobbyState.lobbyPlayerCount;
}

export function lobbyPlayerJoinGame(username: string) {
  lobbyState.gamePlayerCount += 1;

  const account = lobbyState.userHash[username];
  if (account) {
    account.inGame = true;
  }
}

export function lobbyPlayerLeaveGame(username: string) {
  lobbyState.gamePlayerCount -= 1;

  const account = lobbyState.userHash[username];
  if (account) {
    account.inGame = false;
  }
}

export function lobbyInGamePlayerCount(): number {
  return lobbyState.gamePlayerCount;
}

export function lobbyGetUsernameByDiscordId(
  discordId: string,
): string | undefined {
  return lobbyState.discordIDToName[discordId];
}

export function lobbyDiscordUserCount(): number {
  return lobbyState.discordOnlineCount;
}

export function lobbyDiscordUserCountSet(count: number): void {
  lobbyState.discordOnlineCount = count;
}

export function lobbyBlockingGame(): boolean {
  return lobbyState.blockGameEnter;
}

export function lobbyToggleBlockingGame(): void {
  lobbyState.blockGameEnter = !lobbyState.blockGameEnter;
}
