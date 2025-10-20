import { IAccount } from './account';
import { IAI } from './ai';
import { BaseClass, ItemSlot, Rollable, Stat } from './building-blocks';
import { ICharacter, IItemContainer } from './character';
import { OnesidedDamageArgs } from './combat';
import { IDynamicEvent, IDynamicEventMeta } from './dynamicevent';
import { IItemEffect } from './effect';
import { IGround, IGroundItem } from './ground';
import { GuildRole, IGuild, IGuildMember } from './guild';
import { IItemDefinition, IItemRequirements, ISimpleItem } from './item';
import { ItemClass } from './itemtypes';
import { IMacroCommandArgs } from './macro';
import { IMapData, IMapProperties, ObjectType } from './map';
import { IMarketItemInfo, IMarketListing, IMarketPickup } from './market';
import { MessageInfo, MessageType, MessageVFX } from './messages';
import { INPC, INPCDefinition, INPCScript } from './npc';
import { IParty, IPartyMember } from './party';
import { IPlayer } from './player';
import { IPosition } from './position';
import { IQuest } from './quest';
import { IRecipe } from './recipe';
import { IRNGDungeonMetaConfig, ISpoilerLog } from './rngdungeon';
import { ISerializableSpawner, ISpawnerData } from './spawner';
import { ISpellData } from './spell';
import { IStatusEffect } from './status-effect';
import { IWebsocketCommandHandler } from './websocket';

// Extended position interface for movement operations
export interface IMapPosition extends IPosition {
  map: string;
}

// Map state interface for map management
export interface IMapState {
  readonly allNPCS: INPC[];
  readonly allPlayers: IPlayer[];
  readonly allSpawners: ISpawner[];
  init(): void;
  addSpawner(spawner: ISpawner): void;
  removeSpawner(spawner: ISpawner): void;
  getSerializableSpawners(): ISerializableSpawner[];
  isDoorOpen(id: number): boolean;
  openDoor(id: number): void;
  closeDoor(id: number): void;
  setDoorState(id: number, state: boolean): void;
  steadyTick(timer: any): void;
  npcTick(): void;
  isAnyNPCWithId(npcId: string): INPC | undefined;
  getPlayerKnowledgeForXY(x: number, y: number): Record<string, any>;
  getPlayerObjectsWithKnowledgeForXY(x: number, y: number): IPlayer[];
  isThereAnyKnowledgeForXY(x: number, y: number): boolean;
  getAllPlayersInRange(
    ref: { x: number; y: number },
    radius: number,
  ): IPlayer[];
  getPlayersInRange(
    ref: ICharacter,
    radius: number,
    except?: string[],
    useSight?: boolean,
  ): ICharacter[];
  getAllInRangeRaw(
    ref: { x: number; y: number },
    radius: number,
    except?: string[],
  ): ICharacter[];
  getAllInRange(
    ref: ICharacter,
    radius: number,
    except?: string[],
    useSight?: boolean,
  ): ICharacter[];
  getAllInRangeForAOE(
    ref: ICharacter | { x: number; y: number; map: string },
    radius: number,
    except?: string[],
  ): ICharacter[];
  getAllInRangeWithoutVisibilityTo(
    ref: ICharacter,
    radius: number,
    except?: string[],
  ): ICharacter[];
  getAllHostilesInRange(
    ref: ICharacter,
    radius: number,
    useSight?: boolean,
  ): ICharacter[];
  getAllHostilesWithoutVisibilityTo(
    ref: ICharacter,
    radius: number,
  ): ICharacter[];
  getAllHostilesWithoutVisibilityToInFOV(
    ref: ICharacter,
    radius: number,
  ): ICharacter[];
  getAllAlliesInRange(ref: ICharacter, radius: number): ICharacter[];
  getPossibleTargetsFor(me: INPC, radius?: number): ICharacter[];
  getPlayersToUpdate(x: number, y: number): IPlayer[];
  moveNPCOrPlayer(
    character: ICharacter,
    options: { oldX: number; oldY: number },
  ): void;
  triggerAndSendUpdate(x: number, y: number, triggeringPlayer?: IPlayer): void;
  triggerAndSendUpdateWithFOV(
    x: number,
    y: number,
    triggeringPlayer?: IPlayer,
  ): void;
  triggerFullUpdateForPlayer(player: IPlayer): void;
  addPlayer(player: IPlayer): void;
  removePlayer(player: IPlayer): void;
  addNPC(npc: INPC, spawner: ISpawner): void;
  removeNPC(npc: INPC): void;
  removeAllNPCs(): void;
  getCharacterByUUID(uuid: string): ICharacter | undefined;
  getNPCSpawner(uuid: string): ISpawner | undefined;
  getNPCSpawnerByName(name: string): ISpawner | undefined;
  getNPCSpawnersByName(name: string): ISpawner[];
  getGroundVision(x: number, y: number, radius?: number): IGround;
  addItemsToGroundSpread(
    itemlocs: Array<{ x: number; y: number; item: ISimpleItem }>,
    center: { x: number; y: number },
    radius?: number,
    forceSave?: boolean,
  ): void;
  addItemsToGround(
    x: number,
    y: number,
    items: ISimpleItem[],
    forceSave?: boolean,
  ): void;
  addItemToGround(
    x: number,
    y: number,
    item: ISimpleItem,
    forceSave?: boolean,
  ): void;
  getEntireGround(x: number, y: number): Record<ItemClass, IGroundItem[]>;
  getItemsFromGround(
    x: number,
    y: number,
    itemClass: ItemClass,
    uuid?: string,
  ): IGroundItem[];
  removeItemsFromGround(x: number, y: number, items: IGroundItem[]): void;
  removeItemFromGround(
    x: number,
    y: number,
    itemClass: ItemClass,
    uuid: string,
    count?: number,
  ): void;
  triggerNPCAndPlayerUpdateInRadius(x: number, y: number): void;
  triggerNPCUpdateInRadius(x: number, y: number): void;
  triggerPlayerUpdateInRadius(x: number, y: number): void;
  triggerGroundUpdateInRadius(x: number, y: number): void;
  handleEvent(event: string, trigger: ICharacter): void;
}

// Redeemable data interface
export interface IRedeemable {
  _id?: any;
  timestamp: number;
  code: string;
  forAccountName?: string;
  maxUses?: number;
  expiresAt?: number;
  claimedBy: string[];
  gold?: number;
  item?: string;
}

// Spawner interface for world spawners
export interface ISpawner {
  readonly id: string;
  readonly areAnyNPCsAlive: boolean;
  readonly canBeSaved: boolean;
  readonly walkingAttributes: { randomWalkRadius: number; leashRadius: number };
  readonly hasPaths: boolean;
  readonly pos: { x: number; y: number };
  readonly spawnerName: string;
  readonly currentTickForSave: number;
  readonly areCreaturesDangerous: boolean;
  readonly allNPCS: INPC[];
  readonly respawnTimeSeconds: number;
  readonly respectsKnowledge: boolean;
  readonly allPossibleNPCSpawns: INPCDefinition[];
  readonly mapName: string;

