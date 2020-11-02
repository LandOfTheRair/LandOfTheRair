
import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';
import { SubscriptionHelper } from '../account';

import { CalculatorHelper, CharacterHelper, DirectionHelper, InteractionHelper,
  ItemHelper, MovementHelper, NPCHelper, PlayerHelper, TargettingHelper, VisibilityHelper } from '../character';
import { ProfanityHelper } from '../chat';
import { ContentManager, ItemCreator, NPCCreator, StaticTextHelper, WorldManager } from '../data';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import { DiceRollerHelper, HolidayHelper, LootHelper } from '../game/tools';
import { CharacterRoller, LobbyManager } from '../lobby';
import { Database } from './Database';
import { AccountDB, CharacterDB, WorldDB } from './db';
import { Logger } from './Logger';
import { TransmissionHelper } from './TransmissionHelper';
import { WebsocketCommandHandler } from './WebsocketCommandHandler';

@Injectable()
export class Game {

  private ticksElapsed = 0;

  public wsCmdHandler: WebsocketCommandHandler;

  constructor(

    public logger: Logger,
    public transmissionHelper: TransmissionHelper,
    public contentManager: ContentManager,

    public db: Database,

    public accountDB: AccountDB,
    public characterDB: CharacterDB,
    public worldDB: WorldDB,

    public profanityHelper: ProfanityHelper,

    public lobbyManager: LobbyManager,
    public subscriptionHelper: SubscriptionHelper,
    public characterRoller: CharacterRoller,
    public itemCreator: ItemCreator,
    public npcCreator: NPCCreator,

    public targettingHelper: TargettingHelper,
    public diceRollerHelper: DiceRollerHelper,
    public lootHelper: LootHelper,
    public holidayHelper: HolidayHelper,
    public movementHelper: MovementHelper,
    public visibilityHelper: VisibilityHelper,
    public directionHelper: DirectionHelper,
    public staticTextHelper: StaticTextHelper,
    public interactionHelper: InteractionHelper,
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
      'transmissionHelper',
      'contentManager',
      'db', 'worldDB', 'characterDB', 'accountDB',
      'profanityHelper',
      'lobbyManager', 'subscriptionHelper',
      'characterRoller',
      'itemCreator', 'npcCreator', 'targettingHelper',
      'diceRollerHelper', 'lootHelper', 'holidayHelper',
      'movementHelper', 'visibilityHelper', 'directionHelper', 'staticTextHelper',
      'calculatorHelper',
      'characterHelper', 'itemHelper', 'npcHelper', 'playerHelper',
      'commandHandler', 'messageHelper',
      'playerManager', 'worldManager'
  ];

    for (const i of initOrder) {
      this.logger.log('Game:Init', `Initializing ${i}...`);
      this[i].game = this;
      await this[i].init();
    }

    this.setupEmergencyHandlers();

    this.loop();
  }

  private setupEmergencyHandlers() {
    [
      'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGKILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach((sig) => {
      process.on(sig as any, () => {
        this.logger.log(`Game:Exit:${sig}`, 'Beginning save of players and ground...');
        Promise.all([
          this.playerManager.saveAllPlayers()
          // TODO: save ground
        ])
        .then(() => {
          this.logger.log('Game:Exit', 'Finished save of players and ground.');
          process.exit(0);
        });
      });
    });
  }

  public loop() {
    const timer = new LoggerTimer({ isActive: process.env.NODE_ENV !== 'production', dumpThreshold: 50 });
    timer.startTimer('gameloop');

    // fast tick actions
    if (this.ticksElapsed % 2 === 0) {
      timer.startTimer('fastTick');
      this.playerManager.fastTick();
      timer.stopTimer('fastTick');
    }

    // slow tick actions
    if (this.ticksElapsed % 10 === 0) {
      timer.startTimer('slowTick');
      this.playerManager.slowTick();
      timer.stopTimer('slowTick');
    }

    // world steady tick actions
    if (this.ticksElapsed % 10 === 0) {
      timer.startTimer('steadyTick');
      this.worldManager.steadyTick();
      timer.stopTimer('steadyTick');
    }

    // map ticks (npcs)
    if (this.ticksElapsed % 20 === 0) {
      timer.startTimer('npcTick');
      this.worldManager.npcTick();
      timer.stopTimer('npcTick');
    }

    timer.stopTimer('gameloop');
    timer.dumpTimers();

    this.ticksElapsed++;
    setTimeout(() => this.loop(), 100);
  }
}
