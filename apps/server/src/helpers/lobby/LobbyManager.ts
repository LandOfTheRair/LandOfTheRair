import { Injectable } from 'injection-js';

import type { IAccount } from '@lotr/interfaces';
import { GameAction, GameServerResponse } from '@lotr/interfaces';
import type { Account, Player } from '../../models';
import { BaseService } from '../../models/BaseService';

import {
  lobbyAddUser,
  lobbyDiscordUserCount,
  lobbyDiscordUserCountSet,
  lobbyGetAccount,
  lobbyGetOnlineUsernames,
  lobbyPlayerJoinGame,
  lobbyPlayerLeaveGame,
  lobbyRemoveUser,
  wsBroadcast,
  wsSendToSocket,
} from '@lotr/core';
import type { ILobbyCommand } from '../../interfaces';
import * as commands from './lobby-commands';

@Injectable()
export class LobbyManager extends BaseService {
  private lobbyCommands: Record<string, ILobbyCommand> = {};

  public get simpleOnlineAccounts() {
    return lobbyGetOnlineUsernames()
      .map((username) => {
        const fullAccount = lobbyGetAccount(username);
        if (!fullAccount) return undefined;

        const strippedAccount = this.game.accountDB.simpleAccount(fullAccount);
        strippedAccount.inGame = fullAccount.inGame;
        return strippedAccount;
      })
      .filter(Boolean) as IAccount[];
  }

  public init() {
    this.initCommands();
  }

  public joinLobby(account: Account): void {
    lobbyAddUser(account.username, account);
    this.game.discordHelper.updateLobbyChannel();
    this.game.discordHelper.updateDiscordRoles(account);
  }

  public leaveLobby(username: string): void {
    lobbyRemoveUser(username);
    this.game.discordHelper.updateLobbyChannel();
  }

  public async joinGame(account: Account, player: Player): Promise<void> {
    await this.game.characterDB.reloadPlayerAccountInfo(player, account);
    this.game.migrationHelper.migrate(player, account);
    await this.game.characterDB.loadPlayerDailyInfo(player, account);
    this.game.worldManager.checkPlayerForDoorsBeforeJoiningGame(player);
    this.game.playerManager.addPlayerToGame(player);
    this.game.worldManager.joinMap(player);
    this.game.corpseManager.deleteCorpsesFromHandsOfPlayer(player);

    lobbyPlayerJoinGame(account.username);
    this.game.discordHelper.updateLobbyChannel();
  }

  public leaveGame(username: string): void {
    const player = this.game.playerManager.getPlayerByUsername(username);
    if (!player) {
      throw new Error(
        `Lobby leave game could not get player for username ${username}`,
      );
    }

    this.game.partyHelper.leaveParty(player);
    this.game.worldManager.leaveMap(player, true);
    this.game.playerManager.savePlayer(player);
    this.game.playerManager.removePlayerFromGame(player);
    this.game.corpseManager.forciblyDropCorpsesHeldByPlayer(player);

    lobbyPlayerLeaveGame(username);
    this.game.discordHelper.updateLobbyChannel();
  }

  public forceLeaveGame(username: string) {
    this.leaveGame(username);

    wsBroadcast({
      action: GameAction.ChatUserLeaveGame,
      username,
    });

    wsSendToSocket(username, {
      action: GameAction.GameQuit,
    });
  }

  // check if an account is in game
  public hasJoinedGame(username: string): boolean {
    if (this.game.playerManager.getPlayerByUsername(username)) {
      return true;
    } else {
      return false;
    }
  }

  // set the number of online discord users with "Online In Lobby"
  public setDiscordOnlineCount(count: number) {
    const oldCount = lobbyDiscordUserCount();
    lobbyDiscordUserCountSet(count);

    if (count !== oldCount) {
      wsBroadcast({
        type: GameServerResponse.UserCountUpdate,
        count,
      });
    }
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

  public updateAccount(account: IAccount): void {
    wsSendToSocket(account.username, {
      action: GameAction.SetAccount,
      account: this.game.db.prepareForTransmission(account),
    });
  }

  public isConnectedGm(username: string) {
    if (username === '★System') return true;
    const account = lobbyGetAccount(username);
    if (!account) return false;
    return account.isGameMaster;
  }
}