  tryInitialSpawn(): void;
  setTick(tick: number): void;
  steadyTick(): void;
  npcTick(): void;
  getNPCAI(npcUUID: string): IAI;
  forceSpawnNPC(opts?: {
    npcId?: string;
    npcDef?: INPCDefinition;
    spawnLoc?: { x: number; y: number };
    createCallback?: (npc: INPC) => void;
  }): INPC | null;
  getRandomPath(): string;
  increaseTick(by?: number): void;
}

// WorldMap interface for map management
export interface IWorldMap {
  // Properties
  readonly width: number;
  readonly height: number;
  readonly mapData: IMapData;
  readonly properties: IMapProperties;
  readonly region: string;
  readonly holiday: string | undefined;
  readonly maxSkill: number;
  readonly maxSkillExp: number;
  readonly maxLevel: number;
  readonly firstCutExp: number;
  readonly secondCutExp: number;
  readonly maxLevelExp: number;
  readonly maxCreatures: number;
  readonly disableCreatureRespawn: boolean;
  readonly canSpawnCreatures: boolean;
  readonly decayRateHours: number;
  readonly decayCheckMinutes: number;
  readonly maxItemsOnGround: number;
  readonly subscriberOnly: boolean;
  readonly respawnPoint: { map: string; x: number; y: number };
  readonly exitPoint: { kickMap: string; kickX: number; kickY: number } | null;
  readonly gearDropPoint: {
    gearDropMap: string;
    gearDropX: number;
    gearDropY: number;
  } | null;
  readonly canMemorize: boolean;
  readonly canPartyAction: boolean;
  readonly script: string;
  readonly fovCalculator: any; // Mrpas instance
  readonly mapDroptables: any;
  readonly regionDroptables: any;
  readonly allSpawners: any[];
  readonly allDefaultNPCs: any[];
  readonly name: string;
  readonly tiledJSON: any;

  // Teleport and navigation
  getTeleportTagRef(ref: string): { x: number; y: number } | undefined;

  // Tile information methods
  getTerrainAt(x: number, y: number): number;
  getFloorAt(x: number, y: number): number;
  getFluidAt(x: number, y: number): number;
  getFoliageAt(x: number, y: number): number;
  getWallAt(x: number, y: number): number;
  getDecorAt(x: number, y: number): any | null;
  getDenseDecorAt(x: number, y: number): any | null;
  getOpaqueDecorAt(x: number, y: number): any | null;
  getInteractableAt(x: number, y: number): any | null;
  getNPCAt(x: number, y: number): any | null;
  getSpawnerAt(x: number, y: number): any | null;
  getRegionDescriptionAt(x: number, y: number): any;
  getRegionNameAt(x: number, y: number): any;
  getBackgroundMusicAt(x: number, y: number): string;
  getSuccorportPropertiesAt(x: number, y: number): any | null;
  getInteractableOfTypeAt(x: number, y: number, type: ObjectType): any | null;
  getInteractableOrDenseObject(x: number, y: number): any;
  getZLevelAt(x: number, y: number): number;

  // Object finding methods
  findDoorById(id: number): any;
  findAllDecorByName(name: string): any[];
  findInteractableByName(name: string): any;

  // Collision and visibility checking
  checkIfDenseObjectAt(x: number, y: number): boolean;
  checkIfActualWallAt(
    x: number,
    y: number,
    shouldAirCountForWall?: boolean,
  ): boolean;
  checkIfHideableTileAt(
    x: number,
    y: number,
    shouldAirCountForWall?: boolean,
  ): boolean;
  checkIfCanHideAt(
    x: number,
    y: number,
    shouldAirCountForWall?: boolean,
  ): boolean;

  // Pathfinding
  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): Array<{ x: number; y: number }> | undefined;
  findPathExcludingWalls(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): Array<{ x: number; y: number }> | undefined;

  // Player actions
  canSuccor(player: IPlayer): boolean;
  canTeleport(player: IPlayer): boolean;
}

// Base interface for all game services
export interface IGameService {
  game?: IServerGame;
  init(): Promise<void> | void;
}

// Core service interfaces
export interface ILoggerInitializer extends IGameService {}

export interface IModKitManager extends IGameService {
  readonly modNPCs: INPCDefinition[];
  readonly modSpawners: ISpawnerData[];
  readonly modItems: IItemDefinition[];
  readonly modMapDrops: Array<{ mapName: string; drops: Rollable[] }>;
  readonly modRegionDrops: Array<{
    regionName: string;
    drops: Rollable[];
  }>;
  readonly modNPCScripts: INPCScript[];
  readonly modQuests: IQuest[];
  readonly modRecipes: IRecipe[];
  readonly loadMods: string[];
}

export interface IContentLoader extends IGameService {
  reload(): Promise<unknown>;
}

export interface IDatabase extends IGameService {
  tryConnect(source: string): Promise<void>;
  getCollection(entity: any): any;
  getCollectionByName(name: string): any;
  findSingle<T>(T: any, filter: any): Promise<T | null>;
  removeSingle<T>(T: any, filter: any): Promise<any>;
  findUser(username: string): Promise<IAccount | null>;
  findUserByEmail(email: string): Promise<IAccount | null>;
  findMany<T>(T: any, filter: any): Promise<T[]>;
  getPersistObject(entity: any): any;
  save(entity: any): Promise<any>;
  delete(entity: any): Promise<any>;
  prepareForTransmission(entity: any): any;
}

// Database service interfaces
export interface ILogsDB extends IGameService {
  addLogEntry(message: string, extraData?: any): Promise<void>;
}

export interface IAccountDB extends IGameService {
  doesAccountExist(username: string): Promise<IAccount | null>;
  doesAccountExistEmail(email: string): Promise<IAccount | null>;
  doesDiscordTagExist(discordTag: string): Promise<IAccount | null>;
  getAccountForLoggingIn(username: string): Promise<IAccount | null>;
  getAccountUsernameForEmail(email: string): Promise<string>;
  getAccount(username: string): Promise<IAccount | null>;
  registerIP(username: string, ip: string): Promise<any>;
  createAccount(accountInfo: IAccount): Promise<IAccount | null>;
  simpleAccount(account: IAccount): Partial<IAccount>;
  checkPassword(accountInfo: IAccount, account: IAccount): boolean;
  checkPasswordString(account: IAccount, passwordCheck: string): boolean;
  saveAccount(account: IAccount): Promise<void>;
  changePassword(account: IAccount, newPassword: string): Promise<void>;
  changeEmail(account: IAccount, newEmail: string): Promise<void>;
  verifyEmail(account: IAccount): Promise<void>;
  changeAlwaysOnline(account: IAccount, alwaysOnline: boolean): Promise<void>;
  changeEventWatcher(account: IAccount, eventWatcher: boolean): Promise<void>;
  toggleTester(account: IAccount): Promise<void>;
  toggleGM(account: IAccount): Promise<void>;
  toggleMute(account: IAccount): Promise<void>;
  ban(account: IAccount): Promise<void>;
  changeDiscordTag(account: IAccount, discordTag: string): Promise<void>;
  setTemporaryPassword(email: string, password: string): Promise<any>;
}

