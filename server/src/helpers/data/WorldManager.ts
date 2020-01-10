
import { Injectable } from 'injection-js';

import fs from 'fs-extra';
import path from 'path';
import readdir from 'recursive-readdir';

import { BaseService } from '../../interfaces';
import { InstancedWorldMap, WorldMap } from '../../models';

@Injectable()
export class WorldManager extends BaseService {

  // live maps
  private maps: { [mapName: string]: WorldMap } = {};
  private instances: { [mapName: string]: InstancedWorldMap } = {};

  // not live maps
  private instancedMapPrototypes: { [mapName: string]: any } = {};

  // a list of map names for easy iteration
  private mapNames: string[] = [];
  public get allMapNames(): string[] {
    return this.mapNames;
  }

  // the number of players in each map, semaphore to indicate if a map should activate or not
  private mapPlayerCounts: { [mapName: string]: number } = {};

  public async init() {

    const allMaps = await readdir('content/maps');

    const loadedMaps: Array<{ name: string, map: any }> = await Promise.all(
      allMaps.map(async x => ({ name: path.basename(x, '.json'), map: await fs.readJson(x) }))
    );

    loadedMaps.forEach(({ name, map }) => {
      if (name.includes('-Dungeon')) {
        this.instancedMapPrototypes[name] = map;
        return;
      }

      this.maps[name] = new WorldMap(map);
      this.mapNames.push(name);
    });

  }

  public getMap(mapName: string): WorldMap {
    return this.maps[mapName];
  }

  public joinMap() {
    // leave current map
    // join desired map
    // increment mapplayercounts
    // if map does not exist in maps, check if it is instanced. if so, create or join an instance
    //    if instance, push to activemapnames
  }

  public leaveMap() {
    // leave map
    // if mapplayercounts <= 0 or not exist, remove from active maps
  }

  // if a map is active, it should tick
  public isMapActive(mapName: string) {
    return this.mapPlayerCounts[mapName] > 0;
  }

}
