
import { Injectable } from 'injection-js';

import { generate, observe, Observer, unobserve } from 'fast-json-patch';

import { BaseService, GameAction, IPlayer } from '../../interfaces';
import { Player, PlayerState } from '../../models';

interface PlayerPatch {
  patches?: any[];
  player?: Partial<IPlayer>;
}

@Injectable()
export class TransmissionHelper extends BaseService {

  private playerPatchWatchers: { [key: string]: Observer<Player> } = {};
  private playerStateWatchers: { [key: string]: Observer<PlayerState> } = {};
  private playerPatchQueue: { [key: string]: { patches: any[], player: Partial<IPlayer> } } = {};

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

  // convert a player object for being sent to the client
  // if we don't do this, it eats random properties when it does JSON.stringify(). dunno how, but whatever.
  public convertPlayerForTransmission(player: Player): IPlayer {
    return Object.assign({}, this.game.db.wrap<Player>(player) as IPlayer);
  }

  // auto patch a player. just calls patch player for now
  public tryAutoPatchPlayer(player: Player) {
    this.patchPlayer(player);
    this.patchPlayerState(player);
  }

  // queue data to be sent to a player during their next patch
  public queuePlayerPatch(player: Player, patch: PlayerPatch) {
    if (patch.patches) {
      this.playerPatchQueue[player.username].patches.push(...patch.patches);
    }

    if (patch.player) {
      this.playerPatchQueue[player.username].player = Object.assign({}, this.playerPatchQueue[player.username].player, patch.player);
    }
  }

  // generate and queue player object patches
  public generateAndQueuePlayerPatches(player: Player) {
    const patches = generate(this.playerPatchWatchers[player.username]);
    this.queuePlayerPatch(player, { patches });
  }

  // send a patch to a player regarding their player state
  public patchPlayerState(player: Player) {
    const patches = generate(this.playerStateWatchers[player.username]);
    if (patches.length === 0) return;

    this.sendActionToAccount(player.username, GameAction.GamePatchPlayer, { statePatches: patches });
  }

  // send patches to a player about themselves
  public patchPlayer(player: Player) {
    const patchData = this.playerPatchQueue[player.username];
    if (patchData.patches.length === 0 || Object.keys(patchData.player).length === 0) return;

    this.sendPlayerPatches(player, patchData);
    patchData.player = {};
    patchData.patches = [];
  }

  // specific helper to send patches to a player
  public sendPlayerPatches(player: Player, patchData: PlayerPatch = {}): void {
    this.sendActionToAccount(player.username, GameAction.GamePatchPlayer, patchData);
  }

  // send generic data to an account. probably not too useful.
  public sendDataToAccount(username: string, data: any): void {
    this.game.wsCmdHandler.sendToSocket(username, data);
  }

  // send an action to an account. very useful.
  public sendActionToAccount(username: string, action: GameAction, data: any): void {
    this.game.wsCmdHandler.sendToSocket(username, { action, ...data });
  }

}
