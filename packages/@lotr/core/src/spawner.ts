import { extend, isArray, random, sample } from 'lodash';
import uuid from 'uuid/v4';

import type {
  IMapState,
  IServerGame,
  ISpawner,
  IWorldMap,
} from '@lotr/interfaces';

import type { Holiday, IAI, INPC, INPCDefinition } from '@lotr/interfaces';
import { Hostility } from '@lotr/interfaces';

import { isDead } from '@lotr/characters';
import { isHoliday } from '@lotr/content';
import { consoleError } from '@lotr/logger';
import { rollInOneHundred } from '@lotr/rng';
import { AllAIBehaviors } from './ai';

export class Spawner implements ISpawner {
  public readonly id = uuid();

  private x!: number;
  private y!: number;
  private map!: string;
  private name!: string;

  private currentTick = 0;
  private currentEliteTick = 0;

  // spawner settings
  private respawnRate = 120; // the number of seconds before a new creatures comes from the spawner

  private initialSpawn = 0; // the number of creatures the spawner will spawn initially
  private maxCreatures = 5; // the maximum number of creatures the spawner can have
  private spawnRadius = 0; // the number of tiles around the spawner that a creature can spawn
  private randomWalkRadius = 10; // the number of tiles away a creature will walk on it's own
  private leashRadius = 20; // the number of tiles away a creature can chase before it's pulled back to the spawner

  private paths: string[] = []; // the paths creatures can walk specified by this spawner
  private npcDefs: INPCDefinition[] = []; // the npc definitions
  private npcIds: string[] | any[] = []; // the npc ids or { npcId, chance } for potential spawned creatures
  private npcAISettings: string[] = []; // the ai the npcs should consider when spawning (if none, default is used)

  private alwaysSpawn?: boolean; // whether the spawner should always spawn or not (used for specific spawners that cannot be blocked by caps)
  private shouldSerialize?: boolean; // whether the spawner should save its state or not (boss only)
  private requireDeadToRespawn = false; // whether the spawner can keep spawning while it has living creatures
  private isDangerous = false; // whether the creature is "dangerous" or not (strips)
  private respectKnowledge = true; // whether the npcs should be acting if true, they only act where players have knowledge (green, town, and lair spawners always act)
  private requireHoliday?: Holiday; // if this spawner requires a holiday to be active, it's set to this
  private attributeAddChance = 0; // whether the spawner can add random attributes to the npcs it spawns (and the chance for it to do so)

  private shouldStrip = false; // whether the creature should strip all your gear on death
  private stripRadius = 0; // the radius around the strip point (0 = no spread) gear spreads to
  private stripX?: number; // the specific x to strip to (default: spawner x)
  private stripY?: number; // the specific y to strip to (default: spawner y)
  private shouldEatTier = 0; // if the creature eats, and if so, how badly it does

  private eliteTickCap = 50; // the number of creatures required to spawn an elite (-1 = no elites)
  private removeDeadNPCs = true; // remove npcs when dead? if no, this is a spawner like a green spawner, where those npcs need to respawn
  private removeWhenNoNPCs = false; // remove this spawner when no npcs? generally used for on-the-fly spawners
  private npcCreateCallback?: (npc: INPC, spawner: Spawner) => void; // the callback for creating an npc - used for summons, generally
  private doInitialSpawnImmediately?: boolean; // whether or not the spawner should spawn creatures immediately or wait

  private requireEvent?: string; // the event required for this spawner to be active

  // spawner live properties
  private npcs: INPC[] = []; // the npcs currently in existence on this spawner
  private hasDoneInitialSpawn?: boolean; // whether or not the initial spawn has been done for this spawner
  private npcAI: Record<string, IAI> = {}; // the ai for each npc on this spawner
  private replaceNPCTicks: Record<string, number> = {}; // the number of ticks before we replace a dead (probably green) NPC
  private replaceNPCDefs: Record<string, INPCDefinition> = {};

