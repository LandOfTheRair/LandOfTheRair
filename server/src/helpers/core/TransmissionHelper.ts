import { Injectable } from 'injection-js';

import {
  generate,
  observe,
  Observer,
  Operation,
  unobserve,
} from 'fast-json-patch';

import { GameAction, GameServerResponse, IPlayer } from '../../interfaces';
import { Player, PlayerState } from '../../models';
import { BaseService } from '../../models/BaseService';
import {
  modifyPlayerPatch,
  shouldSendPatch,
  shouldSendPlayerPatch,
} from './PatchModifiers';

export interface PlayerPatchSet {
  patches?: Operation[];
  player?: Partial<IPlayer>;
}

@Injectable()
export class TransmissionHelper extends BaseService {
  private playerPatchWatchers: Record<string, Observer<Player>> = {};
  private playerStateWatchers: Record<string, Observer<PlayerState>> = {};
  private playerPatchQueue: Record<
    string,
    { patches: Operation[]; player: Partial<IPlayer> }
  > = {};

  public async init() {}

  // set up a watcher for player changes
  public startWatching(player: Player, state: PlayerState) {
    this.playerPatchWatchers[player.username] = observe(player);
    this.playerStateWatchers[player.username] = observe(state);
    this.playerPatchQueue[player.username] = { patches: [], player: {} };
  }

  // stop watching a players changes
  public stopWatching(player: Player) {
    unobserve(player, this.playerPatchWatchers[player.username]);
    delete this.playerPatchWatchers[player.username];
    delete this.playerPatchQueue[player.username];
  }

  // auto patch a player. just calls patch player for now
  public tryAutoPatchPlayer(player: Player) {
    this.patchPlayer(player);
    this.patchPlayerState(player);
  }

  // queue data to be sent to a player during their next patch
  public queuePlayerPatch(player: Player, patch: PlayerPatchSet) {
    if (patch.patches) {
      this.playerPatchQueue[player.username].patches.push(
        ...patch.patches.filter((p) => shouldSendPatch(p)),
      );
    }

    if (patch.player) {
      this.playerPatchQueue[player.username].player = Object.assign(
        {},
        this.playerPatchQueue[player.username].player,
        patch.player,
      );
    }
  }

  public generateQueueSendPlayerPatches(player: Player) {
    this.generateAndQueuePlayerPatches(player);
    this.patchPlayer(player);
  }

  // generate and queue player object patches
  public generateAndQueuePlayerPatches(player: Player) {
    if (!this.playerPatchWatchers[player.username]) return;

    // we twiddle the fov here because it creates a bunch of unnecessary patches
    // hell yeah micro optimizations
    // const fov = player.fov;
    // delete (player as any).fov;

    const patches = generate(this.playerPatchWatchers[player.username]);

    // reset the fov because we do still need it
    // player.fov = fov;
    this.queuePlayerPatch(player, { patches });
  }

  // send a patch to a player regarding their player state
  public patchPlayerState(player: Player) {
    const patches = generate(this.playerStateWatchers[player.username])
      .filter((p) => shouldSendPlayerPatch(p))
      .map((p) => modifyPlayerPatch(p));
    if (patches.length === 0) return;

    this.sendActionToAccount(player.username, GameAction.GamePatchPlayerState, {
      statePatches: patches,
    });
  }

  // send a specific patch for player FOV
  public sendFOVPatch(player: Player) {
    this.sendActionToAccount(player.username, GameAction.GamePatchPlayer, {
      player: { fov: player.fov },
    });
  }

  // send a specific patch for player movement
  public sendMovementPatch(player: Player, blankFOV = false) {
    const fov = blankFOV ? {} : player.fov;
    if (blankFOV) {
      for (let x = -4; x <= 4; x++) {
        fov[x] = fov[x] || {};
        for (let y = -4; y <= 4; y++) {
          fov[x][y] = false;
        }
      }
    }

    this.sendActionToAccount(player.username, GameAction.GamePatchPlayer, {
      player: { fov: player.fov, x: player.x, y: player.y, dir: player.dir },
    });
  }

  // send patches to a player about themselves
  public patchPlayer(player: Player) {
    const patchData = this.playerPatchQueue[player.username];
    if (
      patchData.patches.length === 0 &&
      Object.keys(patchData.player).length === 0
    ) {
      return;
    }

    this.sendPlayerPatches(player, patchData);
    patchData.player = {};
    patchData.patches = [];
  }

  // specific helper to send patches to a player
  public sendPlayerPatches(
    player: Player,
    patchData: PlayerPatchSet = {},
  ): void {
    this.sendActionToAccount(
      player.username,
      GameAction.GamePatchPlayer,
      patchData,
    );
  }

  // send generic data to an account. probably not too useful.
  public sendDataToAccount(username: string, data: any): void {
    if (!username) return;

    this.game.wsCmdHandler.sendToSocket(username, data);
  }

  // send an action to a player. also very useful
  public sendActionToPlayer(
    player: Player,
    action: GameAction,
    data = {},
  ): void {
    this.sendActionToAccount(player.username, action, data);
  }

  // send an action to an account. very useful.
  public sendActionToAccount(
    username: string,
    action: GameAction,
    data: any,
  ): void {
    if (!username) return;

    this.game.wsCmdHandler.sendToSocket(username, { action, ...data });
  }

  // send a response to an account. very useful.
  public sendResponseToPlayer(
    player: IPlayer,
    type: GameServerResponse,
    data: any,
  ): void {
    this.sendResponseToAccount(player.username, type, data);
  }

  // send a response to an account. very useful.
  public sendResponseToAccount(
    username: string,
    type: GameServerResponse,
    data: any,
  ): void {
    if (!username) return;

    this.game.wsCmdHandler.sendToSocket(username, { type, ...data });
  }
}
