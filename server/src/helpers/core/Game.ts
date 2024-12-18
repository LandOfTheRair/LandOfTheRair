import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';
import { GameEvent, IWebsocketCommandHandler } from '../../interfaces';

import { EventEmitter, once } from 'events';
import { BaseService } from '../../models/BaseService';
import { BankHelper, EmailHelper, SubscriptionHelper } from '../account';
import {
  AchievementsHelper,
  CalculatorHelper,
  CharacterHelper,
  CombatHelper,
  CurrencyHelper,
  DailyHelper,
  DamageHelperMagic,
  DamageHelperOnesided,
  DamageHelperPhysical,
  DeathHelper,
  DialogActionHelper,
  EffectHelper,
  InteractionHelper,
  InventoryHelper,
  ItemHelper,
  LockerHelper,
  MigrationHelper,
  MovementHelper,
  NPCHelper,
  PlayerHelper,
  QuestHelper,
  StatisticsHelper,
  StealHelper,
  TargettingHelper,
  TeleportHelper,
  TraitHelper,
  TrapHelper,
  VisibilityHelper,
} from '../character';
import { PartyHelper } from '../character/PartyHelper';
import { PartyManager } from '../character/PartyManager';
import { ProfanityHelper } from '../chat';
import {
  ConfigManager,
  ContentManager,
  CorpseManager,
  DarknessHelper,
  EffectManager,
  GroundManager,
  ItemCreator,
  NPCCreator,
  SpellManager,
  StaticTextHelper,
  WorldManager,
} from '../data';
import { CrashContextManager } from '../data/CrashContextManager';
import { ModKitManager } from '../data/ModKitManager';
import { TestHelper } from '../data/TestHelper';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import {
  DiceRollerHelper,
  DynamicEventHelper,
  HolidayHelper,
  LootHelper,
} from '../game/tools';
import { GuildManager } from '../guild';
import { CharacterRoller, DiscordHelper, LobbyManager } from '../lobby';
import { RNGDungeonGenerator, RNGDungeonManager } from '../rng';
import { Database } from './Database';
import {
  AccountDB,
  CharacterDB,
  EventsDB,
  GroundDB,
  GuildLogsDB,
  GuildsDB,
  LogsDB,
  MarketDB,
  RedeemableDB,
  WorldDB,
} from './db';
import { Logger } from './Logger';
import { TransmissionHelper } from './TransmissionHelper';
import { UserInputHelper } from './UserInputHelper';

@Injectable()
export class Game {
  private ticksElapsed = 1;
  private isReady = false;

  public get isGameReady() {
    return this.isReady;
  }

  public readonly gameEvents = new EventEmitter();

  public wsCmdHandler: IWebsocketCommandHandler;

  constructor(
    public crashContext: CrashContextManager,
    public logger: Logger,
    public transmissionHelper: TransmissionHelper,

    public modkitManager: ModKitManager,
    public contentManager: ContentManager,

    public db: Database,

    public logsDB: LogsDB,
    public accountDB: AccountDB,
    public characterDB: CharacterDB,
    public worldDB: WorldDB,
    public marketDB: MarketDB,
    public groundDB: GroundDB,
    public eventsDB: EventsDB,
    public redeemableDB: RedeemableDB,
    public guildLogsDB: GuildLogsDB,
    public guildsDB: GuildsDB,

    public emailHelper: EmailHelper,
    public profanityHelper: ProfanityHelper,

    public migrationHelper: MigrationHelper,
    public effectManager: EffectManager,
    public corpseManager: CorpseManager,
    public lobbyManager: LobbyManager,
    public subscriptionHelper: SubscriptionHelper,
    public characterRoller: CharacterRoller,
    public currencyHelper: CurrencyHelper,
    public itemCreator: ItemCreator,
    public dialogActionHelper: DialogActionHelper,
    public npcCreator: NPCCreator,

    public deathHelper: DeathHelper,
    public targettingHelper: TargettingHelper,
    public teleportHelper: TeleportHelper,
    public damageHelperOnesided: DamageHelperOnesided,
    public damageHelperMagic: DamageHelperMagic,
    public damageHelperPhysical: DamageHelperPhysical,
    public combatHelper: CombatHelper,
    public questHelper: QuestHelper,
    public diceRollerHelper: DiceRollerHelper,
    public lootHelper: LootHelper,
    public holidayHelper: HolidayHelper,
    public movementHelper: MovementHelper,
    public visibilityHelper: VisibilityHelper,
    public staticTextHelper: StaticTextHelper,
    public interactionHelper: InteractionHelper,
    public calculatorHelper: CalculatorHelper,
    public itemHelper: ItemHelper,
    public npcHelper: NPCHelper,
    public characterHelper: CharacterHelper,
    public playerHelper: PlayerHelper,
    public inventoryHelper: InventoryHelper,
    public effectHelper: EffectHelper,
    public groundManager: GroundManager,
    public spellManager: SpellManager,
    public dailyHelper: DailyHelper,
    public bankHelper: BankHelper,
    public lockerHelper: LockerHelper,
    public statisticsHelper: StatisticsHelper,
    public partyHelper: PartyHelper,
    public partyManager: PartyManager,
    public darknessHelper: DarknessHelper,
    public trapHelper: TrapHelper,
    public achievementsHelper: AchievementsHelper,

    public messageHelper: MessageHelper,
    public dynamicEventHelper: DynamicEventHelper,
    public traitHelper: TraitHelper,
    public stealHelper: StealHelper,
    public commandHandler: CommandHandler,

    public playerManager: PlayerManager,
    public worldManager: WorldManager,
    public configManager: ConfigManager,
    public userInputHelper: UserInputHelper,
    public discordHelper: DiscordHelper,
    public rngDungeonGenerator: RNGDungeonGenerator,
    public rngDungeonManager: RNGDungeonManager,

    public guildManager: GuildManager,

    public testHelper: TestHelper,
  ) {}

