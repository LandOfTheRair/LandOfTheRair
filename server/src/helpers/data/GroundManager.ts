
import { cloneDeep, get, size } from 'lodash';

import { BaseService, IGround, IGroundItem, ISimpleItem, ItemClass } from '../../interfaces';
import { Ground } from '../../models/orm/Ground';

export class GroundManager extends BaseService {

  private readonly SAVE_TICKS = 150;      // save the ground every 5 minutes
  private readonly EXPIRE_TICKS = 1800;   // expire the ground every 30 minutes
  private currentTick = 0;

  private groundEntities: Record<string, Ground> = {};

  private ground: Record<string, IGround> = {};
  private saveableGround: Record<string, IGround> = {};

  // load ground
  public async init() {
    await this.loadGround();
  }

  // create new entities where necessary
  public initGroundForMap(map: string) {
    if (this.groundEntities[map]) return;

    this.groundEntities[map] = new Ground();
  }

  // load the ground from the db and sort it out
  public async loadGround() {
    const grounds = await this.game.groundDB.loadAllGrounds();
    grounds.forEach(groundEntity => {
      this.groundEntities[groundEntity.map] = new Ground();
      this.saveableGround[groundEntity.map] = cloneDeep(groundEntity.ground);
      this.ground[groundEntity.map] = cloneDeep(groundEntity.ground);
    });
  }

  // save a single ground area
  public async saveSingleGround(mapName: string) {
    const entity = this.groundEntities[mapName];
    entity.map = mapName;
    entity.ground = this.saveableGround[mapName] || {};
    return this.game.groundDB.saveSingleGround(entity);
  }

  // save a lot of ground at once
  public async saveGround(maps?: string[]) {
    if (maps?.length === 0) return;

    // if we don't pass any maps in, we get all of them saved by default
    if (!maps) maps = Object.keys(this.groundEntities);

    // map the entities to something we can save
    const allSaves = maps.map(map => {
      const entity = this.groundEntities[map];
      entity.map = map;
      entity.ground = this.saveableGround[map] || {};
      return entity;
    });

    this.game.groundDB.saveAllGrounds(allSaves);
  }

  tick(timer) {
    timer.startTimer(`Ground`);

    this.currentTick++;
    if ((this.currentTick % this.SAVE_TICKS) === 0) {

      // save only the maps that are running - others are saved when they're emptied
      this.saveGround(this.game.worldManager.currentlyActiveMaps);
    }

    // expire the ground every so often
    if ((this.currentTick % this.EXPIRE_TICKS) === 0) {
      timer.startTimer(`Ground Expire`);
      this.checkGroundExpire(this.game.worldManager.currentlyActiveMaps);
      timer.stopTimer(`Ground Expire`);
    }

    timer.stopTimer(`Ground`);
  }

  public getGround(mapName: string): IGround {
    return this.ground[mapName];
  }

