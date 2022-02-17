import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import * as meta from '../../assets/content/_output/meta.json';
import { environment } from '../../environments/environment';
import { IItemDefinition, INPCDefinition } from '../../interfaces';
import { SettingsState } from '../../stores/index.js';
import { APIService } from './api.service';

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
    return this.spritesheetCustomHash.terrain || `${this.assetUrl}/spritesheets/terrain.webp?c=${environment.assetHashes.terrain}`;
  }

  get wallsUrl(): string {
    return this.spritesheetCustomHash.walls || `${this.assetUrl}/spritesheets/walls.webp?c=${environment.assetHashes.walls}`;
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

  get itemsAnimationsUrl(): string {
    return this.spritesheetCustomHash.itemsAnimations
        || `${this.assetUrl}/spritesheets/items-animations.webp?c=${environment.assetHashes.itemsanimations}`;
  }

  get decorAnimationsUrl(): string {
    return this.spritesheetCustomHash.decorAnimations
        || `${this.assetUrl}/spritesheets/decor-animations.webp?c=${environment.assetHashes.decoranimations}`;
  }

  get terrainAnimationsUrl(): string {
    return this.spritesheetCustomHash.terrainAnimations
        || `${this.assetUrl}/spritesheets/terrain-animations.webp?c=${environment.assetHashes.terrainanimations}`;
  }

  get effectsUrl(): string {
    return this.spritesheetCustomHash.effects || `${this.assetUrl}/spritesheets/effects.webp?c=${environment.assetHashes.effects}`;
  }

  public get clientAssetHash(): string {
    return meta.hash;
  }

  constructor(private http: HttpClient, private api: APIService) { }

  public init() {
    const spritesheets = ['Creatures', 'Decor', 'Effects', 'Items', 'Swimming', 'Terrain', 'Walls', 'ItemsAnimations', 'DecorAnimations'];
    const spritesheetUrls = {
      creatures: this.creaturesUrl,
      decor: this.decorUrl,
      effects: this.effectsUrl,
      items: this.itemsUrl,
      swimming: this.swimmingUrl,
      terrain: this.terrainUrl,
      walls: this.wallsUrl,
      itemsanimations: this.itemsAnimationsUrl,
      decoranimations: this.decorAnimationsUrl,
      terrainanimations: this.terrainAnimationsUrl
    };

    spritesheets.forEach((sheet, idx) => {
      sheet = sheet.toLowerCase();

      const img = new Image();
      img.src = `${spritesheetUrls[sheet]}`;
      this.spritesheets[idx] = false;
      img.onload = () => this.spritesheets[idx] = true;
    });

    forkJoin({
      items: this.http.get('assets/content/_output/items.json'),
      npcs: this.http.get('assets/content/_output/npcs.json'),
      mods: this.http.get(`${this.api.finalHTTPURL}/mod/all`)
    }).subscribe(({ items, npcs, mods }) => {
      const modItems = (mods as any).items as IItemDefinition[];
      const modNPCs = (mods as any).npcs as INPCDefinition[];

      this.setItems((items as IItemDefinition[]).concat(modItems));
      this.setNPCs((npcs as INPCDefinition[]).concat(modNPCs));
    });

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

  private setItems(items: IItemDefinition[]) {
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
