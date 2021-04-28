
import { Injectable } from 'injection-js';

import { WorldSettings } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { Database } from '../Database';

@Injectable()
export class WorldDB extends BaseService {

  constructor(
    private db: Database
  ) {
    super();
  }

  private settings: WorldSettings;

  public get motd() {
    return this.settings.motd;
  }

  public get running() {
    return this.settings.running ?? false;
  }

  public async init() {
    await this.loadSettings();
  }

  public async loadSettings() {
    this.settings = await this.db.findSingle<WorldSettings>(WorldSettings, { _id: { $exists: true } }) as WorldSettings;

    if (!this.settings) {
      this.settings = new WorldSettings();
      this.settings.motd = 'Welcome to Land of the Rair!';
      this.saveSettings();
    }
  }

  private async saveSettings() {
    await this.db.save(this.settings);
  }

  public async saveRunning() {
    this.settings.running = true;
    await this.db.save(this.settings);
  }

  public async saveStopped() {
    this.settings.running = false;
    await this.db.save(this.settings);
  }

  public setMOTD(motd: string) {
    this.settings.motd = motd;
    this.saveSettings();
  }

}
