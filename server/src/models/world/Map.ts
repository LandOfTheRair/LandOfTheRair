
import { cloneDeep, get, setWith } from 'lodash';

import { Mrpas } from 'mrpas';
import * as Pathfinder from 'pathfinding';
import { Game } from '../../helpers';

import { IMapData, IMapProperties, IPlayer, MapLayer, ObjectType, TilesWithNoFOVUpdate } from '../../interfaces';

import * as settings from '../../../content/_output/settings.json';

export class WorldMap {

  private densityMap: Pathfinder.Grid;
  private planner: any;
  private fov: Mrpas;
  private formattedJson: any;

  private maxLevelExpPossible: number;
  private maxSkillExpPossible: number;

  private layerHashes: Partial<Record<MapLayer, any>> = {};

  public get width(): number {
    return this.json.width;
  }

  public get height(): number {
    return this.json.height;
  }

  public get mapData(): IMapData {
    return { tiledJSON: this.formattedJson, layerData: this.layerHashes };
  }

  public get properties(): IMapProperties {
    return this.json.properties;
  }

  public get region() {
    return this.properties.region;
  }

  public get holiday() {
    return this.properties.holiday;
  }

  public get maxSkill() {
    return this.properties.maxSkill || 1;
  }

  public get maxSkillExp() {
    return this.maxSkillExpPossible;
  }

  public get maxLevel() {
    return this.properties.maxLevel || 1;
  }

  public get maxLevelExp() {
    return this.maxLevelExpPossible;
  }

  public get maxCreatures() {
    return this.properties.maxCreatures;
  }

  public get disableCreatureRespawn() {
    return this.properties.disableCreatureRespawn;
  }

  public get canSpawnCreatures() {
    return !this.disableCreatureRespawn;
  }

  public get decayRateHours() {
    return this.properties.itemExpirationHours || 6;
  }

  public get decayCheckMinutes() {
    return this.properties.itemGarbageCollection || 60;
  }

  public get maxItemsOnGround() {
    return this.properties.maxItemsOnGround || 1000;
  }

  public get subscriberOnly() {
    return this.properties.subscriberOnly;
  }

  public get respawnPoint() {
    return {
      map: this.properties.respawnMap || this.mapName,
      x: this.properties.respawnX,
      y: this.properties.respawnY
    };
  }

  public get exitPoint() {
    const { kickMap, kickX, kickY } = this.properties;
    if (!kickMap || !kickX || !kickY) return null;
    return { kickMap, kickX, kickY };
  }

  public get gearDropPoint() {
    const { gearDropMap, gearDropX, gearDropY } = this.properties;
    if (!gearDropMap || !gearDropX || !gearDropY) return null;
    return { gearDropMap, gearDropX, gearDropY };
  }

  public get canMemorize() {
    return true;
  }

  public get canPartyAction() {
    return true;
  }

  public get script() {
    return this.properties.script;
  }

  public get fovCalculator() {
    return this.fov;
  }

  public get mapDroptables() {
    return this.game.contentManager.getDroptablesForMap(this.mapName) || [];
  }

  public get regionDroptables() {
    return this.game.contentManager.getDropablesForRegion(this.region) || [];
  }

  public get allSpawners() {
    return this.json.layers[MapLayer.Spawners].objects;
  }

  public get allDefaultNPCs() {
    return this.json.layers[MapLayer.NPCs].objects;
  }

  public get name() {
    return this.mapName;
  }

  constructor(private game: Game, private mapName: string, private json: any, partyName?: string) {
    this.destructureJSON();
    this.createPlanner();
    game.groundManager.initGroundForMap(mapName, partyName);
    this.setMaxes();
    this.reformatJSON();
  }

  private reformatJSON() {
    this.formattedJson = cloneDeep(this.json);

    this.formattedJson.layers.length = 10;
    this.formattedJson.tilesets.forEach(tileset => {
      delete tileset.terrains;
    });

    const mapWallTiles = this.formattedJson.layers[MapLayer.Walls].data;

    // clear air tiles that are on the wall layer because they're see-through
    for (let i = 0; i < mapWallTiles.length; i++) {
      if (mapWallTiles[i] === TilesWithNoFOVUpdate.Air) mapWallTiles[i] = TilesWithNoFOVUpdate.Empty;
    }
  }

  private setMaxes() {
    this.maxLevelExpPossible = this.game.calculatorHelper.calculateXPRequiredForLevel(settings.game.maxLevel);
    this.maxSkillExpPossible = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(Math.min(settings.game.maxSkill, this.maxSkill));
  }

