import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private spritesheets = [];
  private items: any;
  private npcs: any;

  public get assetsLoaded(): boolean {
    return this.spritesheets.every(Boolean) && this.items && this.npcs;
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