  public get areAnyNPCsAlive(): boolean {
    return this.npcs.some((npc) => !isDead(npc));
  }

  public get canBeSaved(): boolean {
    return !!this.shouldSerialize;
  }

  public get walkingAttributes() {
    return {
      randomWalkRadius: this.randomWalkRadius,
      leashRadius: this.leashRadius,
    };
  }

  public get hasPaths(): boolean {
    return this.paths?.length > 0;
  }

  public get pos() {
    return { x: this.x, y: this.y };
  }

  public get spawnerName() {
    return this.name;
  }

  public get currentTickForSave() {
    return this.currentTick;
  }

  public get areCreaturesDangerous(): boolean {
    return this.isDangerous;
  }

  public get allNPCS(): INPC[] {
    return this.npcs;
  }

  public get respawnTimeSeconds(): number {
    return this.respawnRate;
  }

  private get canRespawn(): boolean {
    return (
      !this.mapRef.disableCreatureRespawn &&
      (this.currentTick === 0 ||
        (this.currentTick > this.respawnRate && this.respawnRate > 0))
    );
  }

  private get isUnderNPCCap(): boolean {
    return this.npcs.length < this.maxCreatures;
  }

  private get isAbleToSpawn(): boolean {
    return this.alwaysSpawn || this.mapRef.canSpawnCreatures;
  }

  private get canISpawnAnNPCRightNow(): boolean {
    return this.canRespawn && this.isUnderNPCCap && this.isAbleToSpawn;
  }

  public get respectsKnowledge(): boolean {
    return this.respectKnowledge;
  }

  public get allPossibleNPCSpawns(): INPCDefinition[] {
    return this.npcDefs;
  }

  public get allPossibleNPCSpawnsById(): string[] {
    return this.npcIds;
  }

  private get canBeActive(): boolean {
    if (this.requireHoliday && !isHoliday(this.requireHoliday)) {
      return false;
    }
    if (
      this.requireEvent &&
      !this.game.dynamicEventHelper.isEventActive(this.requireEvent)
    ) {
      return false;
    }
    return true;
  }

  public get mapName() {
    return this.mapRef.name;
  }

  constructor(
    private game: IServerGame,
    private mapRef: IWorldMap,
    private mapState: IMapState,
    spawnOpts: Partial<Spawner> = {},
  ) {
    extend(this, spawnOpts);

    if (this.mapRef.disableCreatureRespawn) this.currentTick = 0;
  }

  public tryInitialSpawn() {
    if (this.doInitialSpawnImmediately && this.currentTick === 0) {
      this.doInitialSpawn();
    }
  }

  public setTick(tick: number): void {
    this.currentTick = tick;
    this.currentEliteTick = tick;
  }

  // triggers every second
  public steadyTick(): void {
    if (!this.canBeActive) return;

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
    this.npcs.forEach((npc) => {
      if (
        this.removeDeadNPCs &&
        isDead(npc) &&
        !this.replaceNPCDefs[npc.uuid]
      ) {
        this.removeNPC(npc);
        return;
      }

      if (
        !this.removeDeadNPCs &&
        isDead(npc) &&
        this.replaceNPCDefs[npc.uuid]
      ) {
        if (!this.replaceNPCTicks[npc.uuid]) {
          this.propagateRemoveNPC(npc);
        }

        let replaceNPCTicks = this.replaceNPCTicks[npc.uuid] ?? 0;
        replaceNPCTicks++;
        this.replaceNPCTicks[npc.uuid] = replaceNPCTicks;

        if (replaceNPCTicks > this.respawnRate) {
          const npcDef = this.replaceNPCDefs[npc.uuid];
          this.removeNPC(npc);
          this.createNPC({ npcDef });
        }

        return;
      }

      // if the spawner respects player knowledge (generally, monsters do), then we don't trigger unless a player is nearby
      if (
        this.respectKnowledge &&
        !this.mapState.isThereAnyKnowledgeForXY(npc.x, npc.y)
      ) {
        return;
      }

      this.npcAI[npc.uuid]!.tick();
      this.npcAI[npc.uuid]!.mechanicTick();
    });

    if (this.npcs.length === 0 && this.removeWhenNoNPCs) {
      this.removeSelf();
    }
  }

