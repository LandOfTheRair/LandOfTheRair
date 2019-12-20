
import { LoggerTimer } from 'logger-timer';
import { Inject, Singleton } from 'typescript-ioc';
import { GameAction } from '../../interfaces';
import { CalculatorHelper, CharacterHelper, ItemHelper, NPCHelper, PlayerHelper } from '../character';
import { ProfanityHelper } from '../chat/ProfanityHelper';
import { ContentManager, ItemCreator, NPCCreator, WorldManager } from '../data';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import { CharacterRoller, LobbyManager } from '../lobby';
import { Database } from './Database';
import { AccountDB, CharacterDB, WorldDB } from './db';
import { Logger } from './Logger';
import { WebsocketCommandHandler } from './WebsocketCommandHandler';

@Singleton
export class Game {

  private ticksElapsed = 0;

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

  @Inject public messageHelper: MessageHelper;
  @Inject public commandHandler: CommandHandler;

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
      'commandHandler', 'messageHelper',
      'playerManager', 'worldManager'
  ];

    for (const i of initOrder) {
      this.logger.log('Game', `Initializing ${i}...`);
      this[i].game = this;
      await this[i].init();
    }

    this.loop();
  }

  public loop() {
    const timer = new LoggerTimer({ isActive: process.env.NODE_ENV !== 'production' });
    timer.startTimer('gameloop');

    if (this.ticksElapsed % 2 === 0) {
      timer.startTimer('fastTick');
      this.playerManager.fastTick();
      timer.stopTimer('fastTick');
    }

    if (this.ticksElapsed % 20 === 0) {
      timer.startTimer('slowTick');
      this.playerManager.slowTick();
      timer.stopTimer('slowTick');
    }

    timer.stopTimer('gameloop');
    // timer.dumpTimers();

    this.ticksElapsed++;
    setTimeout(() => this.loop(), 100);
  }

  public sendDataToAccount(username: string, data: any): void {
    this.wsCmdHandler.sendToSocket(username, data);
  }

  public sendActionToAccount(username: string, action: GameAction, data: any): void {
    this.wsCmdHandler.sendToSocket(username, { action, ...data });
  }
}
