
import RBush from 'rbush';

import { extend, get, keyBy, pick, setWith, unset, cloneDeep } from 'lodash';

import { Game } from '../../helpers';

import { Alignment, Allegiance, FOVVisibility, Hostility, ICharacter, IGround,
  IGroundItem, INPC, IPlayer, ISerializableSpawner, ISimpleItem, ItemClass } from '../../interfaces';
import { Player } from '../orm';
import { WorldMap } from './Map';
import { Spawner } from './Spawner';

const PLAYER_KEYS = [
  'dir', 'swimLevel', 'uuid', 'partyName', 'name', 'agro',
  'items.equipment', 'username',
  'affiliation', 'allegiance', 'alignment', 'baseClass', 'gender',
  'hp', 'mp', 'level', 'map', 'x', 'y', 'z', 'effects',
  'totalStats.stealth'
];

const NPC_KEYS = [
  'dir', 'swimLevel', 'uuid', 'name', 'sprite',
  'affiliation', 'allegiance', 'alignment', 'baseClass',
  'hp', 'mp', 'level', 'map', 'x', 'y', 'z', 'effects',
  'agro', 'allegianceReputation', 'hostility', 'aquaticOnly',
  'items.equipment.leftHand', 'items.equipment.rightHand',
  'items.equipment.armor', 'items.equipment.robe1', 'items.equipment.robe2',
  'onlyVisibleTo', 'totalStats.stealth', 'totalStats.wil', 'totalStats.cha'
];

interface RBushCharacter {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  uuid: string;
}

export class MapState {

  private spawners: Spawner[] = [];
  private spawnersById: Record<string, Spawner> = {};

  private players = new RBush();
  private npcs = new RBush();

  private bushStorage: Record<string, RBushCharacter> = {};

  private npcsByUUID: Record<string, INPC> = {};
  private playersByUUID: Record<string, IPlayer> = {};
  private npcsBySpawner: Record<string, Spawner> = {};
  private spawnersByName: Record<string, Spawner> = {};

  private playerKnowledgePositions = {};

  private openDoors: Record<number, boolean> = {};

  public get allNPCS(): INPC[] {
    return Object.values(this.npcsByUUID);
  }

  public get allSpawners(): Spawner[] {
    return this.spawners;
  }

  constructor(private game: Game, private map: WorldMap) {
    this.createSpawners();
  }

  private createSpawners() {
    this.createDefaultSpawner();
    this.createOtherSpawners();
  }

  // create green spawner
  private createDefaultSpawner() {
    const npcDefs = this.map.allDefaultNPCs.map(npc => {
      if (!npc.properties || !npc.properties.tag) throw new Error(`NPC on ${this.map.name} ${npc.x / 64},${(npc.y / 64) - 1} has no tag!`);

      const npcDefF = this.game.contentManager.getNPCScript(npc.properties.tag);
      if (!npcDefF) throw new Error(`Script ${npc.properties.tag} does not exist for NPC ${npc.name}`);

      const npcDef = cloneDeep(npcDefF);

      npcDef.x = npc.x / 64;
      npcDef.y = (npc.y / 64) - 1;
      npcDef.sprite = npc.gid - this.map.mapData.tiledJSON.tilesets[3].firstgid;
      npcDef.allegiance = npcDef.allegiance || Allegiance.None;
      npcDef.alignment = npcDef.alignment || Alignment.Neutral;
      npcDef.hostility = npcDef.hostility || Hostility.Never;
      npcDef.name = npc.name || npcDef.name;

      npcDef.extraProps = npc.properties || {};

      return npcDef;
    }).filter(Boolean);

    npcDefs.forEach(def => {
      const spawner = new Spawner(this.game, this.map, this, {
        x: 0,
        y: 0,
        map: this.map.name,
        name: `${this.map.name} Green NPC Spawner (${def.tag})`,
        leashRadius: -1,
        randomWalkRadius: 0,
        initialSpawn: 0,
        maxCreatures: 1,
        respawnRate: 30,
        requireDeadToRespawn: true,
        removeDeadNPCs: false,
        doInitialSpawnImmediately: true,
        eliteTickCap: -1,
        respectKnowledge: false,
        npcDefs: [def]
      } as Partial<Spawner>);

      this.addSpawner(spawner);
    });
  }

