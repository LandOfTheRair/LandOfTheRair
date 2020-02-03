
import { get, setWith } from 'lodash';

import * as Pathfinder from 'pathfinding';

import { IMapData, MapLayer, ObjectType, TilesWithNoFOVUpdate } from '../../interfaces';

export class WorldMap {

  private densityMap: Pathfinder.Grid;
  private planner: any;

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

  constructor(private mapName: string, private json: any) {
    this.destructureJSON();
    this.createPlanner();
  }

  private createPlanner() {
    const densityMap = new Pathfinder.Grid(this.json.width, this.json.height);

    for (let dx = 0; dx < this.json.width; dx++) {
      for (let dy = 0; dy < this.json.height; dy++) {

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
  }

  private destructureJSON() {
    [
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
      this.parsePropertyDataIntoPositionalHash(layer);
    });
  }

  private parsePropertyDataIntoPositionalHash(mapLayer: MapLayer) {
    const objects = this.json.layers[mapLayer].objects;
    objects.forEach(obj => {
      const realX = Math.floor(obj.x / 64);
      const realY = Math.floor(obj.y / 64) - 1; // -1 to adjust for Tiled
      const realW = Math.floor(obj.width / 64);
      const realH = Math.floor(obj.height / 64);

      for (let x = realX; x < realW; x++) {
        for (let y = realY; y < realH; y++) {
          setWith(this.layerHashes, [mapLayer, realX, realY], obj, Object);
        }
      }
    });
  }

  private parseObjectsIntoPositionalHash(mapLayer: MapLayer) {
    const objects = this.json.layers[mapLayer].objects;
    objects.forEach(obj => {
      const realX = Math.floor(obj.x / 64);
      const realY = Math.floor(obj.y / 64) - 1; // -1 to adjust for Tiled

      setWith(this.layerHashes, [mapLayer, realX, realY], obj, Object);
    });
  }

  private getArrayLayerData(mapLayer: MapLayer, x: number, y: number): number {
    return this.json.layers[mapLayer].data[x + (y * (this.json.width))];
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
    if (!obj) return '';

    return obj.properties.desc;
  }

  public getBackgroundMusicAt(x: number, y: number): string {
    const obj = this.getObjectAt(MapLayer.BackgroundMusic, x, y);
    if (!obj) return '';

    return obj.name;
  }

  public getSuccorportPropertiesAt(x: number, y: number): null | any {
    const obj = this.getObjectAt(MapLayer.Succorport, x, y);
    if (!obj) return null;

    return obj.properties;
  }

  public getInteractableOfTypeAt(x: number, y: number, type: ObjectType): null | any {
    const obj = this.getInteractableAt(x, y);
    return obj.type === type ? obj : null;
  }

  public getInteractableOrDenseObject(x: number, y: number) {
    return this.getDenseDecorAt(x, y) || this.getInteractableAt(x, y);
  }

  checkIfDenseObjectAt(x: number, y: number): boolean {
    const object = this.getInteractableOrDenseObject(x, y);
    return object && object.density && object.type !== ObjectType.Door;
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

}
