
import { extend, isArray, random, sample } from 'lodash';
import { Game } from '../../helpers';

import { Hostility, INPC, INPCDefinition } from '../../interfaces';
import { WorldMap } from './Map';
import { MapState } from './MapState';

export class Spawner {

  private x: number;
  private y: number;
  private map: string;
  private name: string;

  private currentTick = 0;
  private currentEliteTick = 0;

  // spawner settings
  private respawnRate = 120;                  // the number of seconds before a new creatures comes from the spawner

  private initialSpawn = 0;                   // the number of creatures the spawner will spawn initially
  private maxCreatures = 5;                   // the maximum number of creatures the spawner can have
  private spawnRadius = 0;                    // the number of tiles around the spawner that a creature can spawn
  private randomWalkRadius = 10;              // the number of tiles away a creature will walk on it's own
  private leashRadius = 20;                   // the number of tiles away a creature can chase before it's pulled back to the spawner

  private paths: string[] = [];               // the paths creatures can walk specified by this spawner
  private npcDefs: INPCDefinition[] = [];     // the npc definitions
  private npcIds: string[] | any[] = [];      // the npc ids or { npcId, chance } for potential spawned creatures
  private npcAISettings: string[] = [];       // the ai the npcs should consider when spawning (if none, default is used)

  private alwaysSpawn: boolean;               // whether the spawner should always spawn or not (used for specific spawners that cannot be blocked by caps)
  private shouldSerialize: boolean;           // whether the spawner should save its state or not (boss only)
  private requireDeadToRespawn = false;       // whether the spawner can keep spawning while it has living creatures
  private isDangerous = false;                // whether the creature is "dangerous" or not (strips)

  private shouldStrip = false;                // whether the creature should strip all your gear on death
  private stripRadius = 0;                    // the radius around the strip point (0 = no spread) gear spreads to
  private stripOnSpawner = true;              // whether you should strip on the spawner or not
  private stripX: number;                     // the specific x to strip to (overrides stripOnSpawner)
  private stripY: number;                     // the specific y to strip to (overrides stripOnSpawner)
  private shouldEatTier = 0;                  // if the creature eats, and if so, how badly it does

  private eliteTickCap = 50;                  // the number of creatures required to spawn an elite (-1 = no elites)
  private removeDeadNPCs = false;             // remove npcs when dead? if no, this is a spawner like a green spawner, where those npcs need to respawn
  private removeWhenNoNPCs = false;           // remove this spawner when no npcs? generally used for on-the-fly spawners
  private npcCreateCallback: () => void;      // the callback for creating an npc - used for summons, generally
  private doInitialSpawnImmediately: boolean; // whether or not the spawner should spawn creatures immediately or wait

  // spawner live properties
  private npcs: INPC[] = [];
  private hasDoneInitialSpawn: boolean;

  public get areAnyNPCsAlive(): boolean {
    return this.npcs.some(npc => !this.game.characterHelper.isDead(npc));
  }

  private get canRespawn(): boolean {
    return this.currentTick === 0 || this.currentTick > this.respawnRate && this.respawnRate > 0;
  }

  private get isUnderNPCCap(): boolean {
    return (this.npcs.length) < this.maxCreatures;
  }

  private get isAbleToSpawn(): boolean {
    return this.alwaysSpawn || (this.mapRef.canSpawnCreatures);
  }

  private get canISpawnAnNPCRightNow(): boolean {
    return this.canRespawn && this.isUnderNPCCap && this.isAbleToSpawn;
  }

  private get hasPaths(): boolean {
    return this.paths?.length > 0;
  }

  constructor(private game: Game, private mapRef: WorldMap, private mapState: MapState, spawnOpts: Partial<Spawner> = {}) {
    extend(this, spawnOpts);

    if (this.mapRef.disableCreatureSpawn) this.currentTick = 0;
    if (this.doInitialSpawnImmediately && this.currentTick === 0) this.doInitialSpawn();
  }

  // triggers every second
  public steadyTick(): void {
    if (this.requireDeadToRespawn) {
      if (this.npcs.length === 0) this.increaseTick();
    } else {
      this.increaseTick();
    }

    if (this.canISpawnAnNPCRightNow) {
      this.currentTick = 0;
      this.createNPC();
    }

    this.buffTick();
  }

  // triggers on world slow ticks
  public npcTick(): void {
    this.npcs.forEach(npc => {
      if (this.game.characterHelper.isDead(npc)) {
        this.removeNPC(npc);
        return;
      }

    });
  }

