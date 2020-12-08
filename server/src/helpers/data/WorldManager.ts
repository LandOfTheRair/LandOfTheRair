
import { Injectable } from 'injection-js';

import fs from 'fs-extra';
import { zipObject } from 'lodash';
import path from 'path';
import readdir from 'recursive-readdir';

import { ICharacter, ObjectType } from '../../interfaces';
import { InstancedWorldMap, MapState, Player, WorldMap } from '../../models';
import { BaseService } from '../../models/BaseService';

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

  // the mapping of every npc/player by their uuid for lookup
  private characterUUIDHash: Record<string, ICharacter> = {};

  public get currentlyActiveMaps(): string[] {
    return [...this.activeMaps];
  }

  public get currentlyActiveMapHash(): Record<string, any> {
    return zipObject([...this.activeMaps], Array(this.activeMaps.size).fill(true));
  }

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

  // if a player logs into a closed door, send them to the respawn point
  public checkPlayerForDoorsBeforeJoiningGame(player: Player): void {
    const { x, y } = player;

    const { map, state } = this.getMap(player.map);
    const door = map.getInteractableOfTypeAt(x, y, ObjectType.Door);

    if (door && !state.isDoorOpen(door.id)) {
      player.x = map.respawnPoint.x;
      player.y = map.respawnPoint.y;
      player.map = map.respawnPoint.map;
    }
  }

  public joinMap(player: Player) {
    this.leaveMap(player);

    const mapName = player.map;

    this.playersInMaps[player.name] = mapName;
    this.mapPlayerCounts[mapName] = this.mapPlayerCounts[mapName] || 0;
    this.mapPlayerCounts[mapName]++;

    this.activeMaps.add(mapName);

    this.addCharacter(player);
    this.mapStates[mapName].addPlayer(player);

    this.game.logger.log(`Map:Join`, `${player.name} joining map ${mapName} (${this.mapPlayerCounts[mapName]} players).`);

    // TODO: join instanced map
  }

  public leaveMap(player: Player) {
    const oldMap = this.playersInMaps[player.name];
    if (!oldMap) return;

    if (oldMap === 'Tutorial') {
      player.respawnPoint = { map: 'Rylt', x: 68, y: 13 };
    }

    // dead people leaving get auto-respawned
    if (this.game.characterHelper.isDead(player)) {
      player.isBeingForciblyRespawned = true;
      this.game.deathHelper.restore(player);
      player.isBeingForciblyRespawned = false;
    }

    delete this.playersInMaps[player.name];

    this.mapPlayerCounts[oldMap] = this.mapPlayerCounts[oldMap] || 0;
    this.mapPlayerCounts[oldMap] = Math.max(this.mapPlayerCounts[oldMap] - 1, 0);
    if (this.mapPlayerCounts[oldMap] <= 0) {
      this.activeMaps.delete(oldMap);
    }

    this.removeCharacter(player);
    this.mapStates[oldMap].removePlayer(player);

    if (this.mapPlayerCounts[oldMap] === 0) {
      this.game.groundManager.saveSingleGround(oldMap);
    }

    this.game.logger.log(`Map:Leave`, `${player.name} leaving map ${oldMap} (${this.mapPlayerCounts[oldMap]} players).`);
  }

  public steadyTick(timer) {
    this.activeMaps.forEach(activeMap => {
      const state = this.mapStates[activeMap];
      if (!state) {
        this.game.logger.error('WorldManager:MapTick', new Error(`Map ${activeMap} does not have state.`));
        return;
      }

      timer.startTimer(`map-${activeMap}`);
      state.steadyTick();
      timer.stopTimer(`map-${activeMap}`);
    });
  }

  public npcTick(timer) {
    this.activeMaps.forEach(activeMap => {
      const state = this.mapStates[activeMap];
      if (!state) {
        this.game.logger.error('WorldManager:MapTick', new Error(`Map ${activeMap} does not have state.`));
        return;
      }

      timer.startTimer(`npc-${activeMap}`);
      state.npcTick();
      timer.stopTimer(`npc-${activeMap}`);
    });
  }

  public addCharacter(char: ICharacter): void {
    this.characterUUIDHash[char.uuid] = char;
  }

  public removeCharacter(char: ICharacter): void {
    delete this.characterUUIDHash[char.uuid];
  }

  public getCharacter(uuid: string): ICharacter {
    return this.characterUUIDHash[uuid];
  }

}