  public getNPCAI(npcUUID: string): IAI {
    return this.npcAI[npcUUID]!;
  }

  public forceSpawnNPC(
    opts: {
      npcId?: string;
      npcDef?: INPCDefinition;
      spawnLoc?: { x: number; y: number };
      createCallback?: (npc: INPC) => void;
    } = {},
  ): INPC | null {
    return this.createNPC(opts);
  }

  // triggers every second, for clearing buffs
  private buffTick(): void {
    this.npcs.forEach((npc) => this.game.effectHelper.tickEffects(npc));
  }

  private doInitialSpawn() {
    if (this.hasDoneInitialSpawn) return;
    this.hasDoneInitialSpawn = true;

    this.spawnInitialNPCs();
  }

  private spawnInitialNPCs() {
    for (let i = 0; i < this.initialSpawn; i++) {
      if (!this.isUnderNPCCap) continue;
      this.createNPC();
    }

    // npcDefs means we have to maintain these and spawn them all at once
    // primarily this exists for the green spawner
    (this.npcDefs || []).forEach((npcDef) => {
      if (!this.isUnderNPCCap) return;
      this.createNPC({ npcDef });
    });
  }

  private createNPC(
    opts: {
      npcId?: string;
      npcDef?: INPCDefinition;
      spawnLoc?: { x: number; y: number };
      createCallback?: (npc: INPC) => void;
    } = {},
  ): INPC | null {
    if (!this.canBeActive) return null;

    const hasOwnId =
      (this.npcIds && this.npcIds.length === 0) ||
      (this.npcDefs && this.npcDefs.length === 0);
    if (!hasOwnId && !opts.npcId && this.x === 0 && this.y === 0) {
      consoleError(
        'Spawner',
        new Error(
          `No valid npcIds for spawner ${this.name} at ${this.x}, ${this.y} on ${this.map}`,
        ),
      );
      this.removeSelf();
      return null;
    }

    const { npcId, npcDef, createCallback } = opts;

    let chosenNPCDef = npcDef;
    if (!chosenNPCDef) {
      let chosenNPCId = npcId;
      if (!chosenNPCId) {
        chosenNPCId = this.game.lootHelper.chooseWithReplacement(
          this.npcIds,
          1,
        )[0];
      }

      if (chosenNPCId) {
        chosenNPCDef = this.game.npcHelper.getNPCDefinition(chosenNPCId);
      }
    }

    // if we don't have anything, we grab a random npc def rather than picking by id
    if (!chosenNPCDef) {
      chosenNPCDef = sample(this.npcDefs);
    }

    if (!chosenNPCDef) {
      consoleError(
        'Spawner',
        new Error(`Could not get NPC definition for ${this.name}.`),
      );
      return null;
    }

    const npc = this.game.npcCreator.createCharacterFromNPCDefinition(
      chosenNPCDef as INPCDefinition,
    );

    let foundCoordinates = {
      x: opts.spawnLoc?.x ?? chosenNPCDef?.x ?? 0,
      y: opts.spawnLoc?.y ?? chosenNPCDef?.y ?? 0,
    };
    let attempts = 0;

    while (!foundCoordinates.x || !foundCoordinates.y) {
      const x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
      const y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);

      const isWall = this.mapRef.checkIfActualWallAt(x, y);
      const hasDenseObject = this.mapRef.checkIfDenseObjectAt(x, y);
      const invalidLocation =
        x < 4 ||
        y < 4 ||
        x > this.mapRef.width - 4 ||
        y > this.mapRef.height - 4;

      if (!isWall && !hasDenseObject && !invalidLocation) {
        foundCoordinates = { x, y };
      }

      if (attempts++ > 100) {
        consoleError(
          'Spawner',
          new Error(
            `Could not place a creature at ${this.x}, ${this.y} - ${this.mapRef.name}`,
          ),
        );
        break;
      }
    }

