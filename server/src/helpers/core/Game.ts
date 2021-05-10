
import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';
import { IWebsocketCommandHandler } from '../../interfaces/internal';

import { BankHelper, EmailHelper, SubscriptionHelper } from '../account';
import { CalculatorHelper, CharacterHelper, CombatHelper, CurrencyHelper, DailyHelper, DamageHelperMagic, DamageHelperOnesided,
  DamageHelperPhysical, DeathHelper, DialogActionHelper, EffectHelper, InteractionHelper,
  InventoryHelper, ItemHelper, LockerHelper, MovementHelper, NPCHelper, PlayerHelper,
  QuestHelper, StatisticsHelper, StealHelper, TargettingHelper,
  TeleportHelper, TraitHelper, TrapHelper, VisibilityHelper } from '../character';
import { PartyHelper } from '../character/PartyHelper';
import { PartyManager } from '../character/PartyManager';
import { ProfanityHelper } from '../chat';
import { ConfigManager, ContentManager, CorpseManager, DarknessHelper, EffectManager,
  GroundManager, ItemCreator, NPCCreator, SpellManager, StaticTextHelper, WorldManager } from '../data';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import { DynamicEventHelper, DiceRollerHelper, HolidayHelper, LootHelper } from '../game/tools';
import { CharacterRoller, DiscordHelper, LobbyManager } from '../lobby';
import { Database } from './Database';
import { AccountDB, CharacterDB, EventsDB, GroundDB, MarketDB, WorldDB } from './db';
import { Logger } from './Logger';
import { TransmissionHelper } from './TransmissionHelper';
import { UserInputHelper } from './UserInputHelper';

@Injectable()
export class Game {

  private ticksElapsed = 0;

  public wsCmdHandler: IWebsocketCommandHandler;

  constructor(

    public logger: Logger,
    public transmissionHelper: TransmissionHelper,
    public contentManager: ContentManager,

    public db: Database,

    public accountDB: AccountDB,
    public characterDB: CharacterDB,
    public worldDB: WorldDB,
    public marketDB: MarketDB,
    public groundDB: GroundDB,
    public eventsDB: EventsDB,

    public emailHelper: EmailHelper,
    public profanityHelper: ProfanityHelper,

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

    public messageHelper: MessageHelper,
    public dynamicEventHelper: DynamicEventHelper,
    public traitHelper: TraitHelper,
    public stealHelper: StealHelper,
    public commandHandler: CommandHandler,

    public playerManager: PlayerManager,
    public worldManager: WorldManager,
    public configManager: ConfigManager,
    public userInputHelper: UserInputHelper,
    public discordHelper: DiscordHelper

  ) {}

  public async init(wsCmdHandler: IWebsocketCommandHandler) {
    await this.db.tryConnect('GAME');
    this.logger.log('Game:Init', 'Initializing game...');
    this.wsCmdHandler = wsCmdHandler;

    const initOrder = [
      'logger',
      'transmissionHelper',
      'contentManager',
      'db', 'worldDB', 'marketDB', 'characterDB', 'accountDB', 'groundDB', 'eventsDB',
      'emailHelper', 'profanityHelper', 'effectManager', 'corpseManager',
      'lobbyManager', 'subscriptionHelper',
      'characterRoller', 'currencyHelper',
      'itemCreator', 'dialogActionHelper', 'npcCreator', 'deathHelper', 'targettingHelper', 'teleportHelper',
      'damageHelperOnesided', 'damageHelperMagic', 'damageHelperPhysical', 'combatHelper', 'questHelper',
      'diceRollerHelper', 'lootHelper', 'holidayHelper',
      'movementHelper', 'visibilityHelper', 'staticTextHelper', 'interactionHelper',
      'calculatorHelper',
      'characterHelper', 'itemHelper', 'npcHelper', 'playerHelper', 'inventoryHelper',
      'effectHelper', 'groundManager', 'spellManager', 'dailyHelper', 'bankHelper', 'lockerHelper',
      'statisticsHelper', 'partyHelper', 'partyManager', 'darknessHelper', 'trapHelper',
      'commandHandler', 'messageHelper', 'dynamicEventHelper', 'traitHelper', 'stealHelper',
      'playerManager', 'worldManager', 'configManager', 'userInputHelper',
      'discordHelper'
    ];

    for (const i of initOrder) {
      this.logger.log('Game:Init', `Initializing ${i}...`);
      this[i].game = this;
      await this[i].init();
    }

    if (this.worldDB.running) {
      this.logger.error('Game:Init', 'Warning: the last shutdown was unsafe. Data may have been lost.');
    }

    this.worldDB.saveRunning();

    this.setupEmergencyHandlers();

    this.loop();
  }

  private setupEmergencyHandlers() {
    this.logger.log('Game:Failsafe', 'Emergency handler registered.');
    process.on('exit', (code) => {
      this.logger.log('Game:Exit', 'Game is dying');
      console.log(`About to exit with code: ${code}`);
    });

    [
      'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach((sig) => {
      process.on(sig as any, async () => {
        this.logger.log(`Game:Exit:${sig}`, 'Beginning save of players and ground...');
        await Promise.all([
          this.playerManager.saveAllPlayers(),
          this.groundManager.saveAllGround(),
          this.worldDB.saveStopped()
        ])
          .then(() => {
            this.logger.log('Game:Exit', 'Finished save of players and ground.');
            process.exit(0);
          });
      });
    });
  }

  public loop() {
    const trueTick = this.ticksElapsed / 10;

    const timer = new LoggerTimer({ isActive: !process.env.DISABLE_TIMERS, dumpThreshold: 250 });
    timer.startTimer('gameloop');

    // fast tick actions
    if (this.ticksElapsed % 2 === 0) {
      timer.startTimer('fastTick');
      this.playerManager.fastTick(timer, trueTick);
      timer.stopTimer('fastTick');
    }

    // slow tick actions
    if (this.ticksElapsed % 10 === 0) {
      timer.startTimer('slowTick');
      this.playerManager.slowTick(timer, trueTick);
      this.groundManager.tick(timer);
      this.partyManager.tick(timer);
      timer.stopTimer('slowTick');
    }

    // world steady tick actions
    if (this.ticksElapsed % 10 === 0) {
      timer.startTimer('steadyTick');
      this.worldManager.steadyTick(timer);
      timer.stopTimer('steadyTick');
    }

    // map ticks (npcs)
    if (this.ticksElapsed % 20 === 0) {
      timer.startTimer('npcTick');
      this.worldManager.npcTick(timer);
      timer.stopTimer('npcTick');
    }

    // map ticks (corpses) & event tick
    if (this.ticksElapsed % 50 === 0) {
      timer.startTimer('corpseTick');
      this.corpseManager.tick(timer);
      timer.stopTimer('corpseTick');

      timer.startTimer('darknessTick');
      this.darknessHelper.tick(timer);
      timer.stopTimer('darknessTick');

      timer.startTimer('dynamicEventTick');
      this.dynamicEventHelper.tick(timer);
      timer.stopTimer('dynamicEventTick');
    }

    timer.stopTimer('gameloop');
    timer.dumpTimers();

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
