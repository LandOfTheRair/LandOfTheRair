
import { get, setWith } from 'lodash';

import { IMapData, MapLayer } from '../../interfaces';


export class WorldMap {

  private layerHashes: { [key in MapLayer]?: any } = {};

  public get mapData(): IMapData {
    return { tiledJSON: this.json, layerData: this.layerHashes };
  }

  constructor(private json: any) {
    this.destructureJSON();
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

  private getObjectAt(mapLayer: MapLayer, x: number, y: number): null | any {
    return get(this.layerHashes, [mapLayer, x, y], null);
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

}

export class InstancedWorldMap extends WorldMap {

}