  public async init(wsCmdHandler: IWebsocketCommandHandler) {
    // this.gameEvents.setMaxListeners(100);

    await this.db.tryConnect('GAME');
    this.logger.log('Game:Init', 'Initializing game...');
    this.wsCmdHandler = wsCmdHandler;

    const servicesByPriority: Partial<Record<GameEvent, (keyof Game)[]>> = {
      // these must come first, they are too widely-utilized
      [GameEvent.InitCritical]: [
        'logger',
        'modkitManager',
        'contentManager',
        'db',
      ],

      // these come second, and are fairly important. right now, that is relegated to databases
      [GameEvent.InitImportant]: [
        'logsDB',
        'worldDB',
        'marketDB',
        'characterDB',
        'accountDB',
        'groundDB',
        'eventsDB',
        'redeemableDB',
        'guildLogsDB',
        'guildsDB',
      ],

      // these have init functions that have promises in them, or other big blobs of logic
      [GameEvent.InitModerate]: [
        'emailHelper',
        'lobbyManager',
        'subscriptionHelper',
        'groundManager',
        'dynamicEventHelper',
        'darknessHelper',
        'worldManager',
        'discordHelper',
        'guildManager',
      ],

      // these have init functions that do something, but nothing awaitable
      [GameEvent.InitNormal]: [
        'effectManager',
        'holidayHelper',
        'staticTextHelper',
        'playerHelper',
        'inventoryHelper',
        'spellManager',
        'achievementsHelper',
        'commandHandler',
        'playerManager',
        'configManager',
        'rngDungeonGenerator',
        'rngDungeonManager',
      ],

      // these don't really have anything special, and can be initialized whenever, as their value is mostly at runtime
      [GameEvent.InitChill]: [
        'crashContext',
        'transmissionHelper',
        'profanityHelper',
        'migrationHelper',
        'corpseManager',
        'characterRoller',
        'currencyHelper',
        'itemCreator',
        'dialogActionHelper',
        'npcCreator',
        'deathHelper',
        'targettingHelper',
        'teleportHelper',
        'damageHelperOnesided',
        'damageHelperMagic',
        'damageHelperPhysical',
        'combatHelper',
        'questHelper',
        'diceRollerHelper',
        'lootHelper',
        'movementHelper',
        'visibilityHelper',
        'interactionHelper',
        'calculatorHelper',
        'characterHelper',
        'itemHelper',
        'npcHelper',
        'effectHelper',
        'dailyHelper',
        'bankHelper',
        'lockerHelper',
        'statisticsHelper',
        'partyHelper',
        'partyManager',
        'trapHelper',
        'messageHelper',
        'traitHelper',
        'stealHelper',
        'userInputHelper',
        'testHelper',
      ],
    };

    const timer = new LoggerTimer({
      isActive: !process.env.DISABLE_TIMERS,
      dumpThreshold: 100,
    });

    const initService = async (severity: string, serviceKey: string) => {
      this.logger.log(`Game:Init:${severity}`, `Initializing ${serviceKey}...`);

      const service = this[serviceKey] as BaseService;

      service.game = this;

      timer.startTimer(`init-${serviceKey}`);
      await service.init();
      timer.stopTimer(`init-${serviceKey}`);
    };

    this.gameEvents.once(GameEvent.InitCritical, async () => {
      const allPromises = (
        servicesByPriority[GameEvent.InitCritical] ?? []
      ).map((service) => initService('Critical', service));

      await Promise.all(allPromises);

      this.emit(GameEvent.InitImportant);
    });

    this.gameEvents.once(GameEvent.InitImportant, async () => {
      const allPromises = (
        servicesByPriority[GameEvent.InitImportant] ?? []
      ).map((service) => initService('Important', service));

      await Promise.all(allPromises);

      this.emit(GameEvent.InitModerate);
    });

    this.gameEvents.once(GameEvent.InitModerate, async () => {
      const allPromises = (
        servicesByPriority[GameEvent.InitModerate] ?? []
      ).map((service) => initService('Moderate', service));

      await Promise.all(allPromises);

      this.emit(GameEvent.InitNormal);
    });

    this.gameEvents.once(GameEvent.InitNormal, async () => {
      const allPromises = (servicesByPriority[GameEvent.InitNormal] ?? []).map(
        (service) => initService('Normal', service),
      );

      await Promise.all(allPromises);

      this.emit(GameEvent.InitChill);
    });

    this.gameEvents.once(GameEvent.InitChill, async () => {
      const allPromises = (servicesByPriority[GameEvent.InitChill] ?? []).map(
        (service) => initService('Chill', service),
      );

      await Promise.all(allPromises);

      this.emit(GameEvent.GameStarted);
    });

    this.emit(GameEvent.InitCritical);

    await once(this.gameEvents, GameEvent.GameStarted);

    timer.dumpTimers();

    if (this.worldDB.running) {
      this.logger.error(
        'Game:Init',
        'Warning: the last shutdown was unsafe. Data may have been lost.',
      );
    }

    this.worldDB.saveRunning();

    this.setupEmergencyHandlers();

    this.isReady = true;

    this.worldManager.initAllMaps();
    this.loop();
  }