  // create mob spawners
  private createOtherSpawners() {
    const spawnerSavedData = this.game.groundManager.getMapSpawners(this.map.name);

    this.map.allSpawners.forEach(spawner => {
      const spawnerX = spawner.x / 64;
      const spawnerY = (spawner.y / 64) - 1;
      const tag = spawner.properties.tag;
      if (!tag) throw new Error(`Spawner ${this.map.name} - ${spawnerX},${spawnerY} has no tag!`);

      const spawnerDataF = this.game.contentManager.getSpawnerByTag(tag);
      if (!spawnerDataF) throw new Error(`Tagged spawner ${tag} does not exist (if this is an NPC, it's on the wrong layer).`);

      const spawnerData = cloneDeep(spawnerDataF);

      spawnerData.name = spawner.name;
      spawnerData.x = spawnerX;
      spawnerData.y = spawnerY;
      spawnerData.doInitialSpawnImmediately = spawnerData.initialSpawn > 0;

      if (spawnerData.shouldSerialize) {
        const checkSpawner = spawnerSavedData.find(s => s.x === spawnerX && s.y === spawnerY);
        if (checkSpawner) {
          spawnerData.currentTick = checkSpawner.currentTick;

          if (spawnerData.currentTick > 0) {
            spawnerData.doInitialSpawnImmediately = false;
          }
        }
      }

      extend(spawnerData, spawner.properties);

      if (spawner.properties.lairName) {
        spawnerData.npcIds = [spawner.properties.lairName];
        spawnerData.respectKnowledge = false;
      }

      if (spawner.properties.resourceName) spawnerData.npcIds = [spawner.properties.resourceName];

      const createdSpawner = new Spawner(this.game, this.map, this, spawnerData as Partial<Spawner>);
      this.addSpawner(createdSpawner);
    });
  }

  // add spawner to our list of tickable spawners
  public addSpawner(spawner: Spawner) {
    this.spawners.push(spawner);
    this.spawnersById[spawner.id] = spawner;
    this.spawnersByName[spawner.spawnerName] = spawner;
  }

  // remove a dead or useless spawner
  public removeSpawner(spawner: Spawner) {
    this.spawners = this.spawners.filter(x => x !== spawner);
    delete this.spawners[spawner.id];
    delete this.spawners[spawner.spawnerName];
  }

  // get all possible serializable spawners for quit
  public getSerializableSpawners(): ISerializableSpawner[] {
    return this.spawners.filter(x => x.canBeSaved).map(s => ({
      ...s.pos,
      name: s.spawnerName,
      currentTick: s.currentTickForSave
    })).filter(s => s.currentTick > 0);
  }

  // check if door is open
  public isDoorOpen(id: number) {
    return this.openDoors[id];
  }

  // open door
  public openDoor(id: number) {
    this.setDoorState(id, true);
  }

  // close door
  public closeDoor(id: number) {
    this.setDoorState(id, false);
  }

  public setDoorState(id: number, state: boolean) {
    this.openDoors[id] = state;

    const door = this.map.findDoorById(id);
    door.density = !state;
    door.opacity = !state;

    this.triggerAndSendUpdateWithFOV(door.x / 64, (door.y / 64) - 1);
  }

  // tick spawners (respawn, buffs, etc)
  public steadyTick(timer) {
    this.spawners.forEach((s, i) => {
      const now = Date.now();
      // timer.startTimer(`spawner-${i}-${s.spawnerName}-${now}`);
      s.steadyTick();
      // timer.stopTimer(`spawner-${i}-${s.spawnerName}-${now}`);
    });
  }

  // tick spawner npcs
  public npcTick() {
    this.spawners.forEach(s => s.npcTick());
  }

  public isAnyNPCWithId(npcId: string) {
    return Object.values(this.npcsByUUID).find(x => x.npcId === npcId);
  }

  // get any players that care about x,y
  public getPlayerKnowledgeForXY(x: number, y: number): Record<string, any> {
    return get(this.playerKnowledgePositions, [x, y]);
  }

  // get any players that care about x,y
  public getPlayerObjectsWithKnowledgeForXY(x: number, y: number): IPlayer[] {
    const uuids = Object.keys(get(this.playerKnowledgePositions, [x, y], {}));
    return uuids.map(uuid => this.playersByUUID[uuid]);
  }

  // check if there are any players that care about x,y
  public isThereAnyKnowledgeForXY(x: number, y: number): boolean {
    return Object.keys(get(this.playerKnowledgePositions, [x, y], {})).length !== 0;
  }

  // format for rbush
  private toRBushFormat(character: ICharacter): RBushCharacter {
    return {
      minX: character.x,
      minY: character.y,
      maxX: character.x,
      maxY: character.y,
      uuid: character.uuid
    };
  }