export interface ICharacterDB extends IGameService {
  createCharacter(account: IAccount, options: any): Promise<IPlayer>;
  loadPlayers(account: IAccount): Promise<IPlayer[]>;
  reloadPlayerAccountInfo(player: IPlayer, account: IAccount): Promise<void>;
  loadPlayerDailyInfo(player: IPlayer, account: IAccount): Promise<void>;
  populatePlayer(player: IPlayer, account: IAccount): Promise<void>;
  deletePlayer(player: IPlayer): Promise<void>;
  saveAllPlayers(players: IPlayer[]): Promise<any>;
  savePlayer(player: IPlayer): Promise<void>;
}

export interface IWorldDB extends IGameService {
  readonly motd: string;
  readonly running: boolean;
  loadSettings(): Promise<void>;
  saveRunning(): Promise<void>;
  saveStopped(): Promise<void>;
  setMOTD(motd: string): void;
  setSpellMultiplierOverride(spell: string, multiplier: number): Promise<void>;
  getSpellMultiplierOverride(spell: string): number;
  getAllSpellMultiplierOverrides(): Record<string, number>;
  setMapBonusXPSkillGain(map: string): Promise<void>;
  isMapBonusXPSkillGain(map: string): boolean;
}

export interface IMarketDB extends IGameService {
  getListingById(id: string): Promise<IMarketListing | null>;
  getPickupById(id: string): Promise<IMarketPickup | null>;
  removeListingById(id: string): Promise<any>;
  removePickupById(id: string): Promise<any>;
  numberOfListings(username: string): Promise<number>;
  getPickupsByUsername(username: string): Promise<IMarketPickup[] | null>;
  listItem(player: IPlayer, item: ISimpleItem, price: number): Promise<any>;
  createPickupFromItemInfo(
    username: string,
    itemInfo: IMarketItemInfo,
  ): Promise<any>;
  createPickupFromSale(username: string, saleValue: number): Promise<any>;
  createPickupFromRedeemable(
    username: string,
    redeemable: IRedeemable,
  ): Promise<any>;
}

export interface IGroundDB extends IGameService {
  loadAllGrounds(): Promise<any[]>;
  saveSingleGround(ground: any): Promise<any>;
  removeGround(map: string): Promise<any>;
  removeAllGroundsByParty(partyName: string): Promise<any>;
  saveAllGrounds(grounds: any[]): Promise<any>;
}

export interface IEventsDB extends IGameService {
  loadEvents(): Promise<any[]>;
  createEvent(event: any): Promise<void>;
  deleteEvent(event: any): Promise<void>;
}

export interface IRedeemableDB extends IGameService {
  addRedeemable(opts: Partial<IRedeemable>): Promise<IRedeemable>;
  getRedeemable(code: string): Promise<IRedeemable | null>;
  claimRedeemable(code: string, claimingAccount: string): Promise<IRedeemable>;
}

export interface IGuildLogsDB extends IGameService {
  addLogEntry(guild: any, action: string, actor: string): Promise<void>;
  getEntriesForGuild(guild: any): Promise<any[]>;
}

export interface IGuildsDB extends IGameService {
  loadAllGuilds(): Promise<any[]>;
  createGuild(owner: any, name: string, tag: string): Promise<any>;
  saveGuild(guild: any): Promise<void>;
  deleteGuild(guild: any): Promise<void>;
}

// Helper service interfaces
export interface IEmailHelper extends IGameService {
  requestVerificationCode(account: any): Promise<void>;
  requestTemporaryPassword(emailOrUsername: string): Promise<void>;
}

export interface IMigrationHelper extends IGameService {
  migrate(player: IPlayer, playerAccount: IAccount): void;
}

export interface IEffectManager extends IGameService {
  getEffectData(effectName: string, context: string): any;
  getEffectRef(effectName: string): any;
  getEffectName(target: ICharacter, effect: any): string;
  effectCreate(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ): void;
  effectApply(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ): void;
  effectTick(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ): void;
  effectUnapply(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ): void;
  effectExpire(
    effectName: string,
    character: ICharacter,
    effect: IStatusEffect,
  ): void;
}

export interface ICorpseManager extends IGameService {
  tick(timer: any): void;
  addCorpse(map: string, corpse: ISimpleItem, x: number, y: number): void;
  removeCorpse(corpse: ISimpleItem): void;
  removePlayerCorpse(username: string): void;
  searchCorpses(uuids: string[]): void;
  getCorpseRef(search: string): ISimpleItem | undefined;
  deleteCorpsesFromHandsOfPlayer(player: IPlayer): void;
  forciblyDropCorpsesHeldByPlayer(player: IPlayer): void;
  markPlayerCorpseHeld(corpse: ISimpleItem, character: ICharacter): void;
  movePlayerCorpseOntoMap(corpse: ISimpleItem, heldBy: ICharacter): void;
  searchCorpse(uuid: string): void;
}

export interface ILobbyManager extends IGameService {
  readonly simpleOnlineAccounts: any[];
  joinLobby(account: IAccount): void;
  leaveLobby(username: string): void;
  joinGame(account: IAccount, player: IPlayer): Promise<void>;
  leaveGame(username: string): void;
  forceLeaveGame(username: string): void;
  hasJoinedGame(username: string): boolean;
  hasCommand(cmd: string): boolean;
  getCommandSyntax(cmd: string): string;
  doCommand(
    cmd: string,
    message: string,
    emit: (args: any) => void,
  ): Promise<boolean>;
  updateAccount(account: IAccount): void;
  isConnectedGm(username: string): boolean;
}

export interface ISubscriptionHelper extends IGameService {
  takeCosmetic(account: IAccount, cosmetic: any): void;
  checkAccountForExpiration(account: IAccount): Promise<void>;
  buyWithIRLMoney(
    account: IAccount,
    months: number,
    cost: number,
  ): Promise<void>;
  getSilverItem(purchaseKey: string): any | undefined;
  canBuySilverItem(account: IAccount, purchaseKey: any): boolean;
  buySilverItem(account: IAccount, purchaseKey: any): void;
  updateSilverPurchaseTotal(
    account: IAccount,
    purchase: any,
    delta?: number,
  ): Promise<void>;
  subscribe(account: IAccount, months: number): Promise<void>;
  unsubscribe(account: IAccount): Promise<void>;
  startTrial(
    account: IAccount,
    expirationDays?: number,
    tier?: any,
  ): Promise<void>;
  modifyAccountSilver(account: IAccount, silver: number): Promise<void>;
  gainSilver(player: IPlayer, amount?: number): void;
  loseSilver(player: IPlayer, amount?: number): void;
}

export interface ICharacterRoller extends IGameService {
  rollCharacter(options: {
    allegiance: string;
    baseclass: string;
    weapons: any;
  }): {
    skills: any;
    stats: any;
    gold: number;
    items: any;
  };
}

