
import { Injectable } from 'injection-js';
import { LoggerTimer } from 'logger-timer';

import { SubscriptionHelper } from '../account';
import { CalculatorHelper, CharacterHelper, CombatHelper, DailyHelper, DamageHelperMagic, DamageHelperOnesided,
  DamageHelperPhysical, DeathHelper, DialogActionHelper, DirectionHelper, EffectHelper, InteractionHelper,
  ItemHelper, MovementHelper, NPCHelper, PlayerHelper, PlayerInventoryHelper, QuestHelper, TargettingHelper,
  TeleportHelper, TraitHelper, VisibilityHelper } from '../character';
import { ProfanityHelper } from '../chat';
import { ConfigManager, ContentManager, CorpseManager, EffectManager,
  GroundManager, ItemCreator, NPCCreator, StaticTextHelper, WorldManager } from '../data';
import { SpellManager } from '../data/SpellManager';
import { CommandHandler, MessageHelper, PlayerManager } from '../game';
import { DiceRollerHelper, HolidayHelper, LootHelper } from '../game/tools';
import { CharacterRoller, LobbyManager } from '../lobby';

import { Database } from './Database';
import { AccountDB, CharacterDB, GroundDB, WorldDB } from './db';
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
    public groundDB: GroundDB,

    public profanityHelper: ProfanityHelper,

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
    public playerInventoryHelper: PlayerInventoryHelper,
    public effectHelper: EffectHelper,
    public groundManager: GroundManager,
    public spellManager: SpellManager,
    public dailyHelper: DailyHelper,

    public messageHelper: MessageHelper,
    public traitHelper: TraitHelper,
    public commandHandler: CommandHandler,

    public playerManager: PlayerManager,
    public worldManager: WorldManager,
    public configManager: ConfigManager

  ) {}

  public async init(wsCmdHandler: WebsocketCommandHandler) {
    this.logger.log('Game:Init', 'Initializing game...');
    this.wsCmdHandler = wsCmdHandler;

    const initOrder = [
      'logger',
      'transmissionHelper',
      'contentManager',
      'db', 'worldDB', 'characterDB', 'accountDB', 'groundDB',
      'profanityHelper', 'effectManager', 'corpseManager',
      'lobbyManager', 'subscriptionHelper',
      'characterRoller',
      'itemCreator', 'dialogActionHelper', 'npcCreator', 'deathHelper', 'targettingHelper', 'teleportHelper',
      'damageHelperOnesided', 'damageHelperMagic', 'damageHelperPhysical', 'combatHelper', 'questHelper',
      'diceRollerHelper', 'lootHelper', 'holidayHelper',
      'movementHelper', 'visibilityHelper', 'directionHelper', 'staticTextHelper', 'interactionHelper',
      'calculatorHelper',
      'characterHelper', 'itemHelper', 'npcHelper', 'playerHelper', 'playerInventoryHelper',
      'effectHelper', 'groundManager', 'spellManager', 'dailyHelper',
      'commandHandler', 'messageHelper', 'traitHelper',
      'playerManager', 'worldManager', 'configManager'
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
          this.playerManager.saveAllPlayers(),
          this.groundManager.saveGround()
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

    const timer = new LoggerTimer({ isActive: process.env.NODE_ENV !== 'production', dumpThreshold: 50 });
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

    // map ticks (npcs)
    if (this.ticksElapsed % 50 === 0) {
      timer.startTimer('corpseTick');
      this.corpseManager.tick(timer);
      timer.stopTimer('corpseTick');
    }

    timer.stopTimer('gameloop');
    timer.dumpTimers();

    this.ticksElapsed++;
    setTimeout(() => this.loop(), 100);
  }
}