  // query functions

  // get all PLAYERS from the quadtree
  private getPlayersFromQuadtrees(ref: { x: number; y: number }, radius: number = 0): Player[] {
    return this.players
      .search({ minX: ref.x - radius, maxX: ref.x + radius, minY: ref.y - radius, maxY: ref.y + radius })
      .map(({ uuid }) => this.playersByUUID[uuid])
      .filter(Boolean);
  }

  // get all NPCS from the quadtree
  private getNPCsFromQuadtrees(ref: { x: number; y: number }, radius: number = 0): INPC[] {
    return this.npcs
      .search({ minX: ref.x - radius, maxX: ref.x + radius, minY: ref.y - radius, maxY: ref.y + radius })
      .map(({ uuid }) => this.npcsByUUID[uuid])
      .filter(Boolean);
  }

  // get all PLAYERS AND NPCS from the quadtree
  private getAllTargetsFromQuadtrees(ref: { x: number; y: number }, radius: number = 0): ICharacter[] {
    return [
      ...this.getPlayersFromQuadtrees(ref, radius),
      ...this.getNPCsFromQuadtrees(ref, radius)
    ];
  }

  // get all PLAYERS in range (simple)
  public getAllPlayersInRange(ref: { x: number; y: number }, radius: number): Player[] {
    return this.getPlayersFromQuadtrees(ref, radius);
  }

  // get PLAYERS in range (query)
  public getPlayersInRange(ref: ICharacter, radius: number, except: string[] = [], useSight = true): ICharacter[] {
    return this.getPlayersFromQuadtrees(ref, radius)
      .filter(char => char
                   && !this.game.characterHelper.isDead(char)
                   && !except.includes(char.uuid)
                   && this.game.targettingHelper.isVisibleTo(ref, char, useSight));
  }

  // get PLAYERS in range (query, but able to use args from above)
  public getAllInRangeRaw(ref: { x: number; y: number }, radius: number, except: string[] = []): ICharacter[] {
    return this.getAllTargetsFromQuadtrees(ref, radius)
      .filter(char => char && !except.includes(char.uuid));
  }

  // get ALL characters in range
  public getAllInRange(ref: ICharacter, radius: number, except: string[] = [], useSight = true): ICharacter[] {
    return this.getAllTargetsFromQuadtrees(ref, radius)
      .filter(char => char
                   && !this.game.characterHelper.isDead(char)
                   && !except.includes(char.uuid)
                   && this.game.targettingHelper.isVisibleTo(ref, char, useSight));
  }

  // get ALL characters in range for an AOE
  public getAllInRangeForAOE(ref: ICharacter | { x: number; y: number; map: string }, radius: number, except: string[] = []): ICharacter[] {
    return this.getAllTargetsFromQuadtrees(ref, radius)
      .filter(char => char
                   && !this.game.characterHelper.isDead(char)
                   && !except.includes(char.uuid));
  }

  // get ALL characters in range (even those that can't see ref)
  public getAllInRangeWithoutVisibilityTo(ref: ICharacter, radius: number, except: string[] = []): ICharacter[] {
    return this.getAllTargetsFromQuadtrees(ref, radius)
      .filter(char => char
                   && !this.game.characterHelper.isDead(char)
                   && !except.includes(char.uuid));
  }

  // get ONLY HOSTILES in range
  public getAllHostilesInRange(ref: ICharacter, radius: number): ICharacter[] {
    const targets = this.getAllInRange(ref, radius);
    return targets.filter((target: ICharacter) => this.game.targettingHelper.checkTargetForHostility(ref, target));
  }

  // get ONLY HOSTILES that CAN SEE YOU in range
  public getAllHostilesWithoutVisibilityTo(ref: ICharacter, radius: number): ICharacter[] {
    const targets = this.getAllInRangeWithoutVisibilityTo(ref, radius);
    return targets.filter((target: ICharacter) => this.game.targettingHelper.checkTargetForHostility(ref, target));
  }

  // get ONLY HOSTILES that CAN SEE YOU in FOV
  public getAllHostilesWithoutVisibilityToInFOV(ref: ICharacter, radius: number): ICharacter[] {
    const targets = this.getAllInRangeWithoutVisibilityTo(ref, radius);

    return targets.filter((target: ICharacter) => {
      const inFOV = get(ref.fov, [target.x - ref.x, target.y - ref.y]) === FOVVisibility.CanSee;
      return inFOV && this.game.targettingHelper.checkTargetForHostility(ref, target);
    });
  }