export interface IItemCreator extends IGameService {
  getSimpleItem(itemName: string): ISimpleItem;
  getGold(value: number): ISimpleItem;
  createSuccorItem(
    map: string,
    x: number,
    y: number,
    ounces?: number,
  ): ISimpleItem;
  rerollItem(item: ISimpleItem, rerollStats?: boolean): ISimpleItem;
  resetUUID(item: ISimpleItem): void;
}

export interface IDialogActionHelper extends IGameService {
  handleDialog(
    player: IPlayer,
    npc: INPC,
    command: string,
    callbacks: any,
  ): Promise<void>;
  handleAction(action: any, npc: INPC, player: IPlayer): any;
}

export interface INPCCreator extends IGameService {
  getNPCDefinition(npcId: string): INPCDefinition;
  createCharacterFromNPC(npcId: string): INPC;
  createCharacterFromNPCDefinition(npcDef: INPCDefinition): INPC;
  getNPCName(npc: INPCDefinition): string;
  addAttribute(npc: INPC): void;
  makeElite(npc: INPC): void;
}

// Combat and character helper interfaces
export interface IDeathHelper extends IGameService {
  restore(
    player: IPlayer,
    opts?: { x?: number; y?: number; map?: string; shouldRot?: boolean },
  ): void;
  die(dead: ICharacter, killer?: ICharacter): void;
  fakeNPCDie(dead: INPC): void;
  npcDie(dead: INPC, corpse?: ISimpleItem, killer?: ICharacter): void;
  kill(killer: ICharacter, dead: ICharacter): void;
}

export interface ITargettingHelper extends IGameService {
  isVisibleTo(ref: ICharacter, target: ICharacter, useSight?: boolean): boolean;
  checkTargetForHostility(attacker: ICharacter, target: ICharacter): boolean;
  isTargetInViewRange(
    player: ICharacter,
    target: ICharacter,
    useSight?: boolean,
  ): boolean;
  getFirstPossibleTargetInViewRange(
    player: ICharacter,
    findStr: string,
    useSight?: boolean,
  ): ICharacter;
  getFirstPossibleTargetInViewRangeThatIsntSelf(
    player: ICharacter,
    findStr: string,
    useSight?: boolean,
  ): ICharacter;
  getPossibleTargetsInViewRange(
    player: ICharacter,
    findStr: string,
    useSight?: boolean,
  ): ICharacter[];
  getPossibleAOETargets(
    caster: ICharacter | undefined,
    center: ICharacter | { x: number; y: number; map: string },
    radius?: number,
    maxTargets?: number,
  ): ICharacter[];
  getPossibleFriendlyAOETargets(
    caster: ICharacter,
    target: ICharacter | { x: number; y: number; map: string },
    radius: number,
    maxTargets?: number,
  ): ICharacter[];
  doesTargetMatchSearch(
    searcher: ICharacter,
    target: ICharacter | string,
    includes?: boolean,
  ): boolean;
}

export interface ITeleportHelper extends IGameService {
  setCharXY(char: ICharacter, x: number, y: number): void;
  teleportToRespawnPoint(player: IPlayer): void;
  canEnterMap(player: IPlayer, map: string): boolean;
  teleport(
    player: IPlayer,
    location: { x: number; y: number; map?: string },
  ): boolean;
  maxLocations(player: IPlayer): number;
  memorizeLocation(player: IPlayer, name: string): boolean;
  forgetLocation(player: IPlayer, name: string): boolean;
  showTeleports(player: IPlayer, spell?: string): void;
}

export interface IDamageHelperOnesided extends IGameService {
  dealOnesidedDamage(defender: ICharacter, args: any): void;
}

export interface IDamageHelperMagic extends IGameService {
  magicalAttack(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: any,
  ): void;
}

export interface IDamageHelperPhysical extends IGameService {
  physicalAttack(attacker: ICharacter, defender: ICharacter, args: any): any;
}

export interface ICombatHelper extends IGameService {
  dealOnesidedDamage(defender: ICharacter, args: OnesidedDamageArgs): void;
  physicalAttack(attacker: ICharacter, defender: ICharacter, args?: any): any;
  magicalAttack(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args?: any,
  ): void;
  combatEffect(target: ICharacter, defenderUUID: string, effect: any): void;
  modifyDamage(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: any,
  ): number;
  dealDamage(
    attacker: ICharacter | undefined,
    defender: ICharacter,
    args: any,
  ): void;
  attemptArrowBounce(
    attacker: ICharacter,
    defender: ICharacter,
    args: any,
  ): void;
}

export interface IQuestHelper extends IGameService {
  getQuest(quest: string): IQuest;
  hasQuest(player: IPlayer, quest: string): boolean;
  canStartQuest(player: IPlayer, quest: string): boolean;
  startQuest(player: IPlayer, quest: string): void;
  isRequirementComplete(
    player: IPlayer,
    quest: string,
    requirement: any,
  ): boolean;
  isQuestComplete(player: IPlayer, quest: string): boolean;
  isQuestPermanentlyComplete(player: IPlayer, quest: string): boolean;
  updateQuestData(player: IPlayer, quest: string, data: any): void;
  getQuestProgress(player: IPlayer, quest: string): any;
  updateQuestProgressKill(player: IPlayer, quest: string): void;
  tryUpdateQuestProgressForKill(player: IPlayer, npcId: string): void;
  completeQuest(player: IPlayer, quest: string, questGiver?: string): void;
  giveQuestRewards(player: IPlayer, quest: string): void;
  recalculateQuestKillsAndStatRewards(player: IPlayer): void;
  calculateKillHash(player: IPlayer): Record<string, string[]>;
  calculateStatHash(player: IPlayer): Partial<Record<any, number>>;
  formatQuestMessage(player: IPlayer, quest: string, message: string): string;
}

export interface ILootHelper extends IGameService {
  chooseWithReplacement(
    choices: Rollable[] | string[],
    number?: number,
    bonus?: number,
  ): any[];
  chooseWithoutReplacement(
    choices: Rollable[] | string[],
    number?: number,
    bonus?: number,
  ): any[];
  getNPCLoot(npc: any, bonus?: number): any[];
}

export interface IHolidayHelper extends IGameService {
  tryGrantHolidayTokens(player: IPlayer, amt: number): void;
}

export interface IMovementHelper extends IGameService {
  numStepsTo(from: IMapPosition, to: IPosition): number;
  moveWithPathfinding(
    character: ICharacter,
    direction: { xDiff: number; yDiff: number },
  ): boolean;
  faceTowards(source: ICharacter, target: { x: number; y: number }): void;
  moveTowards(source: ICharacter, target: { x: number; y: number }): boolean;
  moveRandomly(character: ICharacter, numSteps: number): void;
  takeSequenceOfSteps(
    character: ICharacter,
    steps: Array<{ x: number; y: number }>,
    opts?: { isChasing: boolean },
  ): boolean;
  postTeleportInteractableActions(player: IPlayer, obj: any): void;
  canUseTeleportInteractable(player: IPlayer, obj: any): boolean;
  getDestinationForTeleportInteractable(
    player: IPlayer,
    obj: any,
  ): undefined | { x: number; y: number; map: string };
}