  public addItemToGround(mapName: string, x: number, y: number, item: ISimpleItem): void {
    const itemClass = this.game.itemHelper.getItemProperty(item, 'itemClass');

    // init the ground here
    this.ground[mapName] = this.ground[mapName] || {};
    const mapGround = this.ground[mapName];

    mapGround[x] = mapGround[x] || {};
    mapGround[x][y] = mapGround[x][y] || {};
    mapGround[x][y][itemClass] = mapGround[x][y][itemClass] || [];

    // init the saveable ground here
    this.saveableGround[mapName] = this.saveableGround[mapName] || {};
    const saveableGround = this.saveableGround[mapName] || {};

    saveableGround[x] = saveableGround[x] || {};
    saveableGround[x][y] = saveableGround[x][y] || {};
    saveableGround[x][y][itemClass] = saveableGround[x][y][itemClass] || [];

    const isModified = size(item.mods) > 0;

    // if the item has an owner, it expires in 24h. else, 3h.
    const expiresAt = Date.now() + (1000 * (item.mods.owner ? 86400 : 10800));

    const groundItem: IGroundItem = {
      item,
      count: 1,
      expiresAt
    };

    // if this item has no modifications or we have a coin
    if (!isModified || itemClass === ItemClass.Coin) {
      let foundItem!: IGroundItem;

      // we look for a similar item
      mapGround[x][y][itemClass].forEach((gItem: IGroundItem) => {
        if (gItem.item.name !== item.name) return;

        const isGItemModified = size(gItem.item.mods) > 0;
        if (isGItemModified && itemClass !== ItemClass.Coin) return;

        foundItem = gItem;
      });

      // if we have an item, lets stack it
      if (foundItem) {

        // if we have a coin, we add values
        if (itemClass === ItemClass.Coin) {
          foundItem.item.mods.value = (foundItem.item.mods.value || 0) + (item.mods.value || 0);

        // if we have an unmodified, vanilla item we bump the count instead
        } else {
          foundItem.count++;

          // reset expiresAt so a stack doesn't just go poof
          foundItem.expiresAt = expiresAt;
        }

        // we don't push to saveable ground here because saveable items always are modified

      // no stack, we push
      } else {
        mapGround[x][y][itemClass].push(groundItem);

        if (item.mods.owner) {
          saveableGround[x][y][itemClass].push(groundItem);
        }
      }

    // item is modified
    } else {
      mapGround[x][y][itemClass].push(groundItem);

      if (item.mods.owner) {
        saveableGround[x][y][itemClass].push(groundItem);
      }
    }
  }

  public getItemsFromGround(mapName: string, x: number, y: number, itemClass: ItemClass, uuid = '', count = 1): IGroundItem[] {
    const potentialItems: IGroundItem[] = get(this.ground, [mapName, x, y, itemClass], []);

    // no uuid means grab the entire group
    if (!uuid) return potentialItems;

    const itemStack = potentialItems.find(i => i.item.uuid === uuid);
    if (!itemStack) return [];

    return [itemStack];
  }

  public convertItemStackToList(item: IGroundItem, count = 1): ISimpleItem[] {
    return Array(count).fill(null).map(() => this.game.itemCreator.rerollItem(item.item));
  }

  public removeItemFromGround(mapName: string, x: number, y: number, itemClass: ItemClass, uuid: string, count = 1): void {

    // re-initialize the map as needed
    const mapGround = this.ground[mapName] || {};
    mapGround[x] = mapGround[x] || {};
    mapGround[x][y] = mapGround[x][y] || {};
    mapGround[x][y][itemClass] = mapGround[x][y][itemClass] || [];

    // re-initialize the save ground as needed
    const saveGround = this.saveableGround[mapName] || {};
    saveGround[x] = saveGround[x] || {};
    saveGround[x][y] = saveGround[x][y] || {};
    saveGround[x][y][itemClass] = saveGround[x][y][itemClass] || [];

    // find a ground item with the specified uuid
    const gItem = mapGround[x][y][itemClass].find(i => i.item.uuid === uuid);
    if (!gItem) return;

    // make sure we don't remove too much
    const maxStackSize = Math.min(gItem.count, count);
    gItem.count -= maxStackSize;

    // if we have an sItem (saved item) we decrement count here, too, but I don't expect this will happen
    const sItem = mapGround[x][y][itemClass].find(i => i.item.uuid === uuid);
    if (sItem) {
      sItem.count -= maxStackSize;
    }

    // if the ground item gets to a count of 0, to the axe with it
    if (gItem.count <= 0) mapGround[x][y][itemClass] = mapGround[x][y][itemClass].filter(i => i.item.uuid !== uuid);

    // we also remove the sItem if possible
    if (sItem && sItem.count <= 0) {
      saveGround[x][y][itemClass] = saveGround[x][y][itemClass].filter(i => i.item.uuid !== uuid);

      // clean up the save object so we don't save every possible combination everywhere
      if (saveGround[x][y][itemClass].length === 0) delete saveGround[x][y][itemClass];
      if (size(saveGround[x][y]) === 0) delete saveGround[x][y];
      if (size(saveGround[x]) === 0) delete saveGround[x];
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