  // get ONLY ALLIES in range
  public getAllAlliesInRange(ref: ICharacter, radius: number): ICharacter[] {
    const targets = this.getAllInRange(ref, radius);
    return targets.filter((target: ICharacter) => !this.game.targettingHelper.checkTargetForHostility(ref, target));
  }

  // get TARGETS for an NPC
  public getPossibleTargetsFor(me: INPC, radius = 0): ICharacter[] {

    const targetArray: ICharacter[] = this.getAllInRange(me, radius);

    return targetArray.filter((char: ICharacter) => {

      // no hitting myself
      if (me === char) return false;

      if (!this.game.visibilityHelper.canSeeThroughStealthOf(me, char)) return false;

      if (this.game.targettingHelper.checkTargetForHostility(me, char, {
        agro: true,
        allegiance: true,
        evil: true,
        faction: true,
        party: true,
        pet: true,
        self: true,
        friendly: false,
        def: false
      })) return true;

      return false;
    });
  }

  // state/quadtree functions

  // get the specific players that need to be updated for a particular coordinate
  public getPlayersToUpdate(x: number, y: number): Player[] {

    // eventually, the model may shift to using the knowledge hash, but for now... no
    // return Object.keys(get(this.playerKnowledgePositions, [x, y], {}));
    return this.getPlayersFromQuadtrees({ x, y }, 4);
  }

  // move an NPC or a player without the caller having to figure out which func to call
  public moveNPCOrPlayer(character: ICharacter, { oldX, oldY }): void {
    if (this.game.characterHelper.isPlayer(character)) {
      this.movePlayer(character as Player, { oldX, oldY });
    } else {
      this.moveNPC(character as INPC, { oldX, oldY });
    }
  }

  // update all players for a particular coordinate as well as their FOV
  public triggerAndSendUpdate(x: number, y: number, triggeringPlayer?: Player) {
    const playersToUpdate = this.getPlayersToUpdate(x, y);
    playersToUpdate
      .filter(p => p !== triggeringPlayer)
      .forEach(p => {
        this.triggerFullUpdateForPlayer(p);
      });
  }

  // update all players for a particular coordinate
  public triggerAndSendUpdateWithFOV(x: number, y: number, triggeringPlayer?: Player) {
    const playersToUpdate = this.getPlayersToUpdate(x, y);
    playersToUpdate
      .filter(p => p !== triggeringPlayer)
      .forEach(p => {
        this.game.visibilityHelper.calculatePlayerFOV(p);
        this.triggerFullUpdateForPlayer(p);
      });
  }

  // trigger a full update for a particular player
  public triggerFullUpdateForPlayer(player: Player) {
    this.updateStateForPlayer(player);
    this.onlyUpdatePlayer(player);
  }

  // update only player related stuff
  private onlyUpdatePlayer(player: Player) {
    this.game.transmissionHelper.generateAndQueuePlayerPatches(player);
  }

  // update the entire gamestate for the players fov
  private updateStateForPlayer(player: Player) {
    const state = this.game.playerManager.getPlayerState(player);
    if (!state) return;

    // update players
    this.triggerPlayerUpdateForPlayer(player);

    // update npcs
    this.triggerNPCUpdateForPlayer(player);

    // update ground
    this.triggerGroundUpdateForPlayer(player);

    // update doors
    state.openDoors = this.openDoors;
  }

  private triggerPlayerUpdateForPlayer(player: IPlayer) {
    const state = this.game.playerManager.getPlayerState(player);
    if (!state) return;

    // update players
    const nearbyPlayers = this.players
      .search({ minX: player.x - 4, maxX: player.x + 4, minY: player.y - 4, maxY: player.y + 4 })
      .filter(({ uuid }) => uuid !== player.uuid)
      .filter(p => this.game.visibilityHelper.canSeeThroughStealthOf(player, this.playersByUUID[p.uuid]))
      .map(({ uuid }) => pick(this.playersByUUID[uuid], PLAYER_KEYS))
      .filter(Boolean);

    state.players = keyBy(nearbyPlayers, 'uuid');
  }

  private triggerNPCUpdateForPlayer(player: IPlayer) {
    const state = this.game.playerManager.getPlayerState(player);
    if (!state) return;

    // update players
    const nearbyNPCs = this.npcs
      .search({ minX: player.x - 4, maxX: player.x + 4, minY: player.y - 4, maxY: player.y + 4 })
      .filter(p => this.game.visibilityHelper.canSeeThroughStealthOf(player, this.npcsByUUID[p.uuid]))
      .map(({ uuid }) => pick(this.npcsByUUID[uuid], NPC_KEYS))
      .filter(Boolean);

    state.npcs = keyBy(nearbyNPCs, 'uuid');
  }