  private createPlanner() {
    const densityMap = new Pathfinder.Grid(this.width, this.height);

    for (let dx = 0; dx < this.width; dx++) {
      for (let dy = 0; dy < this.height; dy++) {

        const isDense = this.getWallAt(dx, dy) || this.getDenseDecorAt(dx, dy);

        densityMap.setWalkableAt(dx, dy, !isDense);
      }
    }

    this.densityMap = densityMap;

    /* debug: prints density map
    console.debug(grid.nodes.map(arr => {
      return arr.map(x => x.walkable ? 1 : 0);
    }));
    */

    this.planner = new Pathfinder.AStarFinder({
      diagonalMovement: Pathfinder.DiagonalMovement.Always
    });


    this.fov = new Mrpas(this.width, this.height, (x, y) => {
      const tile = this.getWallAt(x, y);

      // if the tile is either empty or air, we look for interactables/opaquedecor
      // if neither, we can see here
      if (tile === TilesWithNoFOVUpdate.Empty || tile === TilesWithNoFOVUpdate.Air) {
        const object = this.getInteractableAt(x, y) || this.getOpaqueDecorAt(x, y);
        return !object || (object && !object.opacity);
      }

      // by default, we can't see
      return false;
    });
  }

  private destructureJSON() {
    [
      MapLayer.Decor,
      MapLayer.DenseDecor,
      MapLayer.OpaqueDecor,
      MapLayer.Interactables,
      MapLayer.NPCs,
      MapLayer.Spawners
    ].forEach(layer => {
      this.parseObjectsIntoPositionalHash(layer);
    });

    [
      MapLayer.RegionDescriptions,
      MapLayer.BackgroundMusic,
      MapLayer.Succorport,
      MapLayer.ZLevel
    ].forEach(layer => {
      this.parseRectangleDataIntoPositionalHash(layer);
    });
  }

  private parseObjectsIntoPositionalHash(mapLayer: MapLayer) {
    const objects = this.json.layers[mapLayer].objects;
    objects.forEach(obj => {
      const realX = Math.floor(obj.x / 64);
      const realY = Math.floor(obj.y / 64) - 1; // -1 to adjust for Tiled

      setWith(this.layerHashes, [mapLayer, realX, realY], obj, Object);

      if (obj.type === 'Door') {
        obj.density = 1;
        obj.opacity = 1;
      }

      if (mapLayer === MapLayer.OpaqueDecor) {
        obj.opacity = 1;
      }

      if (mapLayer === MapLayer.DenseDecor) {
        obj.density = 1;
      }
    });
  }

  private parseRectangleDataIntoPositionalHash(mapLayer: MapLayer) {
    const objects = this.json.layers[mapLayer].objects;
    objects.forEach(obj => {
      const realX = Math.floor(obj.x / 64);
      const realY = Math.floor(obj.y / 64); // -1 to adjust for Tiled
      const realW = Math.floor(obj.width / 64);
      const realH = Math.floor(obj.height / 64);

      for (let x = realX; x < realX + realW; x++) {
        for (let y = realY; y < realY + realH; y++) {
          setWith(this.layerHashes, [mapLayer, x, y], obj, Object);
        }
      }
    });
  }

  private getArrayLayerData(mapLayer: MapLayer, x: number, y: number): number {
    return this.json.layers[mapLayer].data[x + (y * (this.width))];
  }

  private getObjectAt(mapLayer: MapLayer, x: number, y: number): null | any {
    return get(this.layerHashes, [mapLayer, x, y], null);
  }