  private emit(event: GameEvent): void {
    this.logger.log('Game:Event', `Emitting: ${event}`);
    this.gameEvents.emit(event);
  }

  private setupEmergencyHandlers() {
    this.logger.log('Game:Failsafe', 'Emergency handler registered.');
    process.on('exit', (code) => {
      this.logger.log('Game:Exit', 'Game is dying');
      console.log(`About to exit with code: ${code}`);
    });

    [
      'SIGHUP',
      'SIGINT',
      'SIGQUIT',
      'SIGTRAP',
      'SIGABRT',
      'SIGBUS',
      'SIGFPE',
      'SIGUSR1',
      'SIGSEGV',
      'SIGUSR2',
      'SIGTERM',
    ].forEach((sig) => {
      process.on(sig as any, async () => {
        this.logger.log(
          `Game:Exit:${sig}`,
          'Beginning save of players and ground...',
        );
        await Promise.all([
          this.playerManager.saveAllPlayers(),
          this.groundManager.saveAllGround(),
          this.worldDB.saveStopped(),
        ]).then(() => {
          this.logger.log('Game:Exit', 'Finished save of players and ground.');
          process.exit(0);
        });
      });
    });
  }

  public loop() {
    const trueTick = this.ticksElapsed / 10;

    const timer = new LoggerTimer({
      isActive: !process.env.DISABLE_TIMERS,
      dumpThreshold: 250,
    });

    const now = Date.now();

    timer.startTimer(`gameloop-${now}`);

    // fast tick actions
    if (this.ticksElapsed % 2 === 0) {
      timer.startTimer(`fastTick-${now}`);
      this.playerManager.fastTick(timer, trueTick);
      timer.stopTimer(`fastTick-${now}`);
    }

    // slow tick actions
    if (this.ticksElapsed % 10 === 0) {
      timer.startTimer(`slowTick-${now}`);
      this.playerManager.slowTick(timer, trueTick);
      this.groundManager.tick(timer);
      this.partyManager.tick(timer);
      timer.stopTimer(`slowTick-${now}`);
    }

    // spawner tick - manage/generate spawners
    if (this.ticksElapsed % 5 === 0) {
      timer.startTimer(`spawnerTick-${now}`);
      this.worldManager.spawnerTick(timer);
      timer.stopTimer(`spawnerTick-${now}`);
    }

    // world steady tick actions
    if (this.ticksElapsed % 10 === 0) {
      timer.startTimer(`steadyTick-${now}`);
      this.worldManager.steadyTick(timer);
      timer.stopTimer(`steadyTick-${now}`);
    }

    // map ticks (npcs)
    if (this.ticksElapsed % 20 === 0 && this.configManager.isAIActive) {
      timer.startTimer(`npcTick-${now}`);
      this.worldManager.npcTick(timer);
      timer.stopTimer(`npcTick-${now}`);
    }

    // map ticks (corpses) & event tick
    if (this.ticksElapsed % 50 === 0) {
      timer.startTimer(`corpseTick-${now}`);
      this.corpseManager.tick(timer);
      timer.stopTimer(`corpseTick-${now}`);

      timer.startTimer(`darknessTick-${now}`);
      this.darknessHelper.tick(timer);
      timer.stopTimer(`darknessTick-${now}`);

      timer.startTimer(`dynamicEventTick-${now}`);
      this.dynamicEventHelper.tick(timer);
      timer.stopTimer(`dynamicEventTick-${now}`);

      timer.startTimer(`rngDungeonTick-${now}`);
      this.rngDungeonManager.tick(timer);
      timer.stopTimer(`rngDungeonTick-${now}`);
    }

    timer.stopTimer(`gameloop-${now}`);
    timer.dumpTimers((str) => {
      this.logsDB.addLogEntry(str);
    });

    this.ticksElapsed++;
    setTimeout(() => {
      try {
        this.loop();
      } catch (e) {
        this.logger.error('CrashRecovery', e);
        this.loop();
      }
    }, 100);
  }
}
