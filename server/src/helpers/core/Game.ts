
import { Inject, Singleton } from 'typescript-ioc';

import { Database } from './Database';
import { Logger } from './Logger';

import { AccountDB } from './db';
import { LobbyManager } from './lobby';

@Singleton
export class Game {
  @Inject private db!: Database;

  @Inject public logger!: Logger;
  @Inject public accountDB!: AccountDB;

  @Inject public lobbyManager!: LobbyManager;

  public async init() {

    this.logger.log('Game', 'Initializing database...');
    await this.db.init();

    this.logger.log('Game', 'Initializing lobby...');
    await this.lobbyManager.init();

    this.loop();
  }

  public loop() {
    // setTimeout(() => this.loop(), 100);
  }
}
