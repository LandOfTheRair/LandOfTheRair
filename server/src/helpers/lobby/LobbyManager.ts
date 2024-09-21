import { Injectable } from 'injection-js';

import {
  GameAction,
  GameServerResponse,
  IAccount,
  ILobbyCommand,
} from '../../interfaces';
import { Account, Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import { WorldManager } from '../data';
import { PlayerManager } from '../game';

import * as commands from './lobby-commands';

class LobbyState {
  userHash: Record<string, Account> = {};
  discordIDToName: Record<string, string> = {};
  discordOnlineCount = 0;
  blockGameEnter = false;
  lobbyPlayerCount = 0;
  gamePlayerCount = 0;
}

@Injectable()
export class LobbyManager extends BaseService {
  constructor(
    private playerManager: PlayerManager,
    private worldManager: WorldManager,
  ) {
    super();
  }

  private state: LobbyState;
  private lobbyCommands: Record<string, ILobbyCommand> = {};

  public get simpleOnlineAccounts() {
    return Object.keys(this.state.userHash).map((username) => {
      const fullAccount = this.state.userHash[username];
      const strippedAccount = this.game.accountDB.simpleAccount(fullAccount);
      strippedAccount.inGame = fullAccount.inGame;
      return strippedAccount;
    });
  }

  public get onlineUsernames() {
    return Object.keys(this.state.userHash);
  }

  public init() {
    this.state = new LobbyState();
    this.initCommands();
  }

  public joinLobby(account: Account): void {
    this.state.userHash[account.username] = account;
    this.state.discordIDToName[account.discordTag] = account.username;

    this.state.lobbyPlayerCount += 1;
    this.game.discordHelper.updateLobbyChannel();
    this.game.discordHelper.updateDiscordRoles(account);
  }

  public leaveLobby(username: string): void {
    const user = this.state.userHash[username];
    delete this.state.userHash[username];
    delete this.state.discordIDToName[user.discordTag];

    this.state.lobbyPlayerCount -= 1;
    this.game.discordHelper.updateLobbyChannel();
  }

  public hasJoinedLobby(username: string): boolean {
    return !!this.state.userHash[username];
  }

  public usersInLobby(): number {
    return this.state.lobbyPlayerCount;
  }

  public async joinGame(account: Account, player: Player): Promise<void> {
    await this.game.characterDB.reloadPlayerAccountInfo(player, account);
    this.game.playerHelper.migrate(player, account);
    await this.game.characterDB.loadPlayerDailyInfo(player, account);
    this.worldManager.checkPlayerForDoorsBeforeJoiningGame(player);
    this.playerManager.addPlayerToGame(player);
    this.worldManager.joinMap(player);
    account.inGame = true;
    this.state.gamePlayerCount += 1;
    this.game.discordHelper.updateLobbyChannel();
  }

  public leaveGame(username: string): void {
    const player = this.playerManager.getPlayerByUsername(username);
    if (!player) {
      throw new Error(
        `Lobby leave game could not get player for username ${username}`,
      );
    }

    this.game.partyHelper.leaveParty(player);
    this.worldManager.leaveMap(player, true);
    this.playerManager.savePlayer(player);
    this.playerManager.removePlayerFromGame(player);

    const user = this.state.userHash[username];
    if (user) {
      user.inGame = false;
    }

    this.state.gamePlayerCount -= 1;
    this.game.discordHelper.updateLobbyChannel();
  }

  public forceLeaveGame(username: string) {
    this.leaveGame(username);

    this.game.wsCmdHandler.broadcast({
      action: GameAction.ChatUserLeaveGame,
      username,
    });

    this.game.wsCmdHandler.sendToSocket(username, {
      action: GameAction.GameQuit,
    });
  }

  // get an account
  public getAccount(username: string): IAccount {
    return this.state.userHash[username];
  }

  // check if an account is in game
  public hasJoinedGame(username: string): boolean {
    if (this.playerManager.getPlayerByUsername(username)) {
      return true;
    } else {
      return false;
    }
  }

  public usersInGameCount(): number {
    return this.state.gamePlayerCount;
  }

  // set the number of online discord users with "Online In Lobby"
  public setDiscordOnlineCount(count: number) {
    const oldCount = this.state.discordOnlineCount;
    this.state.discordOnlineCount = count;

    if (count !== oldCount) {
      this.game.wsCmdHandler.broadcast({
        type: GameServerResponse.UserCountUpdate,
        count,
      });
    }
  }

  public getUsernameByDiscordId(username: string) {
    return this.state.discordIDToName[username];
  }

  public hasCommand(cmd: string): boolean {
    return !!this.lobbyCommands[cmd];
  }

  public getCommandSyntax(cmd: string): string {
    return this.lobbyCommands[cmd].syntax;
  }

  public async doCommand(
    cmd: string,
    message: string,
    emit: (args) => void,
  ): Promise<boolean> {
    if (!this.lobbyCommands[cmd]) return false;
    return this.lobbyCommands[cmd].do(message, this.game, emit);
  }

  private initCommands() {
    Object.values(commands).forEach((command) => {
      const cmdInst = new command();
      this.lobbyCommands[cmdInst.name] = cmdInst;
    });
  }

  public isBlocked(): boolean {
    return this.state.blockGameEnter;
  }

  public toggleBlock(): void {
    this.state.blockGameEnter = !this.state.blockGameEnter;
  }

  public updateAccount(account: IAccount): void {
    this.game.wsCmdHandler.sendToSocket(account.username, {
      action: GameAction.SetAccount,
      account: this.game.db.prepareForTransmission(account),
    });
  }

  public isConnectedGm(username: string) {
    if (username === '★System') return true;
    const account = this.getAccount(username);
    if (!account) return false;
    return account.isGameMaster;
  }
}
