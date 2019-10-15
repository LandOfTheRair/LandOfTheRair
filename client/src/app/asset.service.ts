import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as meta from '../assets/content/_output/meta.json';
import { environment } from '../environments/environment';
import { SettingsState } from '../stores/index.js';

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private spritesheets: boolean[] = [];
  private items: any;
  private npcs: any;

  @Select(SettingsState.assetHash) public assetHash$: Observable<string>;

  public get assetsLoaded(): boolean {
    return this.spritesheets.every(Boolean) && this.items && this.npcs;
  }

  public get clientAssetHash(): string {
    return meta.hash;
  }

  constructor(private http: HttpClient) { }

  public init() {
    const spritesheets = ['creatures', 'decor', 'effects', 'items', 'swimming', 'terrain', 'walls'];
    spritesheets.forEach((sheet, idx) => {
      const img = new Image();
      img.src = `assets/spritesheets/${sheet}.png?t=${environment.assetHashes[sheet]}`;
      this.spritesheets[idx] = false;
      img.onload = () => this.spritesheets[idx] = true;
    });

    this.http.get('assets/content/_output/items.json')
      .subscribe(items => this.setItems(items));

    this.http.get('assets/content/_output/npcs.json')
      .subscribe(npcs => this.setNPCs(npcs));
  }

  private setItems(items) {
    this.items = items.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {});
  }

  private setNPCs(npcs) {
    this.npcs = npcs.reduce((prev, cur) => {
      prev[cur.npcId] = cur;
      return prev;
    }, {});
  }
}