  private triggerGroundUpdateForPlayer(player: IPlayer) {
    if (!player) return;

    const state = this.game.playerManager.getPlayerState(player);
    if (!state) return;

    // update players
    state.ground = this.getGroundVision(player.x, player.y, 4);
  }

  // player functions
  public addPlayer(player: Player) {
    this.playersByUUID[player.uuid] = player;

    this.generateKnowledgeRadius({ uuid: player.uuid, x: player.x, y: player.y }, true);

    const rbushPlayer = this.toRBushFormat(player);
    this.bushStorage[player.uuid] = rbushPlayer;

    this.players.insert(rbushPlayer);

    this.triggerAndSendUpdate(player.x, player.y, player);
  }

  public removePlayer(player: Player) {
    delete this.playersByUUID[player.uuid];

    this.generateKnowledgeRadius(player, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    delete this.bushStorage[player.uuid];

    this.players.remove(rbushPlayer);

    this.triggerAndSendUpdate(player.x, player.y, player);
  }

  private movePlayer(player: Player, { oldX, oldY }) {

    // this can happen if you join the game while dead and need to teleport between maps
    if (!this.bushStorage[player.uuid]) return;

    this.triggerAndSendUpdate(oldX, oldY, player);

    this.generateKnowledgeRadius({ uuid: player.uuid, x: oldX, y: oldY }, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    this.players.remove(rbushPlayer);

    rbushPlayer.minX = rbushPlayer.maxX = player.x;
    rbushPlayer.minY = rbushPlayer.maxY = player.y;

    this.players.insert(rbushPlayer);

    this.generateKnowledgeRadius({ uuid: player.uuid, x: player.x, y: player.y }, true);

    this.triggerAndSendUpdate(player.x, player.y, player);
    this.triggerFullUpdateForPlayer(player);
  }

  // generate a radius that will notify a player anytime something there changes (npc, player, ground, door state)
  private generateKnowledgeRadius(player: { uuid: string; x: number; y: number }, doesKnow: boolean) {
    const knowledgeRadius = 8;

    for (let x = player.x - knowledgeRadius; x <= player.x + knowledgeRadius; x++) {
      for (let y = player.y - knowledgeRadius; y <= player.y + knowledgeRadius; y++) {
        if (doesKnow) setWith(this.playerKnowledgePositions, [x, y, player.uuid], true, Object);
        else          unset(this.playerKnowledgePositions, [x, y, player.uuid]);
      }
    }
  }

  // npc functions
  public addNPC(npc: INPC, spawner: Spawner) {
    this.npcsByUUID[npc.uuid] = npc;
    this.npcsBySpawner[npc.uuid] = spawner;
    this.game.worldManager.addCharacter(npc);

    const rbushNPC = this.toRBushFormat(npc);
    this.bushStorage[npc.uuid] = rbushNPC;

    this.npcs.insert(rbushNPC);

    this.triggerAndSendUpdate(npc.x, npc.y);
  }

  public removeNPC(npc: INPC) {
    delete this.npcsByUUID[npc.uuid];
    this.game.worldManager.removeCharacter(npc);

    const rbushNPC = this.bushStorage[npc.uuid];
    delete this.bushStorage[npc.uuid];

    this.npcs.remove(rbushNPC);

    this.triggerAndSendUpdate(npc.x, npc.y);
  }

  private moveNPC(npc: INPC, { oldX, oldY }) {
    this.triggerAndSendUpdate(oldX, oldY);

    const rbushNPC = this.bushStorage[npc.uuid];
    this.npcs.remove(rbushNPC);

    rbushNPC.minX = rbushNPC.maxX = npc.x;
    rbushNPC.minY = rbushNPC.maxY = npc.y;

    this.npcs.insert(rbushNPC);

    this.triggerAndSendUpdate(npc.x, npc.y);
  }

  public getCharacterByUUID(uuid: string): ICharacter | null {
    return this.npcsByUUID[uuid] || this.playersByUUID[uuid];
  }

  public getNPCSpawner(uuid: string): Spawner | null {
    return this.npcsBySpawner[uuid];
  }

  public getNPCSpawnerByName(name: string): Spawner | null {
    return this.spawnersByName[name];
  }

  public getNPCSpawnersByName(name: string): Spawner[] {
    return this.spawners.filter(x => x.spawnerName === name);
  }

  // GROUND FUNCTIONS
  public getGroundVision(x: number, y: number, radius = 4): IGround {
    return this.game.groundManager.getGroundAround(this.map.name, x, y, radius);
  }

  // add multiple items to the ground across various x/y
  public addItemsToGroundSpread(
    itemlocs: Array<{ x: number; y: number; item: ISimpleItem }>,
    center: { x: number; y: number },
    radius = 0,
    forceSave = false
  ): void {
    itemlocs.forEach(ref => {
      const destroyOnDrop = this.game.itemHelper.getItemProperty(ref.item, 'destroyOnDrop');
      if (destroyOnDrop) return;

      this.game.groundManager.addItemToGround(this.map.name, ref.x, ref.y, ref.item, forceSave);
    });

    // if player knowledge x/y, update ground
    for (let x = center.x - radius; x < center.x + radius; x++) {
      for (let y = center.y - radius; y < center.y + radius; y++) {
        this.triggerGroundUpdateInRadius(x, y);
      }
    }
  }

  // add multiple items to the ground at x/y
  public addItemsToGround(x: number, y: number, items: ISimpleItem[], forceSave = false): void {
    items.forEach(item => {
      const destroyOnDrop = this.game.itemHelper.getItemProperty(item, 'destroyOnDrop');
      if (destroyOnDrop) return;

      this.game.groundManager.addItemToGround(this.map.name, x, y, item, forceSave);
    });

    // if player knowledge x/y, update ground
    this.triggerGroundUpdateInRadius(x, y);
  }

  // add a single item to the ground at x/y
  public addItemToGround(x: number, y: number, item: ISimpleItem, forceSave = false): void {

    const destroyOnDrop = this.game.itemHelper.getItemProperty(item, 'destroyOnDrop');
    if (destroyOnDrop) return;

    this.game.groundManager.addItemToGround(this.map.name, x, y, item, forceSave);

    // if player knowledge x/y, update ground
    this.triggerGroundUpdateInRadius(x, y);
  }

  public getEntireGround(x: number, y: number): Record<ItemClass, IGroundItem[]> {
    return this.game.groundManager.getEntireGround(this.map.name, x, y);
  }

  public getItemsFromGround(x: number, y: number, itemClass: ItemClass, uuid?: string, count = 1): IGroundItem[] {
    return this.game.groundManager.getItemsFromGround(this.map.name, x, y, itemClass, uuid, count);
  }

  public removeItemsFromGround(x: number, y: number, items: IGroundItem[]): void {
    items.forEach(item => {
      const itemClass = this.game.itemHelper.getItemProperty(item.item, 'itemClass');
      this.game.groundManager.removeItemFromGround(this.map.name, x, y, itemClass, item.item.uuid, item.count);
    });

    // if player knowledge x/y, update ground
    this.triggerGroundUpdateInRadius(x, y);
  }

  public removeItemFromGround(x: number, y: number, itemClass: ItemClass, uuid: string, count = 1): void {
    this.game.groundManager.removeItemFromGround(this.map.name, x, y, itemClass, uuid, count);

    // if player knowledge x/y, update ground
    this.triggerGroundUpdateInRadius(x, y);
  }

  // update all npcs for players in radius
  public triggerNPCAndPlayerUpdateInRadius(x: number, y: number) {
    this.getPlayerObjectsWithKnowledgeForXY(x, y).forEach(player => {
      this.triggerNPCUpdateForPlayer(player);
      this.triggerPlayerUpdateForPlayer(player);
    });
  }

  // update all npcs for players in radius
  public triggerNPCUpdateInRadius(x: number, y: number) {
    this.getPlayerObjectsWithKnowledgeForXY(x, y).forEach(player => this.triggerNPCUpdateForPlayer(player));
  }

  // update all players for players in radius
  public triggerPlayerUpdateInRadius(x: number, y: number) {
    this.getPlayerObjectsWithKnowledgeForXY(x, y).forEach(player => this.triggerPlayerUpdateForPlayer(player));
  }

  // update all players for players in radius
  public triggerGroundUpdateInRadius(x: number, y: number) {
    this.getPlayerObjectsWithKnowledgeForXY(x, y).forEach(player => this.triggerGroundUpdateForPlayer(player));
  }

  // handle a map event
  public handleEvent(event: string, trigger: ICharacter): void {
    this.game.worldManager.getMapScript(this.map.name)?.handleEvent(this.game, event, { trigger });
  }

}