export interface IVisibilityHelper extends IGameService {
  canSee(char: ICharacter, xOffset: number, yOffset: number): boolean;
  isDarkAt(map: string, x: number, y: number): boolean;
  canContinueHidingAtSpot(char: ICharacter): boolean;
  canHide(char: ICharacter): boolean;
  reasonUnableToHide(char: ICharacter): string;
  canSeeThroughStealthOf(char: ICharacter, hiding: ICharacter): boolean;
  calculatePlayerFOV(player: IPlayer, sendFOV?: boolean): void;
  calculateFOV(character: ICharacter): void;
}

export interface IInteractionHelper extends IGameService {
  tryToOpenDoor(character: ICharacter, door: any): boolean;
  openChest(character: ICharacter, chest: any): void;
}

export interface IItemHelper extends IGameService {
  upgradeItem(
    baseItem: ISimpleItem,
    upgradeItem: string,
    bypassLimit?: boolean,
  ): void;
  mergeItemRequirements(
    baseRequirements: IItemRequirements | undefined,
    newRequirements: IItemRequirements,
  ): IItemRequirements;
  reasonCantGetBenefitsFromItem(
    char: ICharacter,
    item: ISimpleItem,
    slot?: ItemSlot,
  ): string;
  gainCondition(
    item: ISimpleItem,
    conditionLoss: number,
    character: ICharacter,
  ): void;
  loseCondition(
    item: ISimpleItem,
    conditionLoss: number,
    character: ICharacter,
  ): void;
  conditionACModifier(item: ISimpleItem): number;
  canUseItem(player: IPlayer, item: ISimpleItem): boolean;
  useItemInSlot(player: IPlayer, source: ItemSlot, tryEffect?: boolean): void;
  tryToBreakItem(player: ICharacter, item: ISimpleItem, source: ItemSlot): void;
  tryToUseItem(player: IPlayer, item: ISimpleItem, source: ItemSlot): void;
  useBook(player: IPlayer, book: ISimpleItem, source: ItemSlot): void;
  useRNGBox(player: IPlayer, box: ISimpleItem, source: ItemSlot): void;
  tryToBindItem(character: ICharacter, item: ISimpleItem): void;
  isEtherForceItem(itemName: string): boolean;
}

export interface INPCHelper extends IGameService {
  getNPCDefinition(npcId: string): INPCDefinition;
  isNaturalResource(npc: INPC): boolean;
  tick(npc: INPC, tick: number): void;
  registerAttackDamage(
    npc: INPC,
    char: ICharacter,
    attack: string,
    damage: number,
  ): void;
  getAttackDamage(npc: INPC, char: ICharacter, attack: string): number;
  registerZeroTimes(npc: INPC, char: ICharacter, attack: string): void;
  getZeroTimes(npc: INPC, char: ICharacter, attack: string): number;
  searchNPCs(search: string): string[];
}

export interface ICharacterHelper extends IGameService {
  takeItemFromEitherHand(char: ICharacter, item: string): void;
  setEquipmentSlot(
    char: ICharacter,
    slot: ItemSlot,
    item: ISimpleItem | undefined,
  ): void;
  tryDance(char: ICharacter): void;
  dropHand(char: ICharacter, hand: 'left' | 'right'): void;
  dropHands(char: ICharacter): void;
  setRightHand(char: ICharacter, item: ISimpleItem | undefined): void;
  setLeftHand(char: ICharacter, item: ISimpleItem | undefined): void;
  addAgro(char: ICharacter, target: ICharacter, amount: number): void;
  clearAgro(char: ICharacter, target: ICharacter): void;
  gainPermanentStat(character: ICharacter, stat: Stat, value?: number): boolean;
  recalculateEverything(character: ICharacter): void;
  checkEncumberance(character: ICharacter): void;
  characterStatTotalsCalculate(character: ICharacter): void;
  tick(character: ICharacter, tick: number): void;
  tryToCastEquipmentEffects(character: ICharacter): void;
  abuseItemsForLearnedSkillAndGetEffect(
    character: ICharacter,
    spell: string,
  ): IItemEffect | undefined;
}

export interface IPlayerHelper extends IGameService {
  becomeClass(player: IPlayer, baseClass: BaseClass): void;
  reformatPlayerBeforeSave(player: any): void;
  tick(player: any, type: 'fast' | 'slow', tick: number): void;
  clearActionQueue(player: any, target?: string): void;
  resetStatus(
    player: IPlayer,
    opts?: { ignoreMessages?: boolean; sendFOV?: boolean },
  ): void;
  getStat(player: IPlayer, stat: any): number;
  flagSkill(player: IPlayer, skill: any): void;
  trainSkill(player: IPlayer, skill: any, amt: number): void;
  canGainSkillOnMap(player: IPlayer, skill: any): boolean;
  canGainExpOnMap(player: IPlayer): boolean;
  expMultiplierForMap(player: IPlayer): number;
  loseExp(player: IPlayer, xpLost: number): void;
  gainExp(player: IPlayer, xpGained: number): void;
  gainAxp(player: IPlayer, axpGained: number): void;
  tryGainSkill(player: IPlayer, skill: any, skillGained: number): void;
  loseSkill(player: IPlayer, skill: any, skillLost: number): void;
  gainSkill(player: IPlayer, skill: any, skillGained: number): void;
  gainTradeskill(player: IPlayer, tradeskill: any, amount: number): void;
  gainCurrentSkills(player: IPlayer, skillGained: number): void;
  modifyReputationForAllegiance(
    player: IPlayer,
    allegiance: string,
    modifier: number,
  ): void;
  gainLevelStats(player: IPlayer): void;
  tryLevelUp(player: IPlayer, maxLevel?: number): void;
  tryAncientLevelUp(player: IPlayer): void;
  doSuccor(player: IPlayer, succorInfo: any): void;
  refreshPlayerMapState(player: any): void;
  resetSpawnPointToDefault(player: any): void;
}