  // get the terrain tile at x/y
  public getTerrainAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Terrain, x, y);
  }

  // get the floor tile at x/y
  public getFloorAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Floors, x, y);
  }

  // get the fluid tile at x/y
  public getFluidAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Fluids, x, y);
  }

  // get the foliage tile at x/y
  public getFoliageAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Foliage, x, y);
  }

  // get the wall at x/y
  public getWallAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Walls, x, y);
  }

  // get the decor at x/y
  public getDecorAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.Decor, x, y);
  }

  // get the densedecor at x/y
  public getDenseDecorAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.DenseDecor, x, y);
  }

  // get the opaquedecor at x/y
  public getOpaqueDecorAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.OpaqueDecor, x, y);
  }

  // get the interactable at the x/y.
  public getInteractableAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.Interactables, x, y);
  }

  // get the GREEN npc at the x/y. green npcs cannot be layered on the same tile
  public getNPCAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.NPCs, x, y);
  }

  // get a spawner at an x/y
  public getSpawnerAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.Spawners, x, y);
  }

  // get the region description for the particular tile
  public getRegionDescriptionAt(x: number, y: number): any {
    const obj = this.getObjectAt(MapLayer.RegionDescriptions, x, y);
    return obj?.properties?.desc || '';
  }

  // get the bgm for the particular tile
  public getBackgroundMusicAt(x: number, y: number): string {
    const obj = this.getObjectAt(MapLayer.BackgroundMusic, x, y);
    return obj?.name || '';
  }

  // get the succorport properties if they exist
  public getSuccorportPropertiesAt(x: number, y: number): null | any {
    const obj = this.getObjectAt(MapLayer.Succorport, x, y);
    return obj?.properties;
  }

  // filter objects at the given x/y for a type of object
  public getInteractableOfTypeAt(x: number, y: number, type: ObjectType): null | any {
    const obj = this.getInteractableAt(x, y);
    return obj?.type === type ? obj : null;
  }

  // check first for dense decor, then secondly for objects at the location
  public getInteractableOrDenseObject(x: number, y: number) {
    return this.getDenseDecorAt(x, y) || this.getInteractableAt(x, y);
  }

  // check the Z level for an x/y
  public getZLevelAt(x: number, y: number): number {
    return this.getObjectAt(MapLayer.ZLevel, x, y)?.properties.z ?? 0;
  }

  // find a door by a given id
  public findDoorById(id: number) {
    return this.json.layers[MapLayer.Interactables].objects.find(x => x.id === id);
  }

  // find all decor by a particular decor name
  public findAllDecorByName(name: string): any[] {
    const decor = this.json.layers[MapLayer.Decor].objects;
    const denseDecor = this.json.layers[MapLayer.DenseDecor].objects;
    const opaqueDecor = this.json.layers[MapLayer.OpaqueDecor].objects;

    return [
      ...decor,
      ...denseDecor,
      ...opaqueDecor
    ].filter(x => x.name === name);
  }

  // find an interactable by its name
  public findInteractableByName(name: string) {
    return this.json.layers[MapLayer.Interactables].objects.find(x => x.name === name);
  }

  // check if there's a dense object or an interactable that isn't a door
  public checkIfDenseObjectAt(x: number, y: number): boolean {
    const object = this.getInteractableOrDenseObject(x, y);
    return object?.density && object?.type !== ObjectType.Door;
  }

  // whether or not there's a wall or, optionally, an air space at the tile
  public checkIfActualWallAt(x: number, y: number, shouldAirCountForWall = true): boolean {
    const wallAt = this.getWallAt(x, y);
    return !!(wallAt && (shouldAirCountForWall ? true : wallAt !== TilesWithNoFOVUpdate.Air));
  }

  // whether or not there is a wall or foliage at the chosen tile
  public checkIfHideableTileAt(x: number, y: number, shouldAirCountForWall = true): boolean {
    return !!(this.checkIfActualWallAt(x, y, shouldAirCountForWall) || this.getFoliageAt(x, y));
  }

  // whether or not you can hide at a certain position (checks walls and foliage of surrounding tiles)
  public checkIfCanHideAt(x: number, y: number, shouldAirCountForWall = true): boolean {
    for (let xx = x - 1; xx <= x + 1; xx++) {
      for (let yy = y - 1; yy <= y + 1; yy++) {
        const tile = this.checkIfHideableTileAt(xx, yy, shouldAirCountForWall);
        if (tile) return true;
      }
    }

    return false;
  }

  // build a path between x/y->x/y
  public findPath(startX: number, startY: number, endX: number, endY: number) {

    const grid = this.densityMap.clone();

    // doing this allows us to click on walls and move towards them
    grid.setWalkableAt(endX, endY, true);

    const path = this.planner.findPath(startX, startY, endX, endY, grid);

    const steps = path.map(([newX, newY], idx) => {
      if (idx === 0) return { x: 0, y: 0 };

      const [prevX, prevY] = path[idx - 1];
      return { x: newX - prevX, y: newY - prevY };
    });

    // the first step is always our tile, we should ignore it.
    steps.shift();

    return steps;
  }

  // whether or not the current tile is succorable
  public canSuccor(player: IPlayer): boolean {
    return !this.getSuccorportPropertiesAt(player.x, player.y)?.restrictSuccor;
  }

  // whether or not the current tile is teleportable
  public canTeleport(player: IPlayer): boolean {
    return !this.getSuccorportPropertiesAt(player.x, player.y)?.restrictTeleport;
  }

}

export class InstancedWorldMap extends WorldMap {
  public override get canMemorize() {
    return false;
  }

  public override get canPartyAction() {
    return false;
  }
}
