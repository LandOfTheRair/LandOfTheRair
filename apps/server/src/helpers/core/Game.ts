/* eslint-disable @typescript-eslint/consistent-type-imports */

import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';

import { settingIsAIActive } from '@lotr/content';
import { wsSetHandler } from '@lotr/core';
import type { IServerGame } from '@lotr/interfaces';
import { consoleError, consoleLog, consoleWarn } from '@lotr/logger';
import { EventEmitter, once } from 'events';
import type { IWebsocketCommandHandler } from '../../interfaces';
import { GameEvent } from '../../interfaces';
import type { BaseService } from '../../models/BaseService';
import { EmailHelper, SubscriptionHelper } from '../account';
import {
  AchievementsHelper,
  CharacterHelper,
  CombatHelper,
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
  ContentLoader,
  CorpseManager,
  DarknessHelper,
  EffectManager,
  GroundManager,
  ItemCreator,
  NPCCreator,
  SpellManager,
  WorldManager,
} from '../data';
import { ModKitManager } from '../data/ModKitManager';
import { TestHelper } from '../data/TestHelper';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import { DynamicEventHelper, HolidayHelper, LootHelper } from '../game/tools';
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
import { LoggerInitializer } from './LoggerInitializer';

@Injectable()
export class Game implements IServerGame {
  private ticksElapsed = 1;
  private isReady = false;

  public get isGameReady() {
    return this.isReady;
  }

  private readonly gameEvents = new EventEmitter();

  constructor(
    public loggerInitializer: LoggerInitializer,

    public modkitManager: ModKitManager,
    public contentLoader: ContentLoader,

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
    public lootHelper: LootHelper,
    public holidayHelper: HolidayHelper,
    public movementHelper: MovementHelper,
    public visibilityHelper: VisibilityHelper,
    public interactionHelper: InteractionHelper,
    public itemHelper: ItemHelper,
    public npcHelper: NPCHelper,
    public characterHelper: CharacterHelper,
    public playerHelper: PlayerHelper,
    public inventoryHelper: InventoryHelper,
    public effectHelper: EffectHelper,
    public groundManager: GroundManager,
    public spellManager: SpellManager,
    public lockerHelper: LockerHelper,
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
    public discordHelper: DiscordHelper,
    public rngDungeonGenerator: RNGDungeonGenerator,
    public rngDungeonManager: RNGDungeonManager,

    public guildManager: GuildManager,

    public testHelper: TestHelper,
  ) {}

  public async init(wsCmdHandler: IWebsocketCommandHandler) {
    // this.gameEvents.setMaxListeners(100);

    await this.db.tryConnect('GAME');
    consoleLog('Game:Init', 'Initializing game...');

    wsSetHandler(wsCmdHandler);

    const servicesByPriority: Partial<Record<GameEvent, (keyof Game)[]>> = {
      // these must come first, they are too widely-utilized
      [GameEvent.InitCritical]: [
        'loggerInitializer',
        'modkitManager',
        'contentLoader',
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
        'playerHelper',
        'inventoryHelper',
        'spellManager',
        'achievementsHelper',
        'commandHandler',
        'playerManager',
        'rngDungeonGenerator',
        'rngDungeonManager',
      ],

      // these don't really have anything special, and can be initialized whenever, as their value is mostly at runtime
      [GameEvent.InitChill]: [
        'profanityHelper',
        'migrationHelper',
        'corpseManager',
        'characterRoller',
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
        'lootHelper',
        'movementHelper',
        'visibilityHelper',
        'interactionHelper',
        'characterHelper',
        'itemHelper',
        'npcHelper',
        'effectHelper',
        'lockerHelper',
        'partyHelper',
        'partyManager',
        'trapHelper',
        'messageHelper',
        'traitHelper',
        'stealHelper',
        'testHelper',
      ],
    };

    const timer = new LoggerTimer({
      isActive: !process.env.DISABLE_TIMERS,
      dumpThreshold: 100,
    });

    const initService = async (severity: string, serviceKey: string) => {
      consoleLog(`Game:Init:${severity}`, `Initializing ${serviceKey}...`);

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
      consoleWarn(
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
    consoleLog('Game:Event', `Emitting: ${event}`);
    this.gameEvents.emit(event);
  }

  private setupEmergencyHandlers() {
    consoleLog('Game:Failsafe', 'Emergency handler registered.');
    process.on('exit', (code) => {
      consoleLog('Game:Exit', 'Game is dying');
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
        consoleLog(
          `Game:Exit:${sig}`,
          'Beginning save of players and ground...',
        );
        await Promise.all([
          this.playerManager.saveAllPlayers(),
          this.groundManager.saveAllGround(),
          this.worldDB.saveStopped(),
        ]).then(() => {
          consoleLog('Game:Exit', 'Finished save of players and ground.');
          process.exit(0);
        });
      });
    });
  }

  public addGameEvent(event: GameEvent, callback: () => void): void {
    this.gameEvents.on(event, callback);
  }

  public addGameEventOnce(event: GameEvent, callback: () => void): void {
    this.gameEvents.once(event, callback);
  }

  private loop() {
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
    if (this.ticksElapsed % 20 === 0 && settingIsAIActive()) {
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
        consoleError('CrashRecovery', e as Error);
        this.loop();
      }
    }, 100);
  }
}
