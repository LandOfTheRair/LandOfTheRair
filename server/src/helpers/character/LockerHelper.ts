
import { Injectable } from 'injection-js';
import { sortBy } from 'lodash';

import { GameAction, IItemContainer, IPlayer } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

import * as materialData from '../../../content/_output/materialstorage.json';
import { Player } from '../../models';

@Injectable()
export class LockerHelper extends BaseService {

  public init() {}

  public openLocker(player: IPlayer, lockerName: string) {

    this.ensureLockerExists(player, lockerName);

    const lockers: any[] = [];

    Object.keys(player.accountLockers?.lockers ?? {}).forEach(checkLockerId => {
      lockers.push(checkLockerId);
    });

    Object.keys(player.lockers?.lockers ?? {}).forEach(checkLockerId => {
      lockers.push(checkLockerId);
    });

    const showLockers = lockers.slice().sort();

    showLockers.unshift('Materials');

    this.game.wsCmdHandler.sendToSocket(player.username, {
      action: GameAction.LockerActionShow,
      lockerName,
      showLockers,
      playerLockers: player.lockers.lockers
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
    const [w, locker] = lockerString.split(':');
    return player.lockers.lockers?.[locker];
  }

  private ensureLockerExists(player: IPlayer, lockerId: string): void {
    if (!player.lockers.lockers) player.lockers.lockers = {};
    if (!player.lockers.lockers[lockerId]) player.lockers.lockers[lockerId] = { items: [] };
  }

}
