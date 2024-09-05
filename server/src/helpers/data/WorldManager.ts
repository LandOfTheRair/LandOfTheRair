import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';
import path from 'path';

import fs from 'fs-extra';
import { cloneDeep, zipObject } from 'lodash';
import readdir from 'recursive-readdir';

import { ICharacter, IMapScript, IPlayer, ObjectType } from '../../interfaces';
import { InstancedWorldMap, MapState, Player, WorldMap } from '../../models';
import { BaseService } from '../../models/BaseService';

import * as MapScripts from '../../models/world/mapscripts';

@Injectable()
export class WorldManager extends BaseService {
  // live maps
  private maps: Record<string, WorldMap> = {};
  private instances: Record<string, InstancedWorldMap> = {};
  private instanceNameToInstancePrototype: Record<string, string> = {};

  // not live maps
  private mapsInactiveSince: Record<string, number> = {};
  private instancedMapPrototypes: Record<string, any> = {};

  // a list of map names for easy iteration
  private mapNames: string[] = [];
  public get allMapNames(): string[] {
    return this.mapNames;
  }

  // a record of all map scripts
  private mapScripts: Record<string, IMapScript> = {};

  // the number of players in each map, semaphore to indicate if a map should activate or not
  private mapPlayerCounts: Record<string, number> = {};

  // the maps players are currently located in
  private playersInMaps: Record<string, string> = {};

  // the state for each map
  private mapStates: Record<string, MapState> = {};

  // the list of active maps to run ticks on
  private activeMaps: Set<string> = new Set<string>();

  // the mapping of every npc/player by their uuid for lookup
  private characterUUIDHash: Record<string, ICharacter> = {};

  private isLeavingMap: Record<string, boolean> = {};

  public get currentlyActiveMaps(): string[] {
    return [...this.activeMaps];
  }

  public get currentlyActiveMapHash(): Record<string, any> {
    return zipObject(
      [...this.activeMaps],
      Array(this.activeMaps.size).fill(true),
    );
  }

  public async init() {
    // load map scripts first
    Object.keys(MapScripts).forEach((mapScript) => {
      const scriptObj = new MapScripts[mapScript]();
      this.mapScripts[scriptObj.name] = scriptObj;
    });

    const timer = new LoggerTimer({
      isActive: !process.env.DISABLE_TIMERS,
      dumpThreshold: 500,
    });

    timer.startTimer('basemaps');
    const baseMaps = await readdir('content/maps');
    timer.stopTimer('basemaps');

    timer.startTimer('outputmaps');
    const outMaps = await readdir('content/_output/maps');
    timer.stopTimer('outputmaps');

    const allMaps = [...baseMaps, ...outMaps];

    timer.startTimer('readmaps');
    const loadedMaps: Array<{ name: string; map: any }> = await Promise.all(
      allMaps
        .filter((x) => !x.includes('generated'))
        .map(async (x) => ({
          name: path.basename(x, '.json'),
          map: await fs.readJson(x),
        })),
    );
    timer.stopTimer('readmaps');

    timer.startTimer('loadmaps');
    loadedMaps.forEach(({ name, map }) => {
      if (this.isDungeon(name)) {
        this.instancedMapPrototypes[name] = map;
        return;
      }

      this.mapsInactiveSince[name] = Date.now();
      timer.startTimer('createmap-' + name);
      this.createMap(name, map);
      timer.stopTimer('createmap-' + name);
      this.mapNames.push(name);

      if (map.properties.script && !this.mapScripts[map.properties.script]) {
        this.game.logger.error(
          'MapLoading',
          new Error(
            `Map ${name} references script ${map.properties.script} which does not exist!`,
          ),
        );
      }
    });
    timer.stopTimer('loadmaps');

    timer.dumpTimers();
  }

  public createOrReplaceMap(mapName: string, mapJson: any) {
    this.mapsInactiveSince[mapName] = Date.now();
    if (!this.mapNames.includes(mapName)) this.mapNames.push(mapName);

    delete this.maps[mapName];
    delete this.mapStates[mapName];

    this.createMap(mapName, mapJson);
  }

  private createMap(mapName: string, mapJson: any) {
    try {
      this.maps[mapName] = new WorldMap(this.game, mapName, mapJson);
      this.mapStates[mapName] = new MapState(this.game, this.maps[mapName]);
      this.handleMapSetup(this.maps[mapName], this.mapStates[mapName]);
    } catch (e) {
      this.game.logger.log('WorldManager', `Could not create map ${mapName}`);
    }
  }

