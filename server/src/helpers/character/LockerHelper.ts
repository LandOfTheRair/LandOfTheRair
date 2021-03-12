
import { Injectable } from 'injection-js';
import { sortBy } from 'lodash';

import { GameAction, IItemContainer, IPlayer } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

import * as materialData from '../../../content/_output/materialstorage.json';
import { Player } from '../../models';

@Injectable()
export class LockerHelper extends BaseService {

  public init() {}

  public openLocker(player: IPlayer, lockerName: string, regionId: string) {

    this.ensureLockerExists(player, lockerName, regionId);

    const lockers: any[] = [];

    Object.keys(player.accountLockers?.lockers ?? {}).forEach(lockerRegion => {
      Object.keys(player.accountLockers?.lockers?.[regionId] || {}).forEach(lockerId => {
        lockers.push({ regionId: lockerRegion, lockerId });
      });
    });

    Object.keys(player.lockers?.lockers ?? {}).forEach(lockerRegion => {
      Object.keys(player.lockers?.lockers?.[lockerRegion] || {}).forEach(lockerId => {
        lockers.push({ regionId: lockerRegion, lockerId });
      });
    });

    const showLockers = sortBy(
      lockers.filter(x => x.regionId === regionId || x.regionId === 'shared'),
      'lockerId'
    );

    showLockers.unshift(({ regionId: 'shared', lockerId: 'Materials' }));

    this.game.transmissionHelper.patchPlayer(player as Player);

    this.game.wsCmdHandler.sendToSocket(player.username, {
      action: GameAction.LockerActionShow,
      lockerName,
      regionId,
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
    const [w, region, locker] = lockerString.split(':');
    return player.lockers.lockers[region]?.[locker];
  }

  private ensureLockerExists(player: IPlayer, lockerName: string, regionId: string): void {
    if (!player.lockers.lockers) player.lockers.lockers = {};
    if (!player.lockers.lockers[regionId]) player.lockers.lockers[regionId] = {};
    if (!player.lockers.lockers[regionId][lockerName]) player.lockers.lockers[regionId][lockerName] = { items: [] };
  }

}
