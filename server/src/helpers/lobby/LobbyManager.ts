
import { Injectable } from 'injection-js';

import { GameServerResponse, IAccount, ILobbyCommand } from '../../interfaces';
import { Account, Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import { WorldManager } from '../data';
import { PlayerManager } from '../game';

import * as commands from './lobby-commands';

class LobbyState {
  users: IAccount[] = [];
  userHash: Record<string, IAccount> = {};
  usersInGame: Record<string, boolean> = {};
  discordIDToName: Record<string, string> = {};
  discordOnlineCount = 0;
}

@Injectable()
export class LobbyManager extends BaseService {

  constructor(
    private playerManager: PlayerManager,
    private worldManager: WorldManager
  ) {
    super();
  }

  private state: LobbyState;
  private lobbyCommands: Record<string, ILobbyCommand> = {};

  public get usersInGame() {
    return this.state.usersInGame;
  }

  public get onlineUsers() {
    return this.state.users;
  }

  public get discordHash() {
    return this.state.discordIDToName;
  }

  public init() {
    this.state = new LobbyState();
    this.initCommands();
  }

  // add an account to the lobby
  public addAccount(account: Account): void {
    this.state.users.push(account);

    this.rebuildUserHash();

    this.game.discordHelper.updateDiscordRoles(account);
    this.game.discordHelper.updateLobbyChannel();
  }

  // get an account
  public getAccount(username: string): IAccount {
    return this.state.userHash[username];
  }

  // remove an account from the lobby
  public removeAccount(username: string): void {
    while (this.state.users.findIndex(x => x.username === username) !== -1) {
      this.state.users.splice(this.state.users.findIndex(x => x.username === username), 1);
    }

    delete this.state.usersInGame[username];

    this.rebuildUserHash();
    this.game.discordHelper.updateLobbyChannel();
  }

  // build a hash of users to their account objects
  private rebuildUserHash() {
    this.state.userHash = this.state.users.reduce((prev, cur) => {
      prev[cur.username] = cur;
      return prev;
    }, {});

    this.state.discordIDToName = this.state.users.reduce((prev, cur) => {
      if (!cur.discordTag) return prev;
      prev[cur.discordTag] = cur.username;
      return prev;
    }, {});
  }

  // check if an account is in game
  public isAccountInGame(account: Account): boolean {
    return this.state.usersInGame[account.username];
  }

  // enter game as a particular player
  public accountEnterGame(account: Account, player: Player): void {
    this.state.usersInGame[account.username] = true;
    this.game.discordHelper.updateLobbyChannel();

    this.game.playerHelper.migrate(player, account);
    this.worldManager.checkPlayerForDoorsBeforeJoiningGame(player);
    this.playerManager.addPlayerToGame(player);
    this.worldManager.joinMap(player);
  }

  // leave the game
  public accountLeaveGame(account: Account): void {
    delete this.state.usersInGame[account.username];
    this.game.discordHelper.updateLobbyChannel();

    const player = this.playerManager.getPlayerInGame(account);
    this.worldManager.leaveMap(player);
    this.playerManager.savePlayer(player);
    this.playerManager.removePlayerFromGameByAccount(account);
  }

  // set the number of online discord users with "Online In Lobby"
  public setDiscordOnlineCount(count: number) {
    const oldCount = this.state.discordOnlineCount;
    this.state.discordOnlineCount = count;

    if (count !== oldCount) {
      this.game.wsCmdHandler.broadcast({
        type: GameServerResponse.UserCountUpdate,
        count
      });
    }
  }

  public hasCommand(cmd: string): boolean {
    return !!this.lobbyCommands[cmd];
  }

  public getCommandSyntax(cmd: string): string {
    return this.lobbyCommands[cmd].syntax;
  }

  public doCommand(cmd: string, message: string, emit: (args) => void): boolean {
    if (!this.lobbyCommands[cmd]) return false;
    return this.lobbyCommands[cmd].do(message, this.game, emit);
  }

  private initCommands() {
    Object.values(commands).forEach(command => {
      const cmdInst = new command();
      this.lobbyCommands[cmdInst.name] = cmdInst;
    });
  }
}
