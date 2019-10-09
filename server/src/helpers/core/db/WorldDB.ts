
import { Inject, Singleton } from 'typescript-ioc';

import { WorldSettings } from '../../../models';
import { Database } from '../Database';

@Singleton
export class WorldDB {

  @Inject private db!: Database;

  private settings!: WorldSettings;

  public get motd() {
    return this.settings.motd;
  }

  public async init() {
    await this.loadSettings();
  }

  public async loadSettings() {
    this.settings = await this.db.em.getRepository<WorldSettings>(WorldSettings)
      .findOne({ _id: { $exists: true }}) as WorldSettings;
    if (!this.settings) {
      this.settings = new WorldSettings();
      this.settings.motd = 'Welcome to Land of the Rair!';

      await this.db.em.persist(this.settings, true);
    }
  }

  private async saveSettings() {
    return this.db.em.persist(this.settings, true);
  }

  public setMOTD(motd: string) {
    this.settings.motd = motd;
    this.saveSettings();
  }

}
