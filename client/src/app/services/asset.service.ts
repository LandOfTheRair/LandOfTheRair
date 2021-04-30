import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import * as meta from '../../assets/content/_output/meta.json';
import { environment } from '../../environments/environment';
import { IItem, IItemDefinition, INPCDefinition } from '../../interfaces';
import { SettingsState } from '../../stores/index.js';

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private spritesheets: boolean[] = [];
  private items: any;
  private npcs: any;

  private spritesheetCustomHash: any = {};

  @Select(SettingsState.assetHash) public assetHash$: Observable<string>;
  @Select(SettingsState.options) public options$: Observable<string>;

  public get assetsLoaded(): boolean {
    return this.spritesheets.every(Boolean) && this.items && this.npcs;
  }

  get assetUrl(): string {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets`;
  }

  get terrainUrl(): string {
    return this.spritesheetCustomHash.terrain || `${this.assetUrl}/spritesheets/terrain.png?c=${environment.assetHashes.terrain}`;
  }

  get wallsUrl(): string {
    return this.spritesheetCustomHash.walls || `${this.assetUrl}/spritesheets/walls.png?c=${environment.assetHashes.walls}`;
  }

  get decorUrl(): string {
    return this.spritesheetCustomHash.decor || `${this.assetUrl}/spritesheets/decor.webp?c=${environment.assetHashes.decor}`;
  }

  get swimmingUrl(): string {
    return this.spritesheetCustomHash.swimming || `${this.assetUrl}/spritesheets/swimming.webp?c=${environment.assetHashes.swimming}`;
  }

  get creaturesUrl(): string {
    return this.spritesheetCustomHash.creatures || `${this.assetUrl}/spritesheets/creatures.webp?c=${environment.assetHashes.creatures}`;
  }

  get itemsUrl(): string {
    return this.spritesheetCustomHash.items || `${this.assetUrl}/spritesheets/items.webp?c=${environment.assetHashes.items}`;
  }

  get effectsUrl(): string {
    return this.spritesheetCustomHash.effects || `${this.assetUrl}/spritesheets/effects.webp?c=${environment.assetHashes.effects}`;
  }

  public get clientAssetHash(): string {
    return meta.hash;
  }

  constructor(private http: HttpClient) { }

  public init() {
    const spritesheets = ['Creatures', 'Decor', 'Effects', 'Items', 'Swimming', 'Terrain', 'Walls'];
    const spritesheetUrls = {
      creatures: this.creaturesUrl,
      decor: this.decorUrl,
      effects: this.effectsUrl,
      items: this.itemsUrl,
      swimming: this.swimmingUrl,
      terrain: this.terrainUrl,
      walls: this.wallsUrl
    };

    spritesheets.forEach((sheet, idx) => {
      sheet = sheet.toLowerCase();

      const img = new Image();
      img.src = `${spritesheetUrls[sheet]}?c=${environment.assetHashes[sheet]}`;
      this.spritesheets[idx] = false;
      img.onload = () => this.spritesheets[idx] = true;
    });

    this.http.get('assets/content/_output/items.json')
      .subscribe(items => this.setItems(items as IItem[]));

    this.http.get('assets/content/_output/npcs.json')
      .subscribe(npcs => this.setNPCs(npcs as INPCDefinition[]));

    this.options$.pipe(first())
      .subscribe(opts => {
        spritesheets.forEach(ss => {
          this.spritesheetCustomHash[ss.toLowerCase()] = opts[`spritesheet${ss}Url`];
        });
      });
  }

  public getItem(itemName: string): IItemDefinition | undefined {
    return this.items?.[itemName];
  }

  public getNPC(npcId: string): INPCDefinition | undefined {
    return this.npcs?.[npcId];
  }

  private setItems(items: IItem[]) {
    this.items = items.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {});
  }

  private setNPCs(npcs: INPCDefinition[]) {
    this.npcs = npcs.reduce((prev, cur) => {
      prev[cur.npcId] = cur;
      return prev;
    }, {});
  }
}
