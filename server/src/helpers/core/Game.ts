
import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';

import { GameAction } from '../../interfaces';
import { CalculatorHelper, CharacterHelper, ItemHelper, MovementHelper, NPCHelper, PlayerHelper } from '../character';
import { ProfanityHelper } from '../chat/ProfanityHelper';
import { ContentManager, ItemCreator, NPCCreator, WorldManager } from '../data';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import { CharacterRoller, LobbyManager } from '../lobby';
import { Database } from './Database';
import { AccountDB, CharacterDB, WorldDB } from './db';
import { Logger } from './Logger';
import { WebsocketCommandHandler } from './WebsocketCommandHandler';

@Injectable()
export class Game {

  private ticksElapsed = 0;

  public wsCmdHandler: WebsocketCommandHandler;

  constructor(

    public logger: Logger,
    public contentManager: ContentManager,

    public db: Database,

    public accountDB: AccountDB,
    public characterDB: CharacterDB,
    public worldDB: WorldDB,

    public profanityHelper: ProfanityHelper,

    public lobbyManager: LobbyManager,
    public characterRoller: CharacterRoller,
    public itemCreator: ItemCreator,
    public npcCreator: NPCCreator,

    public movementHelper: MovementHelper,
    public calculatorHelper: CalculatorHelper,
    public itemHelper: ItemHelper,
    public npcHelper: NPCHelper,
    public characterHelper: CharacterHelper,
    public playerHelper: PlayerHelper,

    public messageHelper: MessageHelper,
    public commandHandler: CommandHandler,

    public playerManager: PlayerManager,
    public worldManager: WorldManager

  ) {}

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
      'movementHelper',
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
