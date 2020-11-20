
import { get, setWith } from 'lodash';

import { Mrpas } from 'mrpas';
import * as Pathfinder from 'pathfinding';
import { Game } from '../../helpers';

import { IMapData, IMapProperties, MapLayer, ObjectType, TilesWithNoFOVUpdate } from '../../interfaces';

export class WorldMap {

  private densityMap: Pathfinder.Grid;
  private planner: any;
  private fov: Mrpas;

  private maxLevelExpPossible: number;
  private maxSkillExpPossible: number;

  private layerHashes: { [key in MapLayer]?: any } = {};

  public get width(): number {
    return this.json.width;
  }

  public get height(): number {
    return this.json.height;
  }

  public get mapData(): IMapData {
    return { tiledJSON: this.json, layerData: this.layerHashes };
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

  public get disableCreatureSpawn() {
    return this.properties.disableCreatureSpawn;
  }

  public get canSpawnCreatures() {
    return !this.disableCreatureSpawn;
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

  constructor(private game: Game, private mapName: string, private json: any) {
    this.destructureJSON();
    this.createPlanner();
    game.groundManager.initGroundForMap(mapName);
    this.setMaxes();
  }

  private setMaxes() {
    this.maxLevelExpPossible = this.game.calculatorHelper.calculateXPRequiredForLevel(this.maxLevel);
    this.maxSkillExpPossible = this.game.calculatorHelper.calculateSkillXPRequiredForLevel(this.maxSkill);
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
    console.log(grid.nodes.map(arr => {
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
      MapLayer.Succorport
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

  public getTerrainAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Terrain, x, y);
  }

  public getFloorAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Floors, x, y);
  }

  public getFluidAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Fluids, x, y);
  }

  public getFoliageAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Foliage, x, y);
  }

  public getWallAt(x: number, y: number): number {
    return this.getArrayLayerData(MapLayer.Walls, x, y);
  }

  public getDecorAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.Decor, x, y);
  }

  public getDenseDecorAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.DenseDecor, x, y);
  }

  public getOpaqueDecorAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.OpaqueDecor, x, y);
  }

  public getInteractableAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.Interactables, x, y);
  }

  public getNPCAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.NPCs, x, y);
  }

  public getSpawnerAt(x: number, y: number): null | any {
    return this.getObjectAt(MapLayer.Spawners, x, y);
  }

  public getRegionDescriptionAt(x: number, y: number): any {
    const obj = this.getObjectAt(MapLayer.RegionDescriptions, x, y);
    return obj?.properties?.desc || '';
  }

  public getBackgroundMusicAt(x: number, y: number): string {
    const obj = this.getObjectAt(MapLayer.BackgroundMusic, x, y);
    return obj?.name || '';
  }

  public getSuccorportPropertiesAt(x: number, y: number): null | any {
    const obj = this.getObjectAt(MapLayer.Succorport, x, y);
    return obj?.properties;
  }

  public getInteractableOfTypeAt(x: number, y: number, type: ObjectType): null | any {
    const obj = this.getInteractableAt(x, y);
    return obj?.type === type ? obj : null;
  }

  public getInteractableOrDenseObject(x: number, y: number) {
    return this.getDenseDecorAt(x, y) || this.getInteractableAt(x, y);
  }

  public findDoorById(id: number) {
    return this.json.layers[MapLayer.Interactables].objects.find(x => x.id === id);
  }

  checkIfDenseObjectAt(x: number, y: number): boolean {
    const object = this.getInteractableOrDenseObject(x, y);
    return object?.density && object?.type !== ObjectType.Door;
  }

  checkIfActualWallAt(x: number, y: number, shouldAirCountForWall = true): boolean {
    const wallAt = this.getWallAt(x, y);
    return !!(wallAt && (shouldAirCountForWall ? true : wallAt !== TilesWithNoFOVUpdate.Air));
  }

  checkIfHideableTileAt(x: number, y: number, shouldAirCountForWall = true): boolean {
    return !!(this.checkIfActualWallAt(x, y, shouldAirCountForWall) || this.getFoliageAt(x, y));
  }

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

}

export class InstancedWorldMap extends WorldMap {
  public get canMemorize() {
    return false;
  }

  public get canPartyAction() {
    return false;
  }
}
