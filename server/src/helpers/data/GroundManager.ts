
import { Injectable } from 'injection-js';
import { cloneDeep, get, setWith, isEqual, updateWith } from 'lodash';
import { ObjectId } from 'mongodb';

import { IGround, IGroundItem, ISerializableSpawner, ISimpleItem, ItemClass } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { Ground } from '../../models/orm/Ground';

@Injectable()
export class GroundManager extends BaseService {

  private saveTicks = 150;      // save the ground every 5 minutes
  private expireTicks = 1800;   // expire the ground every 30 minutes
  private currentTick = 0;

  private groundEntities: Record<string, Ground> = {};

  private ground: Record<string, IGround> = {};
  private saveableGround: Record<string, IGround> = {};
  private loadedSpawners: Record<string, ISerializableSpawner[]> = {};

  // load ground
  public async init() {
    await this.loadGround();

    const { saveTicks, expireTicks } = this.game.contentManager.getGameSetting('ground');
    this.saveTicks = saveTicks ?? 150;
    this.expireTicks = expireTicks ?? 1800;
  }

  // create new entities where necessary
  public initGroundForMap(map: string, partyName?: string) {
    if (this.groundEntities[map]) return;

    this.groundEntities[map] = new Ground();
    this.groundEntities[map]._id = new ObjectId();
    this.groundEntities[map].treasureChests = {};

    if (partyName) {
      this.groundEntities[map].partyName = partyName;
    }
  }

  public async removeGroundsForParties(partyName: string): Promise<void> {

    await this.game.groundDB.removeAllGroundsByParty(partyName);

    Object.keys(this.groundEntities).forEach(groundName => {
      if (this.groundEntities[groundName].partyName !== partyName) return;

      delete this.groundEntities[groundName];
      delete this.saveableGround[groundName];
      delete this.ground[groundName];
      delete this.loadedSpawners[groundName];
    });
  }

  public isChestLooted(map: string, chestName: string): boolean {
    return this.groundEntities[map].treasureChests?.[chestName];
  }

  public lootChest(map: string, chestName: string) {
    this.groundEntities[map].treasureChests[chestName] = true;
  }

  // load the ground from the db and sort it out
  public async loadGround() {
    const grounds = await this.game.groundDB.loadAllGrounds();
    grounds.forEach(groundEntity => {

      if (groundEntity.savedAt) return;

      // instances older than 24h will not be loaded on next reboot
      if (this.game.worldManager.isDungeon(groundEntity.map) && Date.now() > groundEntity.savedAt + (3600 * 1000 * 24)) {
        return;
      }

      // if it has a time it was saved, boost it on next reboot
      if (groundEntity.savedAt) {
        this.boostSpawnersInMapBasedOnTimestamp(groundEntity.map, groundEntity.savedAt, groundEntity);
      }

      this.groundEntities[groundEntity.map] = new Ground();
      this.groundEntities[groundEntity.map]._id = groundEntity._id;
      this.groundEntities[groundEntity.map].partyName = groundEntity.partyName;
      this.groundEntities[groundEntity.map].treasureChests = groundEntity.treasureChests || {};
      this.saveableGround[groundEntity.map] = cloneDeep(groundEntity.ground);
      this.ground[groundEntity.map] = cloneDeep(groundEntity.ground);
      this.loadedSpawners[groundEntity.map] = cloneDeep(groundEntity.spawners);
    });
  }

  // save a single ground area
  public async saveSingleGround(mapName: string) {
    const save = this.getSaveGround(mapName);
    return this.game.groundDB.saveSingleGround(save);
  }

  public async saveAllGround(): Promise<any> {
    const maps = Object.keys(this.groundEntities);
    if (maps.length === 0) return;

    return this.saveGround(maps);
  }

  private async saveGround(maps?: string[]): Promise<any> {
    if (!maps || maps.length === 0) return;

    const allSaves = maps.map(map => this.getSaveGround(map));
    return this.game.groundDB.saveAllGrounds(allSaves);
  }

  private getSaveGround(mapName: string): Ground {
    const entity = this.groundEntities[mapName];
    entity.map = mapName;
    entity.ground = this.saveableGround[mapName] || {};
    entity.spawners = this.collectSpawners(mapName) || [];
    return entity;
  }