    npc.x = foundCoordinates.x;
    npc.y = foundCoordinates.y;
    npc.map = this.mapRef.name;

    let ai: keyof typeof AllAIBehaviors = 'default';
    if (this.npcAISettings.length > 0) {
      let aiSettings: any = this.npcAISettings;
      if (!isArray(aiSettings)) aiSettings = [aiSettings];
      ai = sample(aiSettings);
    }

    if (chosenNPCDef.forceAI) {
      ai = chosenNPCDef.forceAI as keyof typeof AllAIBehaviors;
    }

    if (!AllAIBehaviors[ai]) {
      consoleError('Spawner', new Error(`AI setting ${ai} does not exist.`));
      return null;
    }

    const aiInst = new AllAIBehaviors[ai](
      this.game,
      this.mapRef,
      this.mapState,
      this,
      npc,
    );

    npc.shouldStrip = this.shouldStrip;
    npc.shouldEatTier = this.shouldEatTier;
    npc.stripRadius = this.stripRadius;
    npc.stripX = this.stripX || this.x;
    npc.stripY = this.stripY || this.y;

    if (this.isDangerous) {
      this.game.effectHelper.addEffect(npc, '', 'Dangerous');
    }

    this.game.characterHelper.tryToCastEquipmentEffects(npc);

    this.tryAttribute(npc);
    this.tryElitify(npc);
    this.game.visibilityHelper.calculateFOV(npc);

    this.npcCreateCallback?.(npc, this);
    createCallback?.(npc);

    this.addNPC(npc, aiInst, npcDef);

    this.game.characterHelper.characterStatTotalsCalculate(npc);

    npc.spawnedAt = Date.now();

    return npc;
  }

  private addNPC(npc: INPC, ai: IAI, npcDef?: INPCDefinition): void {
    this.npcs.push(npc);
    this.npcAI[npc.uuid] = ai;
    this.mapState.addNPC(npc, this);

    if (npcDef) {
      this.replaceNPCDefs[npc.uuid] = npcDef;
    }
  }

  private propagateRemoveNPC(npc: INPC): void {
    this.mapState.removeNPC(npc);
  }

  private removeNPC(npc: INPC): void {
    this.npcs = this.npcs.filter((c) => c.uuid !== npc.uuid);
    delete this.npcAI[npc.uuid];
    this.propagateRemoveNPC(npc);

    delete this.replaceNPCTicks[npc.uuid];
    delete this.replaceNPCDefs[npc.uuid];
  }

  public getRandomPath(): string {
    if (!this.hasPaths) return '';
    return sample(this.paths) ?? '';
  }

  private removeSelf() {
    this.mapState.removeSpawner(this);
  }

  // make an enemy elite
  private tryElitify(npc: INPC) {
    // can never make elite
    if (this.eliteTickCap <= 0 || npc.hostility === Hostility.Never) return;

    this.currentEliteTick++;

    // elites can happen randomly 1% of the time, or are guaranteed upon cap
    if (this.currentEliteTick < this.eliteTickCap || random(1, 100) !== 1) {
      return;
    }

    this.currentEliteTick = 0;

    this.game.npcCreator.makeElite(npc);
  }

  // add a random attribute to an npc
  private tryAttribute(npc: INPC) {
    if (!rollInOneHundred(this.attributeAddChance)) {
      return;
    }
    this.game.npcCreator.addAttribute(npc);
  }

  public increaseTick(by = 1) {
    this.currentTick += by;
  }
}
