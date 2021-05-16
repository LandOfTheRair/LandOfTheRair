
import { Injectable } from 'injection-js';
import { get, setWith, size } from 'lodash';

import { BaseService } from '../../models/BaseService';

enum DarknessStatus {
  Lightness = -2,
  PermanentDarkness = -1,
  Clear = 0,
  Darkness = 1
}

@Injectable()
export class DarknessHelper extends BaseService {

  private darkness: Record<string, Record<number, Record<number, number>>> = {};

  public init() {}

  public tick(timer) {
    const now = Date.now();

    timer.startTimer(`darkness-${now}`);
    this.checkAllDarkness();
    timer.stopTimer(`darkness-${now}`);
  }

  public checkAllDarkness() {
    const now = Date.now();

    Object.keys(this.darkness).forEach(map => {
      Object.keys(this.darkness[map]).forEach(x => {
        Object.keys(this.darkness[map][x]).forEach(y => {

          const timestamp = this.darkness[map][x][y];
          if (timestamp < DarknessStatus.Darkness) return;
          if (now < timestamp) return;

          this.removeSingleDarkness(map, +x, +y);
        });
      });
    });
  }

  public createDarkness(map: string, x: number, y: number, radius: number, endsAt: number): void {
    const now = Date.now();

    for (let xx = x - radius; xx <= x + radius; xx++) {
      for (let yy = y - radius; yy <= y + radius; yy++) {

        const existingDarkness = this.getDarkness(map, xx, yy);

        // we can't override permanent darkness
        if (existingDarkness === DarknessStatus.PermanentDarkness) continue;

        // we also can't override lightness
        if (existingDarkness < DarknessStatus.Lightness && now < -existingDarkness) continue;

        if (existingDarkness === DarknessStatus.Clear || (existingDarkness && existingDarkness < endsAt)) {
          this.setDarkness(map, xx, yy, endsAt);
          this.updateDarkness(map, x, y);
        }

      }
    }
  }

  public removeDarkness(map: string, x: number, y: number, radius: number, lightEndsAt: number): void {
    const now = Date.now();

    for (let xx = x - radius; xx <= x + radius; xx++) {
      for (let yy = y - radius; yy <= y + radius; yy++) {

        const existingDarkness = this.getDarkness(map, xx, yy);

        // we can't override permanent darkness
        if (existingDarkness === DarknessStatus.PermanentDarkness) continue;

        // we also can't override lightness
        if (existingDarkness < DarknessStatus.Lightness && now < -existingDarkness) continue;

        this.removeSingleDarkness(map, xx, yy);
        if (lightEndsAt) {
          this.createLight(map, xx, yy, lightEndsAt);
        }

      }
    }
  }

  public removeSingleDarkness(map: string, x: number, y: number): void {
    setWith(this.darkness, [map, x, y], 0, Object);
    this.updateDarkness(map, x, y);

    delete this.darkness[map][x][y];
    if (size(this.darkness[map][x]) === 0) delete this.darkness[map][x];
    if (size(this.darkness[map]) === 0) delete this.darkness[map];
  }

  public createPermanentDarkness(map: string, x: number, y: number): void {
    this.createDarkness(map, x, y, 0, -1);
  }

  public createLight(map: string, x: number, y: number, endsAt: number): void {
    setWith(this.darkness, [map, x, y], -endsAt, Object);
  }

  public isDarkAt(map: string, x: number, y: number): boolean {
    const darkness = this.getDarkness(map, x, y);
    return darkness === DarknessStatus.PermanentDarkness || darkness > DarknessStatus.Darkness;
  }

  private updateDarkness(map: string, x: number, y: number): void {
    this.game.worldManager.getMap(map)?.state?.triggerAndSendUpdateWithFOV(x, y);
  }

  private setDarkness(map: string, x: number, y: number, endsAt: number): void {
    setWith(this.darkness, [map, x, y], endsAt, Object);
  }

  private getDarkness(map: string, x: number, y: number): number {
    return get(this.darkness, [map, x, y], 0);
  }

}
