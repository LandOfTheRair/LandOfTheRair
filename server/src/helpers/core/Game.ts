
import { Inject, Singleton } from 'typescript-ioc';

import { Database } from './Database';
import { Logger } from './Logger';

import { ProfanityHelper } from '../chat/ProfanityHelper';
import { ContentManager } from '../content';
import { LobbyManager } from '../lobby';
import { AccountDB, WorldDB } from './db';

@Singleton
export class Game {
  @Inject private db!: Database;

  @Inject public logger!: Logger;
  @Inject public worldDB!: WorldDB;
  @Inject public accountDB!: AccountDB;

  @Inject public profanityHelper!: ProfanityHelper;

  @Inject public contentManager!: ContentManager;
  @Inject public lobbyManager!: LobbyManager;

  public async init() {

    this.logger.log('Game', 'Initializing content...');
    await this.contentManager.init();

    this.logger.log('Game', 'Initializing database...');
    await this.db.init();

    this.logger.log('Game', 'Initializing world settings...');
    await this.worldDB.init();

    this.logger.log('Game', 'Initializing lobby...');
    await this.lobbyManager.init();

    this.loop();
  }

  public loop() {
    // setTimeout(() => this.loop(), 100);
  }
}