  public boostSpawnersInMapBasedOnTimestamp(map: string, inactiveSince: number, groundEntity?: Ground): void {
    if (!inactiveSince) return;

    const now = Date.now();
    const tickIncrease = Math.floor((now - inactiveSince) / 1000);

    // if we pass an entity, it has not been loaded yet
    if (groundEntity) {
      groundEntity.spawners?.forEach(spawner => {
        spawner.currentTick = spawner.currentTick ?? 0;
        spawner.currentTick += tickIncrease;
      });
    }

    // if we do not pass an entity, it has been loaded
    if (!groundEntity) {
      const mapData = this.game.worldManager.getMap(map);
      if (mapData?.state) {
        mapData.state.allSpawners.forEach(spawner => {
          if (spawner.areAnyNPCsAlive || !spawner.areCreaturesDangerous) return;

          spawner.increaseTick(tickIncrease);
        });
      }
    }
  }

  tick(timer) {
    const now = Date.now();

    timer.startTimer(`ground-${now}`);

    this.currentTick++;
    if ((this.currentTick % this.saveTicks) === 0) {

      // save only the maps that are running - others are saved when they're emptied
      this.saveGround(this.game.worldManager.currentlyActiveMaps);
    }

    // expire the ground every so often
    if ((this.currentTick % this.expireTicks) === 0) {
      timer.startTimer(`groundexpire-${now}`);
      this.checkGroundExpire(this.game.worldManager.currentlyActiveMaps);
      timer.stopTimer(`groundexpire-${now}`);
    }

    timer.stopTimer(`ground-${now}`);
  }

  public getMapSpawners(mapName: string): ISerializableSpawner[] {
    return this.loadedSpawners[mapName] || [];
  }

  // get all serializable spawners for a map for their current state
  private collectSpawners(mapName: string): ISerializableSpawner[] {
    const state = this.game.worldManager.getMap(mapName)?.state;
    if (!state) return [];

    return state.getSerializableSpawners() ?? [];
  }

  public getGroundAround(mapName: string, x: number, y: number, radius = 4): IGround {
    const baseGround = this.getGround(mapName);

    const ground: IGround = {};

    for (let xx = x - radius; xx <= x + radius; xx++) {
      for (let yy = y - radius; yy <= y + radius; yy++) {
        const atCoord = get(baseGround, [xx, yy], {});
        if (Object.keys(atCoord).length !== 0) {
          setWith(ground, [xx, yy], atCoord, Object);
        }
      }
    }

    return ground;
  }

  private getGround(mapName: string): IGround {
    return this.ground[mapName];
  }

  public addItemToGround(mapName: string, x: number, y: number, item: ISimpleItem, forceSave?: boolean): void {
    const { itemClass: itemItemClass, sprite } = this.game.itemHelper.getItemProperties(item, ['itemClass', 'sprite']);

    const itemClass = itemItemClass ?? ItemClass.Box;

    // bad items can't get put on the ground
    if (sprite === -1) return;

    // corpses get a lil special treatment
    if (itemClass === ItemClass.Corpse) {
      this.game.corpseManager.addCorpse(mapName, item, x, y);
    }

    updateWith(this.ground, [mapName, x, y, itemClass], (old) => old ?? [], Object);
    const container = this.ground[mapName][x][y][itemClass];

    // if the item has an owner, it expires in 24h. else, 3h.
    const expiresAt = Date.now() + (1000 * ((item.mods.owner || forceSave) ? 86400 : 10800));

    const matchingItem = container.find((gItem: IGroundItem) => {
      if (gItem.item.name !== item.name) return false;
      if (itemClass !== ItemClass.Coin && !isEqual(item.mods, gItem.item.mods)) return false;
      return true;
    });

    if (matchingItem) {
      // if we have a coin, we add to the value, instead of count
      if (itemClass === ItemClass.Coin) {
        matchingItem.item.mods.value = (matchingItem.item.mods.value || 0) + (item.mods.value || 0);
      } else {
        matchingItem.count++;

        // reset expiresAt so a stack doesn't just go poof
        matchingItem.expiresAt = expiresAt;
      }
    } else {
      const groundItem: IGroundItem = {
        item,
        count: 1,
        expiresAt
      };

      container.push(groundItem);
      if (itemClass === ItemClass.Corpse) return;
      if (item.mods.owner || forceSave) {
        updateWith(this.saveableGround, [mapName, x, y, itemClass], (old) => (old ?? [groundItem]), Object);
      }
    }
  }