export interface IInventoryHelper extends IGameService {
  sackSpaceLeft(player: ICharacter): number;
  canAddItemToSack(player: ICharacter, item: ISimpleItem): boolean;
  addItemToSack(player: ICharacter, item: ISimpleItem): boolean;
  removeItemFromSack(player: ICharacter, slot: number): boolean;
  removeItemsFromSackByUUID(player: ICharacter, uuids: string[]): boolean;
  getItemsFromSackByName(player: ICharacter, filter: string): ISimpleItem[];
  beltSpaceLeft(player: ICharacter): number;
  canAddItemToBelt(player: ICharacter, item: ISimpleItem): boolean;
  addItemToBelt(player: ICharacter, item: ISimpleItem): boolean;
  removeItemFromBelt(player: ICharacter, slot: number): boolean;
  removeItemsFromBeltByUUID(player: ICharacter, uuids: string[]): boolean;
  pouchSpaceLeft(player: IPlayer): number;
  canAddItemToPouch(player: IPlayer, item: ISimpleItem): boolean;
  addItemToPouch(player: IPlayer, item: ISimpleItem): boolean;
  removeItemFromPouch(player: IPlayer, slot: number): boolean;
  removeItemsFromPouchByUUID(player: IPlayer, uuids: string[]): boolean;
  lockerSpaceLeft(player: ICharacter, locker: IItemContainer): number;
  canAddItemToLocker(
    player: ICharacter,
    item: ISimpleItem,
    locker: IItemContainer,
  ): boolean;
  addItemToLocker(
    player: ICharacter,
    item: ISimpleItem,
    locker: IItemContainer,
  ): boolean;
  removeItemFromLocker(
    player: ICharacter,
    slot: number,
    locker: IItemContainer,
  ): boolean;
  removeItemsFromLockerByUUID(
    player: ICharacter,
    uuids: string[],
    locker: IItemContainer,
  ): boolean;
  materialSpaceLeft(player: IPlayer, material: string): number;
  canAddMaterial(player: IPlayer, material: string): boolean;
  addMaterial(player: IPlayer, material: string, number?: number): void;
  removeMaterial(player: IPlayer, material: string, number?: number): void;
  itemValue(check: ICharacter | undefined, item: ISimpleItem): number;
  canSellItem(player: IPlayer, item: ISimpleItem): boolean;
  sellItem(player: IPlayer, item: ISimpleItem): void;
  addItemToBuyback(player: IPlayer, item: ISimpleItem): boolean;
  removeItemFromBuyback(player: IPlayer, slot: number): boolean;
}

export interface IEffectHelper extends IGameService {
  tickEffect(character: ICharacter, effect: any): void;
  tickEffects(character: ICharacter): void;
  addEffect(
    character: ICharacter,
    source: string | { name: string; uuid: string },
    effectName: string,
    modifyEffectInfo?: any,
  ): void;
  removeEffect(character: ICharacter, effect: any): void;
  removeEffectByName(character: ICharacter, effectName: string): void;
  removeEffectManually(
    character: ICharacter,
    effectName: string,
    force?: boolean,
  ): void;
  clearEffectsForDeath(character: ICharacter): void;
  modifyIncomingDamage(
    character: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: any,
  ): any;
  handleOutgoingEffects(
    character: ICharacter,
    target: ICharacter | undefined,
    args: any,
  ): void;
  hasSimilarEffects(character: ICharacter, effect: any): boolean;
  removeSimilarEffects(
    char: ICharacter,
    query: string,
    except: string,
    cancelPerms?: boolean,
    force?: boolean,
  ): void;
}

export interface IGroundManager extends IGameService {
  tick(timer: any): void;
  saveAllGround(): Promise<void>;
  getMapSpawners(mapName: string): ISerializableSpawner[];
  getGroundAround(mapName: string, x: number, y: number, radius: number): any;
  addItemToGround(
    mapName: string,
    x: number,
    y: number,
    item: any,
    forceSave?: boolean,
  ): void;
  getEntireGround(mapName: string, x: number, y: number): any;
  getItemsFromGround(
    mapName: string,
    x: number,
    y: number,
    itemClass: any,
    uuid?: string,
    allowTraps?: boolean,
  ): any[];
  removeItemFromGround(
    mapName: string,
    x: number,
    y: number,
    itemClass: any,
    uuid: string,
    count?: number,
  ): void;
  initGroundForMap(mapName: string, partyName?: string): void;
  boostSpawnersInMapBasedOnTimestamp(mapName: string, timestamp: number): void;
  saveSingleGround(mapName: string): void;
  removeGround(mapName: string): Promise<void>;
  removeGroundsForParties(partyName: string): Promise<void>;
  lootChest(map: string, chestName: string): void;
  getTrapsFromGround(mapName: string, x: number, y: number): any[];
  getAllItemsFromGround(mapName: string): any[];
  isChestLooted(mapName: string, chestName: string): boolean;
}

export interface ISpellManager extends IGameService {
  getSpellData(key: string, context?: string): any;
  getSpell(key: string): any;
  getPotency(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellData: ISpellData,
  ): number;
  resetCooldown(character: ICharacter, spellName: string): void;
  castSpell(
    spell: string,
    caster: ICharacter | undefined,
    target?: ICharacter | undefined,
    override?: Partial<IItemEffect>,
    callbacks?: any,
    originalArgs?: Partial<IMacroCommandArgs>,
    targetsPosition?: { x: number; y: number; map: string },
  ): void;
}

export interface ILockerHelper extends IGameService {
  openLocker(player: IPlayer, lockerName: string): void;
  getMaterialRef(itemName: string): string | undefined;
  getMaterialData(material: string): any;
  hasLockerFromString(player: IPlayer, lockerString: string): boolean;
  getLockerFromString(player: IPlayer, lockerString: string): IItemContainer;
}

export interface IPartyHelper extends IGameService {
  isInParty(player: IPlayer): boolean;
  isInSameParty(player: IPlayer, otherPlayer: IPlayer): boolean;
  isLeader(player: IPlayer): boolean;
  partyName(player: IPlayer): string;
  reformatAsPartyMember(player: IPlayer, partyName: string): IPartyMember;
  createParty(leader: IPlayer, partyName: string): void;
  joinParty(joiner: IPlayer, partyName: string): void;
  leaveParty(leaver: IPlayer, sendMessage?: boolean): void;
  kickPartyMember(kicked: IPlayer): void;
  giveParty(newLeader: IPlayer): void;
  breakParty(leader: IPlayer): void;
  partyMessage(party: IParty, message: string): void;
  getAllPartyMembersInRange(player: IPlayer): IPlayer[];
  getTotalXPMultiplier(player: IPlayer): number;
  getMultiplierBasedOnPartySize(partySize: number): number;
  getMultiplierBasedOnLevelDifference(level: number): number;
  recalculatePartyLevels(party: IParty): void;
}

export interface IPartyManager extends IGameService {
  tick(timer: any): void;
  getParty(partyName: string): IParty | undefined;
  getPartyMember(username: string): IPartyMember | undefined;
  addParty(party: IParty): void;
  removeParty(party: IParty): void;
  addPartyMember(member: IPartyMember): void;
  removePartyMember(member: IPartyMember): void;
}

export interface IDarknessHelper extends IGameService {
  tick(timer: any): void;
  checkAllDarkness(): void;
  isDarkAt(map: string, x: number, y: number): boolean;
  createDarkness(
    map: string,
    x: number,
    y: number,
    radius: number,
    endsAt: number,
  ): void;
  removeDarkness(
    map: string,
    x: number,
    y: number,
    radius: number,
    lightEndsAt: number,
  ): void;
  removeSingleDarkness(map: string, x: number, y: number): void;
  createPermanentDarkness(map: string, x: number, y: number): void;
  createLight(map: string, x: number, y: number, endsAt: number): void;
}

