import { Injectable } from 'injection-js';

import { coreMaterialStorage } from '@lotr/content';
import { wsSendToSocket } from '@lotr/core';
import type { IItemContainer, IPlayer } from '@lotr/interfaces';
import { GameAction } from '@lotr/interfaces';
import { premiumHasSharedLocker } from '@lotr/premium';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class LockerHelper extends BaseService {
  public init() {}

  public openLocker(player: IPlayer, lockerName: string) {
    this.ensureLockerExists(player, lockerName);

    const lockers: any[] = [];

    Object.keys(player.lockers?.lockers ?? {}).forEach((checkLockerId) => {
      if (checkLockerId.includes(' ')) {
        delete player.lockers.lockers[checkLockerId];
        return;
      }

      lockers.push(checkLockerId);
    });

    const showLockers = lockers.slice().sort();

    if (premiumHasSharedLocker(player)) {
      Object.keys(player.accountLockers?.lockers ?? {}).forEach(
        (checkLockerId) => {
          showLockers.unshift(checkLockerId);
        },
      );
    }

    showLockers.unshift('Materials');

    wsSendToSocket(player.username, {
      action: GameAction.LockerActionShow,
      lockerName,
      showLockers,
      playerLockers: player.lockers.lockers,
      accountLockers: player.accountLockers.lockers,
    });
  }

  public getMaterialRef(itemName: string): string | undefined {
    const materialData = coreMaterialStorage();
    return Object.keys(materialData.slots).find((x) =>
      materialData.slots[x].items.includes(itemName),
    );
  }

  public getMaterialData(material: string) {
    const materialData = coreMaterialStorage();
    return materialData.slots[material];
  }

  public hasLockerFromString(player: IPlayer, lockerString: string): boolean {
    return !!this.getLockerFromString(player, lockerString);
  }

  public getLockerFromString(
    player: IPlayer,
    lockerString: string,
  ): IItemContainer {
    const [w, locker] = lockerString.split(':');
    if (locker.includes('Shared')) {
      return player.accountLockers.lockers?.[locker];
    }
    return player.lockers.lockers?.[locker];
  }

  private ensureLockerExists(player: IPlayer, lockerId: string): void {
    if (lockerId.includes('Shared')) {
      throw new Error('Trying to ensure a shared locker exists');
    }

    if (!player.lockers.lockers) player.lockers.lockers = {};
    if (!player.lockers.lockers[lockerId]) {
      player.lockers.lockers[lockerId] = { items: [] };
    }
  }
}