  private createInstancedMap(mapName: string, mapJson: any, partyName: string) {
    this.instances[mapName] = new InstancedWorldMap(
      this.game,
      mapName,
      cloneDeep(mapJson),
      partyName,
    );
    this.mapStates[mapName] = new MapState(this.game, this.instances[mapName]);
    this.handleMapSetup(this.instances[mapName], this.mapStates[mapName]);
  }

  private cleanUpInstancedMap(mapName: string) {
    delete this.instances[mapName];
    delete this.mapStates[mapName];
    delete this.instanceNameToInstancePrototype[mapName];
  }

  private handleMapSetup(map: WorldMap, mapState: MapState) {
    if (!map.properties.script) return;

    this.mapScripts[map.properties.script].setup(this.game, map, mapState);
    this.mapScripts[map.properties.script].events(this.game, map, mapState);
  }

  public isAnyPlayerInPartyMap(partyName: string): boolean {
    return (
      Object.keys(this.mapPlayerCounts).filter(
        (x) => this.mapPlayerCounts[x] > 0 && x.includes(`(${partyName})`),
      ).length > 0
    );
  }

  public getDestinationMapName(player: IPlayer, mapName: string): string {
    if (this.isDungeon(mapName)) {
      return `${mapName} (${this.game.partyHelper.partyName(player)})`;
    }

    return mapName;
  }

  public getMapScript(map: string): IMapScript | undefined {
    return this.mapScripts[map];
  }

  public ensureMapExists(
    mapName: string,
    partyName: string,
    mapNameWithParty: string,
  ): void {
    if (mapName === mapNameWithParty) return;
    if (this.instances[mapNameWithParty]) return;

    this.createInstancedMap(
      mapNameWithParty,
      this.instancedMapPrototypes[mapName],
      partyName,
    );
    this.instanceNameToInstancePrototype[mapNameWithParty] = mapName;
  }

  public getMap(
    mapName: string,
  ): { map: WorldMap; state: MapState } | undefined {
    return {
      map: this.instances[mapName] || this.maps[mapName],
      state: this.mapStates[mapName],
    };
  }

  public isEtherForceMap(mapName: string): boolean {
    return this.game.contentManager.rngDungeonConfigData.dungeonConfigs
      .map((x) => x.name)
      .includes(mapName);
  }

  public isDungeon(mapName: string): boolean {
    return mapName.includes('-Dungeon');
  }

  public getMapStateAndXYForCharacterItemDrop(
    character: ICharacter,
    defaultX: number,
    defaultY: number,
  ): { state: MapState; x: number; y: number } {
    let state = this.mapStates[character.map];
    let x = defaultX;
    let y = defaultY;

    if (this.isDungeon(character.map)) {
      const newMap =
        this.instances[character.map].properties.gearDropMap ?? character.map;
      if (newMap !== character.map) {
        state = this.mapStates[newMap];
        x =
          this.instances[character.map].properties.gearDropX ??
          this.instances[newMap].respawnPoint.x;
        y =
          this.instances[character.map].properties.gearDropY ??
          this.instances[newMap].respawnPoint.y;
      }
    }

    // special case for non-dungeon, volatile maps (solokar, etc)
    const mapData = this.getMap(character.map);
    if (mapData?.map.properties.gearDropMap) {
      state = this.mapStates[mapData.map.properties.gearDropMap];
      if (state) {
        x = mapData.map.properties.gearDropX ?? mapData.map.respawnPoint.x;
        y = mapData.map.properties.gearDropY ?? mapData.map.respawnPoint.y;
      }
    }

    return { state, x, y };
  }

  public getMapStateForCharacter(character: ICharacter): MapState | undefined {
    return this.mapStates[character.map];
  }

  // if a player logs into a closed door, send them to the respawn point
  public checkPlayerForDoorsBeforeJoiningGame(player: Player): void {
    const { x, y } = player;

    const mapData = this.getMap(player.map);
    if (!mapData) return;

    const { map, state } = mapData;

    const door = map.getInteractableOfTypeAt(x, y, ObjectType.Door);

    if (door && !state.isDoorOpen(door.id)) {
      player.x = map.respawnPoint.x;
      player.y = map.respawnPoint.y;
      player.map = map.respawnPoint.map;
    }
  }

  public getPlayersInMap(map: string): ICharacter[] {
    return Object.keys(this.playersInMaps)
      .filter((x) => this.playersInMaps[x] === map)
      .map((x) =>
        this.game.playerManager.getPlayerByUsername(x),
      ) as ICharacter[];
  }