export interface ITrapHelper extends IGameService {
  getTrapAt(map: string, x: number, y: number): IGroundItem;
  triggerTrap(target: ICharacter, trap: IGroundItem): void;
  canPlaceTrap(map: string, x: number, y: number): boolean;
  castEffectFromTrap(target: ICharacter, trap: IGroundItem): void;
  placeTrap(x: number, y: number, placer: ICharacter, trap: ISimpleItem): void;
  canDisarmTrap(user: ICharacter, trap: ISimpleItem): boolean;
  removeTrap(map: string, x: number, y: number, trap: IGroundItem): void;
}

export interface IAchievementsHelper extends IGameService {
  achievementsCheckAll(player: any): void;
  achievementUnearn(player: any, achievement: string): void;
  achievementEarn(player: any, achievement: string): void;
}

// Communication and management interfaces
export interface IMessageHelper extends IGameService {
  sendLogMessageToPlayer(
    charOrUUID: ICharacter | string,
    message: MessageInfo,
    messageTypes?: MessageType[],
    formatArgs?: ICharacter[],
  ): void;
  sendLogMessageToRadius(
    character: ICharacter | { x: number; y: number; map: string },
    radius: number,
    {
      message,
      sfx,
      vfx,
      vfxTiles,
      vfxTimeout,
      from,
      setTarget,
      except,
    }: MessageInfo,
    messageTypes?: MessageType[],
    formatArgs?: ICharacter[],
  ): void;
  getVFXTilesForTile(
    center: { x: number; y: number; map: string },
    radius: number,
  ): { x: number; y: number }[];
  sendVFXMessageToRadius(
    character: ICharacter | { x: number; y: number; map: string },
    radius: number,
    { vfx, vfxTiles, vfxTimeout }: MessageVFX,
  ): void;
  sendSimpleMessage(
    target: ICharacter | string,
    message: string,
    sfx?: any,
  ): void;
  sendPrivateMessage(from: ICharacter, to: ICharacter, message: string): void;
  broadcastSystemMessage(message: string): void;
  sendMessageToMap(mapName: string, message: MessageInfo): void;
  sendBannerMessageToPlayer(player: ICharacter, message: MessageInfo): void;
  sendBannerMessageToMap(mapName: string, message: MessageInfo): void;
  sendMessageBannerAndChatToMap(mapName: string, message: MessageInfo): void;
  broadcastChatMessage(player: ICharacter, message: string): void;
  getSystemMessageObject(message: string): any;
  sendMessage(
    from: string,
    message: string,
    fromDiscord?: boolean,
    verified?: boolean,
  ): void;
  formatMessage(target: ICharacter, message: string, formatArgs: any[]): string;
  playSoundForPlayer(
    player: IPlayer,
    sfx: string,
    messageCategories: MessageType[],
  ): void;
  getMergeObjectFromArgs(args: string): any;
}

export interface IDynamicEventHelper extends IGameService {
  tick(timer: any): void;
  startEvent(event: IDynamicEvent): void;
  stopEvent(event: IDynamicEvent): void;
  updateEvent(event: IDynamicEvent): void;
  getEvents(): IDynamicEvent[];
  getEventsForPlayer(): IDynamicEvent[];
  getStat(stat: Stat): number;
  isEventActive(eventName: string): boolean;
  getActiveEvent(eventName: string): IDynamicEvent | undefined;
  startDynamicEvent(event: IDynamicEventMeta): void;
  getEventRef(ref: string): IDynamicEventMeta | undefined;
  trackNPCKill(npcId: string): void;
}

export interface ITraitHelper extends IGameService {
  getTraitTree(baseClass: any): any;
  getTraitInTree(baseClass: any, trait: string): any;
  canLearnTrait(player: IPlayer, trait: string): boolean;
  learnTrait(player: IPlayer, trait: string, sendMessage?: boolean): void;
  unlearnTrait(player: IPlayer, trait: string): void;
  resetTraits(player: IPlayer): void;
  saveBuild(player: IPlayer, buildSlot: number): void;
  hasBuild(player: IPlayer, buildSlot: number): boolean;
  loadBuild(player: IPlayer, buildSlot: number): void;
  renameBuild(player: IPlayer, buildSlot: number, name: string): void;
}

export interface IStealHelper extends IGameService {
  trySteal(char: ICharacter, target: ICharacter): Promise<void>;
}

export interface ICommandHandler extends IGameService {
  getSkillRef(name: string): any;
  doCommand(player: IPlayer, data: any, callbacks: any): Promise<void>;
}

export interface IPlayerManager extends IGameService {
  numPlayersOnline(): number;
  getAllPlayers(): IPlayer[];
  getPlayerInGame(account: IAccount): IPlayer | undefined;
  getPlayerByUsername(username: string): IPlayer | undefined;
  getPlayerState(player: IPlayer): any;
  addPlayerToGame(player: IPlayer): Promise<void>;
  removePlayerFromGame(player: IPlayer): Promise<void>;
  updatePlayerData(player: IPlayer): void;
  savePlayer(player: IPlayer): void;
  saveAllPlayers(): void;
  fastTick(timer: any, trueTick: number): void;
  slowTick(timer: any, trueTick: number): void;
}

export interface IWorldManager extends IGameService {
  readonly allMapNames: string[];
  readonly currentlyActiveMaps: string[];
  readonly currentlyActiveMapHash: Record<string, any>;
  readonly shouldAllowNewSpawnersToBeInitializedFromDungeons: boolean;
  readonly loadPercentage: string;
  initAllMaps(): void;
  createOrReplaceMap(mapName: string, mapJson: any): void;
  isAnyPlayerInPartyMap(partyName: string): boolean;
  getDestinationMapName(player: IPlayer, mapName: string): string;
  getMapScript(mapName: string): any;
  ensureMapExists(
    mapName: string,
    partyName: string,
    mapNameWithParty: string,
  ): void;
  getMap(
    mapName: string,
    partyName?: string,
  ): { map: IWorldMap; state: IMapState } | undefined;
  isEtherForceMap(mapName: string): boolean;
  isDungeon(mapName: string): boolean;
  getMapStateAndXYForCharacterItemDrop(
    character: ICharacter,
    defaultX: number,
    defaultY: number,
  ): { state: IMapState; x: number; y: number };
  getMapStateForCharacter(character: ICharacter): any;
  checkPlayerForDoorsBeforeJoiningGame(player: IPlayer): void;
  getPlayersInMap(mapName: string): ICharacter[];
  joinMap(player: IPlayer): void;
  leaveMap(player: IPlayer, kickToRespawnPointIfInDungeon?: boolean): void;
  spawnerTick(timer: any): void;
  steadyTick(timer: any): void;
  npcTick(timer: any): void;
  addCharacter(character: ICharacter): void;
  removeCharacter(character: ICharacter): void;
  getCharacter(uuid: string): ICharacter;
}

