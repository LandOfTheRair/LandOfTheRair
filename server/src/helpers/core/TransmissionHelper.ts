
import { Injectable } from 'injection-js';

import { BaseService, GameAction, IPlayer } from '../../interfaces';
import { Player } from '../../models';

@Injectable()
export class TransmissionHelper extends BaseService {

  public async init() {}

  // if we don't do this, it eats random properties when it does JSON.stringify(). dunno how, but whatever.
  public convertPlayerForTransmission(player: Player): IPlayer {
    return Object.assign({}, this.game.db.wrap<Player>(player) as IPlayer);
  }

  public patchPlayer(player: Player) {
    this.sendActionToAccount(player.username, GameAction.GamePatchPlayer, { player: this.convertPlayerForTransmission(player) });
  }

  public sendDataToAccount(username: string, data: any): void {
    this.game.wsCmdHandler.sendToSocket(username, data);
  }

  public sendActionToAccount(username: string, action: GameAction, data: any): void {
    this.game.wsCmdHandler.sendToSocket(username, { action, ...data });
  }

}