  public getEntireGround(mapName: string, x: number, y: number): Record<ItemClass, IGroundItem[]> {
    return get(this.ground, [mapName, x, y], {} as any);
  }

  public getItemsFromGround(mapName: string, x: number, y: number, itemClass: ItemClass, uuid = '', count = 1): IGroundItem[] {
    const ground = get(this.ground, [mapName, x, y], {}) as Record<ItemClass, IGroundItem[]>;
    if (!ground) return [];
    let potentialItems: IGroundItem[] = [];
    if (itemClass) {
      potentialItems = ground[itemClass] ?? [];
    } else {
      Object.keys(ground).forEach(itemClassKey => {
        (ground[itemClassKey] || []).forEach((item: IGroundItem) => {
          potentialItems.push(item);
        });
      });
    }
    // no uuid means grab the entire group
    if (!uuid) return potentialItems;

    const itemStack = potentialItems.find(i => i.item.uuid === uuid);
    if (!itemStack) return [];

    return [itemStack];
  }

  public getAllItemsFromGround(mapName: string): IGroundItem[] {
    const items: IGroundItem[] = [];
    Object.keys(this.ground[mapName] || {}).forEach(x => {
      Object.keys(this.ground[mapName][x] || {}).forEach(y => {
        Object.keys(this.ground[mapName][x][y] || {}).forEach(itemClass => {
          (this.ground[mapName][x][y][itemClass] || []).forEach((item: IGroundItem) => {
            items.push(item);
          });
        });
      });
    });
    return items;
  }

  public convertItemStackToList(item: IGroundItem, count = 1): ISimpleItem[] {
    return Array(count).fill(null).map(() => this.game.itemCreator.rerollItem(item.item));
  }

  public removeItemFromGround(mapName: string, x: number, y: number, itemClass: ItemClass, uuid: string, count = 1): void {
    this.removeItemFromSpecificGround(this.ground[mapName] || {}, x, y, itemClass, uuid, count);
    this.removeItemFromSpecificGround(this.saveableGround[mapName] || {}, x, y, itemClass, uuid, count);
  }

  private removeItemFromSpecificGround(ground: IGround, x: number, y: number, itemClass: ItemClass, uuid: string, count = 1): void {
    const groundItems = get(ground, [x, y, itemClass], []) as Array<IGroundItem>;

    // find a ground item with the specified uuid
    const groundItem = groundItems.find(i => i.item.uuid === uuid);
    if (!groundItem) return;

    // make sure we don't remove too much
    const maxStackSize = Math.min(groundItem.count, count);
    groundItem.count -= maxStackSize;

    // if the ground item gets to a count of 0, to the axe with it
    if (groundItem.count <= 0) {
      groundItems.splice(groundItems.indexOf(groundItem), 1);

      // clean up the save object so we don't send every possible combination everywhere
      if (groundItems.length === 0) delete ground[x][y][itemClass];
      if (Object.keys(ground[x][y]).length === 0) delete ground[x][y];
      if (Object.keys(ground[x]).length === 0) delete ground[x];
    }

    if (itemClass === ItemClass.Corpse) {
      this.game.corpseManager.removeCorpse(groundItem.item);
    }

  }

  // check these maps for expiration!
  private checkGroundExpire(maps: string[]): void {
    maps.forEach(map => {
      Object.keys(this.ground[map] || {}).forEach(x => {
        Object.keys(this.ground[map][x] || {}).forEach(y => {
          Object.keys(this.ground[map][x][y] || {}).forEach(itemClass => {
            (this.ground[map][x][y][itemClass] || []).forEach((item: IGroundItem) => {
              if (Date.now() < item.expiresAt) return;

              this.removeItemFromGround(map, +x, +y, itemClass as ItemClass, item.item.uuid, item.count);
            });
          });
        });
      });
    });
  }
}