  public joinMap(player: Player) {
    this.leaveMap(player);

    const mapName = player.map;

    this.playersInMaps[player.username] = mapName;
    this.mapPlayerCounts[mapName] = this.mapPlayerCounts[mapName] || 0;
    this.mapPlayerCounts[mapName]++;

    if (!this.activeMaps.has(mapName)) {
      this.activeMaps.add(mapName);
      this.game.groundManager.boostSpawnersInMapBasedOnTimestamp(
        mapName,
        this.mapsInactiveSince[mapName] ?? 0,
      );
      delete this.mapsInactiveSince[mapName];
    }

    this.addCharacter(player);
    this.mapStates[mapName].addPlayer(player);

    this.game.logger.log(
      'Map:Join',
      `${player.name} (${player.username}) joining map ${mapName} (${this.mapPlayerCounts[mapName]} players).`,
    );
  }

  public leaveMap(player: Player, kickToRespawnPointIfInDungeon = false) {
    if (this.isLeavingMap[player.username]) return;

    const oldMap = this.playersInMaps[player.username];
    if (!oldMap) return;

    this.isLeavingMap[player.username] = true;

    if (oldMap === 'Tutorial') {
      this.game.playerHelper.resetSpawnPointToDefault(player);
    }

    const mapData = this.game.worldManager.getMap(player.map);

    // dead people leaving get auto-respawned
    if (this.game.characterHelper.isDead(player)) {
      player.isBeingForciblyRespawned = true;
      this.game.deathHelper.restore(player);
      player.isBeingForciblyRespawned = false;

      // people leaving dungeons (via slam) get banished to respawn
    } else if (kickToRespawnPointIfInDungeon && this.isDungeon(oldMap)) {
      player.map = player.respawnPoint.map;
      player.x = player.respawnPoint.x;
      player.y = player.respawnPoint.y;

      // if the map has a respawn kick set, we will also try to force to there
    } else if (mapData?.map.properties.respawnKick) {
      player.map = mapData.map.properties.respawnMap;
      player.x = mapData.map.properties.respawnX;
      player.y = mapData.map.properties.respawnY;
    }

    // cannot keep summons when going between maps
    if (this.game.effectHelper.hasEffect(player, 'FindFamiliar')) {
      this.game.effectHelper.removeEffectByName(player, 'FindFamiliar');
    }

    delete this.playersInMaps[player.username];

    this.mapPlayerCounts[oldMap] = this.mapPlayerCounts[oldMap] || 0;
    this.mapPlayerCounts[oldMap] = Math.max(
      this.mapPlayerCounts[oldMap] - 1,
      0,
    );
    if (this.mapPlayerCounts[oldMap] <= 0) {
      this.activeMaps.delete(oldMap);

      if (!this.isDungeon(oldMap)) {
        this.mapsInactiveSince[oldMap] = Date.now();
      }
    }

    this.removeCharacter(player);
    this.mapStates[oldMap]?.removePlayer(player);

    if (this.mapPlayerCounts[oldMap] === 0) {
      this.game.groundManager.saveSingleGround(oldMap);

      if (this.isDungeon(oldMap)) {
        this.cleanUpInstancedMap(oldMap);

        this.game.logger.log(
          'Map:Recycle',
          `Recycling instance map ${oldMap}.`,
        );
      }
    }

    this.game.logger.log(
      'Map:Leave',
      `${player.name} (${player.username}) leaving map ${oldMap} (${this.mapPlayerCounts[oldMap]} players).`,
    );

    this.isLeavingMap[player.username] = false;
  }

  public steadyTick(timer) {
    const now = Date.now();

    this.activeMaps.forEach((activeMap) => {
      const state = this.mapStates[activeMap];
      if (!state) {
        this.game.logger.error(
          'WorldManager:MapTick',
          new Error(`Map ${activeMap} does not have state.`),
        );
        return;
      }

      timer.startTimer(`map-${activeMap}-${now}`);
      state.steadyTick(timer);
      timer.stopTimer(`map-${activeMap}-${now}`);
    });
  }

  public npcTick(timer) {
    this.activeMaps.forEach((activeMap) => {
      const state = this.mapStates[activeMap];
      if (!state) {
        this.game.logger.error(
          'WorldManager:MapTick',
          new Error(`Map ${activeMap} does not have state.`),
        );
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
