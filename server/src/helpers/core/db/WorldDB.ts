
import { Injectable } from 'injection-js';

import { BaseService, WorldSettings } from '../../../models';
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

  public async init() {
    await this.loadSettings();
  }

  public async loadSettings() {
    this.settings = await this.db.getCollection(WorldSettings)
      .findOne({ _id: { $exists: true } } as any) as WorldSettings;

    if (!this.settings) {
      this.settings = new WorldSettings();
      this.settings.motd = 'Welcome to Land of the Rair!';

      this.saveSettings();
    }
  }

  private async saveSettings() {
    await this.db.save(this.settings);
  }

  public setMOTD(motd: string) {
    this.settings.motd = motd;
    this.saveSettings();
  }

}
