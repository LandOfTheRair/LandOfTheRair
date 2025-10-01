import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { select } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { ElectronService } from 'src/app/services/electron.service';
import meta from '../../assets/content/_output/meta.json';
import { environment } from '../../environments/environment';
import { IItemDefinition, INPCDefinition } from '../../interfaces';
import { SettingsState } from '../../stores';
import { APIService } from './api.service';

const spritesheets = [
  'Creatures',
  'Decor',
  'Effects',
  'Items',
  'Swimming',
  'Terrain',
  'Walls',
  'ItemsAnimations',
  'DecorAnimations',
];

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private electronService = inject(ElectronService);

  private spritesheets: WritableSignal<boolean>[] = [];
  private items = signal<Record<string, IItemDefinition>>(undefined);
  private npcs = signal<Record<string, INPCDefinition>>(undefined);

  private spritesheetCustomHash: any = {};

  public assetHash = select(SettingsState.assetHash);
  public options = select(SettingsState.options);

  public loadingAssets = signal<boolean>(false);

  public assetsLoaded = computed(
    () =>
      this.spritesheets.every((s) => s()) && !!this.items() && !!this.npcs(),
  );

  get assetBaseUrl(): string {
    const protocol = this.electronService.isInElectron()
      ? 'rairasset'
      : environment.client.protocol;
    return `${protocol}://${environment.client.domain}:${environment.client.port}`;
  }

  get assetUrl(): string {
    return `${this.assetBaseUrl}/assets`;
  }

  get terrainUrl(): string {
    return (
      this.spritesheetCustomHash.terrain ||
      `${this.assetUrl}/spritesheets/terrain.webp?c=${environment.assetHashes.terrain}`
    );
  }

  get wallsUrl(): string {
    return (
      this.spritesheetCustomHash.walls ||
      `${this.assetUrl}/spritesheets/walls.webp?c=${environment.assetHashes.walls}`
    );
  }

  get decorUrl(): string {
    return (
      this.spritesheetCustomHash.decor ||
      `${this.assetUrl}/spritesheets/decor.webp?c=${environment.assetHashes.decor}`
    );
  }

  get swimmingUrl(): string {
    return (
      this.spritesheetCustomHash.swimming ||
      `${this.assetUrl}/spritesheets/swimming.webp?c=${environment.assetHashes.swimming}`
    );
  }

  get creaturesUrl(): string {
    return (
      this.spritesheetCustomHash.creatures ||
      `${this.assetUrl}/spritesheets/creatures.webp?c=${environment.assetHashes.creatures}`
    );
  }

  get itemsUrl(): string {
    return (
      this.spritesheetCustomHash.items ||
      `${this.assetUrl}/spritesheets/items.webp?c=${environment.assetHashes.items}`
    );
  }

  get itemsAnimationsUrl(): string {
    return (
      this.spritesheetCustomHash.itemsAnimations ||
      `${this.assetUrl}/spritesheets/items-animations.webp?c=${environment.assetHashes.itemsanimations}`
    );
  }

  get decorAnimationsUrl(): string {
    return (
      this.spritesheetCustomHash.decorAnimations ||
      `${this.assetUrl}/spritesheets/decor-animations.webp?c=${environment.assetHashes.decoranimations}`
    );
  }

  get terrainAnimationsUrl(): string {
    return (
      this.spritesheetCustomHash.terrainAnimations ||
      `${this.assetUrl}/spritesheets/terrain-animations.webp?c=${environment.assetHashes.terrainanimations}`
    );
  }

  get effectsUrl(): string {
    return (
      this.spritesheetCustomHash.effects ||
      `${this.assetUrl}/spritesheets/effects.webp?c=${environment.assetHashes.effects}`
    );
  }

  public get clientAssetHash(): string {
    return meta.hash;
  }

  private http = inject(HttpClient);
  private api = inject(APIService);

  constructor() {
    effect(() => {
      const opts = this.options();

      spritesheets.forEach((ss) => {
        this.spritesheetCustomHash[ss.toLowerCase()] =
          opts[`spritesheet${ss}Url`];
      });
    });

    (window as any).__assets = this;
  }

  public init() {
    spritesheets.forEach((s, idx) => {
      this.spritesheets[idx] = signal<boolean>(false);
    });

    this.markAssetsUnloaded();
  }

  public markAssetsUnloaded() {
    this.loadingAssets.set(false);

    spritesheets.forEach((s, idx) => {
      this.spritesheets[idx].set(false);
    });

    this.items.set(undefined);
    this.npcs.set(undefined);
  }

  // this is unique, and called on login to ensure the resources are gotten every time a login happens
  // rather than when the app inits. this will hopefully prevent weird errors
  public loadAssets() {
    if (this.loadingAssets()) return;

    this.loadingAssets.set(true);

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
      terrainanimations: this.terrainAnimationsUrl,
    };

    spritesheets.forEach((sheet, idx) => {
      sheet = sheet.toLowerCase();

      const img = new Image();
      img.src = `${spritesheetUrls[sheet]}`;
      this.spritesheets[idx].set(false);
      img.onload = () => this.spritesheets[idx].set(true);
    });

    forkJoin({
      items: this.http.get(
        `${
          this.assetBaseUrl
        }/assets/content/_output/items.json?t=${Date.now()}`,
      ),
      npcs: this.http.get(
        `${this.assetBaseUrl}/assets/content/_output/npcs.json?t=${Date.now()}`,
      ),
      mods: this.http.get(`${this.api.finalHTTPURL}/mod/all`),
    }).subscribe(({ items, npcs, mods }) => {
      const modItems = (mods as any).items as IItemDefinition[];
      const modNPCs = (mods as any).npcs as INPCDefinition[];

      this.setItems((items as IItemDefinition[]).concat(modItems));
      this.setNPCs((npcs as INPCDefinition[]).concat(modNPCs));

      this.loadingAssets.set(false);
    });
  }

  public getItem(itemName: string): IItemDefinition | undefined {
    return this.items()?.[itemName];
  }

  public getNPC(npcId: string): INPCDefinition | undefined {
    return this.npcs()?.[npcId];
  }

  private setItems(items: IItemDefinition[]) {
    const itemHash = items.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {});

    this.items.set(itemHash);
  }

  private setNPCs(npcs: INPCDefinition[]) {
    const npcHash = npcs.reduce((prev, cur) => {
      prev[cur.npcId] = cur;
      return prev;
    }, {});

    this.npcs.set(npcHash);
  }
}