  // triggers every second, for clearing buffs
  private buffTick(): void {
    this.npcs.forEach(npc => this.game.characterHelper.tickEffects(npc));
  }

  private doInitialSpawn() {
    if (this.hasDoneInitialSpawn) return;
    this.hasDoneInitialSpawn = true;

    this.spawnInitialNPCs();
  }

  private spawnInitialNPCs() {
    for (let i = 0; i < this.initialSpawn; i++) {
      this.createNPC();
    }

    // npcDefs means we have to maintain these and spawn them all at once
    (this.npcDefs || []).forEach(npcDef => {
      this.createNPC({ npcDef });
    });
  }

  private createNPC(opts: { npcId?: string, npcDef?: INPCDefinition, createCallback?: (npc: INPC) => void } = {}) {
    const hasOwnId = (this.npcIds && this.npcIds.length === 0) || (this.npcDefs && this.npcDefs.length === 0);
    if (!hasOwnId && !opts.npcId && this.x === 0 && this.y === 0) {
      this.game.logger.error('Spawner', `No valid npcIds for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
      this.removeSelf();
      return;
    }

    const { npcId, npcDef, createCallback } = opts;

    let chosenNPCDef = npcDef;
    if (!chosenNPCDef) {

      let chosenNPCId = npcId;
      if (!chosenNPCId) {
        chosenNPCId = this.game.lootHelper.chooseWithReplacement(this.npcIds, 1)[0];
      }

      chosenNPCDef = this.game.npcHelper.getNPCDefinition(chosenNPCId);
    }

    const npc = this.game.npcCreator.createCharacterFromNPCDefinition(npcDef as INPCDefinition);

    let foundCoordinates = { x: npcDef?.x ?? 0, y: npcDef?.y ?? 0 };
    let attempts = 0;

    while (!foundCoordinates.x || !foundCoordinates.y) {
      const x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
      const y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);

      const isWall = this.mapRef.checkIfActualWallAt(x, y);
      const hasDenseObject = this.mapRef.checkIfDenseObjectAt(x, y);
      const invalidLocation = x < 4 || y < 4 || x > this.mapRef.width - 4 || y > this.mapRef.height - 4;

      if (!isWall && !hasDenseObject && !invalidLocation) {
        foundCoordinates = { x, y };
      }

      if (attempts++ > 100) {
        this.game.logger.error('Spawner', `Could not place a creature at ${this.x}, ${this.y} - ${this.mapRef.name}`);
        break;
      }
    }

    npc.x = foundCoordinates.x;
    npc.y = foundCoordinates.y;
    npc.map = this.mapRef.name;

    let ai = 'default';
    if (this.npcAISettings.length > 0) {
      let aiSettings: any = this.npcAISettings;
      if (!isArray(aiSettings)) aiSettings = [aiSettings];
      ai = sample(aiSettings);
    }

    // TODO: set tick, mechanictick, etc

    npc.shouldStrip = this.shouldStrip;
    npc.shouldEatTier = this.shouldEatTier;
    npc.stripRadius = this.stripRadius;
    npc.stripOnSpawner = this.stripOnSpawner;
    npc.stripX = this.stripX;
    npc.stripY = this.stripY;

    // TODO: check dangerous

    this.assignPath(npc);

    // TODO: call this.npcCreateCallback
    // TODO: call createCallback

    this.game.characterHelper.tryToCastEquipmentEffects(npc);
    this.game.characterHelper.calculateStatTotals(npc);

    this.tryElitify(npc);
    this.game.visibilityHelper.calculateFOV(npc);

    this.addNPC(npc);
  }

  private addNPC(npc: INPC): void {
    this.npcs.push(npc);
    this.mapState.addNPC(npc);
  }

  private removeNPC(npc: INPC): void {
    this.npcs = this.npcs.filter(c => c.uuid !== npc.uuid);
    this.mapState.removeNPC(npc);
  }

  private assignPath(npc: INPC): void {
    if (!this.paths || this.paths.length === 0) return;
    const path = sample(this.paths);

    // TODO: turn path into directions
    npc.path = path;
  }

  private removeSelf() {

  }

  // make an enemy elite
  private tryElitify(npc: INPC) {

    // can never make elite
    if (this.eliteTickCap <= 0 || npc.hostility === Hostility.Never) return;

    this.currentEliteTick++;

    // elites can happen randomly 1% of the time, or are guaranteed upon cap
    if (this.currentEliteTick < this.eliteTickCap || random(1, 100) !== 1) return;

    this.currentEliteTick = 0;

    this.game.npcCreator.makeElite(npc);
  }

  private increaseTick() {
    this.currentTick++;
  }
}
