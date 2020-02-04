
import { Injectable } from 'injection-js';

import { generate, observe, Observer, unobserve } from 'fast-json-patch';

import { BaseService, GameAction, IPlayer } from '../../interfaces';
import { Player } from '../../models';

@Injectable()
export class TransmissionHelper extends BaseService {

  private playerPatchWatchers: { [key: string]: Observer<Player> } = {};

  public async init() {}

  public startWatching(player: Player) {
    this.playerPatchWatchers[player.username] = observe(player);
  }

  public stopWatching(player: Player) {
    unobserve(player, this.playerPatchWatchers[player.username]);
    delete this.playerPatchWatchers[player.username];
  }

  // if we don't do this, it eats random properties when it does JSON.stringify(). dunno how, but whatever.
  public convertPlayerForTransmission(player: Player): IPlayer {
    return Object.assign({}, this.game.db.wrap<Player>(player) as IPlayer);
  }

  public patchPlayer(player: Player) {
    this.sendActionToAccount(player.username, GameAction.GamePatchPlayer, { patches: generate(this.playerPatchWatchers[player.username]) });
  }

  public sendDataToAccount(username: string, data: any): void {
    this.game.wsCmdHandler.sendToSocket(username, data);
  }

  public sendActionToAccount(username: string, action: GameAction, data: any): void {
    this.game.wsCmdHandler.sendToSocket(username, { action, ...data });
  }

}
