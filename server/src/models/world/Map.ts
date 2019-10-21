

export class WorldMap {

  public get mapData(): any {
    return this.json;
  }

  constructor(private json: any) {}

}

export class InstancedWorldMap extends WorldMap {

}