export interface IDiscordHelper extends IGameService {
  readonly canSendBugReports: boolean;
  getDiscordUserByTag(tag: string): Promise<any>;
  isTagInDiscord(tag: string): Promise<boolean>;
  updateDiscordRoles(account: IAccount): Promise<void>;
  removeDiscordRoles(account: IAccount): Promise<void>;
  addRole(user: any, role: any): Promise<void>;
  removeRole(user: any, role: any): Promise<void>;
  getRole(name: string): any;
  updateLobbyChannel(): Promise<void>;
  broadcastSystemMessage(message: string): Promise<void>;
  chatMessage(from: string, message: string): Promise<void>;
  sendMarketplaceMessage(
    player: IPlayer,
    sellItem: ISimpleItem,
    price: number,
  ): void;
  createMarketplaceEmbed(
    player: IPlayer,
    sellItem: ISimpleItem,
    price: number,
  ): any;
  createItemEmbed(sellItem: any): any;
  createNPCEmbed(fullCreature: any): any;
  getBugReportEmbed(player: IPlayer, embedData: any): any;
  sendBugReport(player: IPlayer, embedData: any): Promise<void>;
}

export interface IRNGDungeonGenerator extends IGameService {
  generateDungeon(map: IRNGDungeonMetaConfig, seed?: number): any;
  getSpoilerLog(mapName: string): ISpoilerLog[];
  hasClaimed(mapName: string, playerUUID: string): boolean;
  claim(mapName: string, playerUUID: string): void;
  getRandomItemFromMap(
    mapName: string,
    type: 'weapon' | 'armor' | 'jewelry' | 'gem',
    keywordMatches?: string[],
  ): IItemDefinition | undefined;
}

export interface IRNGDungeonManager extends IGameService {
  tick(timer: any): void;
  generateDungeons(): void;
  generateDungeon(map: any, seed?: number): void;
}

export interface IGuildManager extends IGameService {
  setGuildForPlayer(player: IPlayer): void;
  syncPlayerWithGuild(player: IPlayer): void;
  getGuildForPlayer(player: IPlayer): IGuild | undefined;
  getGuildById(id: string): IGuild | undefined;
  getGuildByTag(tag: string): IGuild | undefined;
  getGuildMembers(guild: IGuild): IGuildMember[];
  getGuildMemberForPlayer(
    guild: IGuild,
    player: IPlayer,
  ): IGuildMember | undefined;
  getGuildMemberForPlayerById(
    guild: IGuild,
    id: string,
  ): IGuildMember | undefined;
  sendGuildUpdateToPlayer(player: IPlayer): void;
  loadGuilds(): Promise<void>;
  createGuild(player: IPlayer, name: string, tag: string): Promise<any>;
  disbandGuild(actor: IPlayer): Promise<void>;
  deleteGuild(guild: IGuild): Promise<void>;
  addGuildMember(guild: IGuild, member: IPlayer, role: GuildRole): void;
  inviteMember(actor: IPlayer, target: IPlayer): Promise<void>;
  acceptInvite(actor: IPlayer): Promise<void>;
  denyInvite(actor: IPlayer): Promise<void>;
  leaveGuild(actor: IPlayer): Promise<void>;
  removeMember(actor: IPlayer, target: string): Promise<void>;
  promoteMember(actor: IPlayer, target: string): Promise<void>;
  demoteMember(actor: IPlayer, target: string): Promise<void>;
  addToTreasury(actor: IPlayer, amount: number): Promise<void>;
  removeFromTreasury(actor: IPlayer, amount: number): Promise<void>;
  updateMOTD(actor: IPlayer, newMOTD: string): Promise<void>;
  getAuditLog(actor: IPlayer): Promise<void>;
  guildMessage(guild: IGuild, message: string): void;
}

export interface ITestHelper extends IGameService {
  readonly autoApplyUserData: Partial<ICharacter>;
}

export enum GameEvent {
  InitCritical = 'init:critical',
  InitImportant = 'init:important',
  InitModerate = 'init:moderate',
  InitNormal = 'init:normal',
  InitChill = 'init:chill',
  GameStarted = 'game:started',
}

// Server-side game interface extracted from Game class
export interface IServerGame {
  readonly isGameReady: boolean;

  addGameEvent(event: GameEvent, callback: () => void): void;
  addGameEventOnce(event: GameEvent, callback: () => void): void;

  // Core services
  loggerInitializer: ILoggerInitializer;
  modkitManager: IModKitManager;
  contentLoader: IContentLoader;
  db: IDatabase;

  // Database services
  logsDB: ILogsDB;
  accountDB: IAccountDB;
  characterDB: ICharacterDB;
  worldDB: IWorldDB;
  marketDB: IMarketDB;
  groundDB: IGroundDB;
  eventsDB: IEventsDB;
  redeemableDB: IRedeemableDB;
  guildLogsDB: IGuildLogsDB;
  guildsDB: IGuildsDB;

  // Helper services
  emailHelper: IEmailHelper;
  migrationHelper: IMigrationHelper;
  effectManager: IEffectManager;
  corpseManager: ICorpseManager;
  lobbyManager: ILobbyManager;
  subscriptionHelper: ISubscriptionHelper;
  characterRoller: ICharacterRoller;
  itemCreator: IItemCreator;
  dialogActionHelper: IDialogActionHelper;
  npcCreator: INPCCreator;

  // Combat and character helpers
  deathHelper: IDeathHelper;
  targettingHelper: ITargettingHelper;
  teleportHelper: ITeleportHelper;
  damageHelperOnesided: IDamageHelperOnesided;
  damageHelperMagic: IDamageHelperMagic;
  damageHelperPhysical: IDamageHelperPhysical;
  combatHelper: ICombatHelper;
  questHelper: IQuestHelper;
  lootHelper: ILootHelper;
  holidayHelper: IHolidayHelper;
  movementHelper: IMovementHelper;
  visibilityHelper: IVisibilityHelper;
  interactionHelper: IInteractionHelper;
  itemHelper: IItemHelper;
  npcHelper: INPCHelper;
  characterHelper: ICharacterHelper;
  playerHelper: IPlayerHelper;
  inventoryHelper: IInventoryHelper;
  effectHelper: IEffectHelper;
  groundManager: IGroundManager;
  spellManager: ISpellManager;
  lockerHelper: ILockerHelper;
  partyHelper: IPartyHelper;
  partyManager: IPartyManager;
  darknessHelper: IDarknessHelper;
  trapHelper: ITrapHelper;
  achievementsHelper: IAchievementsHelper;

  // Communication and management
  messageHelper: IMessageHelper;
  dynamicEventHelper: IDynamicEventHelper;
  traitHelper: ITraitHelper;
  stealHelper: IStealHelper;
  commandHandler: ICommandHandler;
  playerManager: IPlayerManager;
  worldManager: IWorldManager;
  discordHelper: IDiscordHelper;
  rngDungeonGenerator: IRNGDungeonGenerator;
  rngDungeonManager: IRNGDungeonManager;
  guildManager: IGuildManager;
  testHelper: ITestHelper;

  // Methods
  init(wsCmdHandler: IWebsocketCommandHandler): Promise<void>;
}
