
import { get, size } from 'lodash';

import { BaseService, IGround, IGroundItem, ISimpleItem, ItemClass } from '../../interfaces';

export class GroundManager extends BaseService {

  private ground: Record<string, IGround> = {};
  private saveableGround: Record<string, IGround> = {};

  // load ground, start ground game loop for saving
  public async init() {
    this.loadGround();
    this.groundLoop();
  }

  public async loadGround() {

  }

  public async saveGround() {

  }

  public groundLoop() {

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

    const groundItem: IGroundItem = {
      item,
      count: 1,

      // if the item has an owner, it expires in 24h. else, 3h.
      expiresAt: Date.now() + (1000 * (item.mods.owner ? 86400 : 10800))
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

    // find a ground item with the specified uuid
    const gItem = mapGround[x][y][itemClass].find(i => i.item.uuid === uuid);
    if (!gItem) return;

    // make sure we don't remove too much
    const maxStackSize = Math.min(gItem.count, count);
    gItem.count -= maxStackSize;

    // if the ground item gets to a count of 0, to the axe with it
    if (gItem.count <= 0) mapGround[x][y][itemClass] = mapGround[x][y][itemClass].filter(i => i.item.uuid !== uuid);

  }

}
