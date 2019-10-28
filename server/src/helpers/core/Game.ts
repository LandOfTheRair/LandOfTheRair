
import { LoggerTimer } from 'logger-timer';
import { Inject, Singleton } from 'typescript-ioc';

import { Database } from './Database';
import { Logger } from './Logger';

import { GameAction } from '../../interfaces';
import { CalculatorHelper, CharacterHelper, ItemHelper, NPCHelper, PlayerHelper } from '../character';
import { ProfanityHelper } from '../chat/ProfanityHelper';
import { ContentManager, ItemCreator, NPCCreator, WorldManager } from '../data';
import { PlayerManager } from '../game';
import { CharacterRoller, LobbyManager } from '../lobby';
import { AccountDB, CharacterDB, WorldDB } from './db';
import { WebsocketCommandHandler } from './WebsocketCommandHandler';

@Singleton
export class Game {

  public wsCmdHandler: WebsocketCommandHandler;

  @Inject public logger: Logger;
  @Inject public contentManager: ContentManager;

  @Inject public db: Database;

  @Inject public accountDB: AccountDB;
  @Inject public characterDB: CharacterDB;
  @Inject public worldDB: WorldDB;

  @Inject public profanityHelper: ProfanityHelper;

  @Inject public lobbyManager: LobbyManager;
  @Inject public characterRoller: CharacterRoller;
  @Inject public itemCreator: ItemCreator;
  @Inject public npcCreator: NPCCreator;

  @Inject public calculatorHelper: CalculatorHelper;
  @Inject public itemHelper: ItemHelper;
  @Inject public npcHelper: NPCHelper;
  @Inject public characterHelper: CharacterHelper;
  @Inject public playerHelper: PlayerHelper;

  @Inject public playerManager: PlayerManager;
  @Inject public worldManager: WorldManager;

  public async init(wsCmdHandler: WebsocketCommandHandler) {
    this.wsCmdHandler = wsCmdHandler;

    const initOrder = [
      'logger',
      'contentManager',
      'db', 'worldDB', 'characterDB', 'accountDB',
      'profanityHelper',
      'lobbyManager',
      'characterRoller',
      'itemCreator', 'npcCreator',
      'calculatorHelper',
      'characterHelper', 'itemHelper', 'npcHelper', 'playerHelper',
      'playerManager', 'worldManager'
  ];

    for (const i of initOrder) {
      this.logger.log('Game', `Initializing ${i}...`);
      await this[i].init();
      this[i].game = this;
    }

    this.loop();
  }

  public loop() {
    const timer = new LoggerTimer({ isActive: process.env.NODE_ENV !== 'production' });
    timer.startTimer('gameloop');
    timer.stopTimer('gameloop');
    // timer.dumpTimers();
    setTimeout(() => this.loop(), 100);
  }

  public sendDataToAccount(username: string, data: any): void {
    this.wsCmdHandler.sendToSocket(username, data);
  }

  public sendActionToAccount(username: string, action: GameAction, data: any): void {
    this.wsCmdHandler.sendToSocket(username, { action, ...data });
  }
}
