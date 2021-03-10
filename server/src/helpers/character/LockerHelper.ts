
import { Injectable } from 'injection-js';
import { GameAction, IItemContainer, IPlayer } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class LockerHelper extends BaseService {

  public init() {}

  public openLocker(player: IPlayer, lockerName: string, regionId: string) {

    this.ensureLockerExists(player, lockerName, regionId);

    this.game.wsCmdHandler.sendToSocket(player.username, {
      action: GameAction.LockerActionShow,
      lockerName,
      regionId
    });
  }

  public hasLockerFromString(player: IPlayer, lockerString: string): boolean {
    return !!this.getLockerFromString(player, lockerString);
  }

  public getLockerFromString(player: IPlayer, lockerString: string): IItemContainer {
    const [w, region, locker] = lockerString.split(':');
    return player.lockers.lockers[region]?.[locker];
  }

  private ensureLockerExists(player: IPlayer, lockerName: string, regionId: string): void {
    if (!player.lockers.lockers) player.lockers.lockers = {};
    if (!player.lockers.lockers[regionId]) player.lockers.lockers[regionId] = {};
    if (!player.lockers.lockers[regionId][lockerName]) player.lockers.lockers[regionId][lockerName] = { items: [] };
  }

}
