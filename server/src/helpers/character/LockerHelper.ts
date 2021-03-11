
import { Injectable } from 'injection-js';
import { GameAction, IItemContainer, IPlayer } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

import * as materialData from '../../../content/_output/materialstorage.json';

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

  public getMaterialRef(itemName: string): string | undefined {
    return Object.keys(materialData.slots).find(x => materialData.slots[x].items.includes(itemName));
  }

  public getMaterialData(material: string) {
    return materialData.slots[material];
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
