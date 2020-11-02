
import { Injectable } from 'injection-js';

import fs from 'fs-extra';
import path from 'path';
import readdir from 'recursive-readdir';

import { BaseService, ICharacter } from '../../interfaces';
import { InstancedWorldMap, MapState, Player, WorldMap } from '../../models';

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

  // the maps players are currently located in
  private playersInMaps: { [playerName: string]: string } = {};

  // the state for each map
  private mapStates: { [mapName: string]: MapState } = {};

  // the list of active maps to run ticks on
  private activeMaps: Set<string> = new Set<string>();

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

      this.createMap(name, map);
      this.mapNames.push(name);
    });

  }

  private createMap(mapName: string, mapJson: any) {
    this.maps[mapName] = new WorldMap(this.game, mapName, mapJson);
    this.mapStates[mapName] = new MapState(this.game, this.maps[mapName]);
  }

  public getMap(mapName: string): { map: WorldMap, state: MapState } {
    return {
      map: this.instances[mapName] || this.maps[mapName],
      state: this.mapStates[mapName]
    };
  }

  public getMapStateForCharacter(character: ICharacter): MapState {
    return this.mapStates[character.map];
  }

  public joinMap(player: Player) {
    this.leaveMap(player);

    const mapName = player.map;

    this.playersInMaps[player.name] = mapName;
    this.mapPlayerCounts[mapName] = this.mapPlayerCounts[mapName] || 0;
    this.mapPlayerCounts[mapName]++;

    this.activeMaps.add(mapName);

    this.mapStates[mapName].addPlayer(player);

    this.game.logger.log(`Map:Join`, `${player.name} joining map ${mapName} (${this.mapPlayerCounts[mapName]} players).`);

    // TODO: join instanced map
  }

  public leaveMap(player: Player) {
    const oldMap = this.playersInMaps[player.name];
    if (!oldMap) return;

    delete this.playersInMaps[player.name];

    this.mapPlayerCounts[oldMap] = this.mapPlayerCounts[oldMap] || 0;
    this.mapPlayerCounts[oldMap] = Math.max(this.mapPlayerCounts[oldMap] - 1, 0);
    if (this.mapPlayerCounts[oldMap] <= 0) {
      this.activeMaps.delete(oldMap);
    }

    this.mapStates[oldMap].removePlayer(player);

    this.game.logger.log(`Map:Leave`, `${player.name} leaving map ${oldMap} (${this.mapPlayerCounts[oldMap]} players).`);
  }

  public steadyTick() {
    this.activeMaps.forEach(activeMap => {
      const state = this.mapStates[activeMap];
      if (!state) {
        this.game.logger.error('WorldManager:MapTick', new Error(`Map ${activeMap} does not have state.`));
        return;
      }

      state.steadyTick();
    });
  }

  public npcTick() {
    this.activeMaps.forEach(activeMap => {
      const state = this.mapStates[activeMap];
      if (!state) {
        this.game.logger.error('WorldManager:MapTick', new Error(`Map ${activeMap} does not have state.`));
        return;
      }

      state.npcTick();
    });
  }

}
