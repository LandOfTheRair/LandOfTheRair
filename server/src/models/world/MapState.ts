
import RBush from 'rbush';

import { extend, get, keyBy, pick, setWith, size, unset } from 'lodash';

import { Game } from '../../helpers';
import { WorldMap } from './Map';

import { Alignment, Allegiance, Hostility, ICharacter, INPC, IPlayer } from '../../interfaces';
import { Player } from '../orm';
import { Spawner } from './Spawner';

const PLAYER_KEYS = [
  'dir', 'swimLevel', 'uuid', 'partyName', 'name', 'agro',
  'items.equipment.leftHand', 'items.equipment.rightHand',
  'items.equipment.armor', 'items.equipment.robe1', 'items.equipment.robe2',
  'affiliation', 'allegiance', 'alignment', 'baseClass', 'gender',
  'hp', 'mp', 'level', 'map', 'x', 'y', 'z', 'effects'
];

const NPC_KEYS = [
  'dir', 'swimLevel', 'uuid', 'name', 'sprite',
  'affiliation', 'allegiance', 'alignment', 'baseClass',
  'hp', 'mp', 'level', 'map', 'x', 'y', 'z', 'effects',
  'agro', 'allegianceReputation', 'hostility',
  'items.equipment.leftHand', 'items.equipment.rightHand',
  'items.equipment.armor', 'items.equipment.robe1', 'items.equipment.robe2',
  'onlyVisibleTo', 'totalStats.stealth', 'totalStats.wil'
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

  private players = new RBush();
  private npcs = new RBush();

  private bushStorage: { [uuid: string]: RBushCharacter } = {};

  private npcsByUUID: { [uuid: string]: INPC } = {};
  private playersByUUID: { [uuid: string]: IPlayer } = {};

  private playerKnowledgePositions = {};

  private openDoors: Record<number, boolean> = {};

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
      if (!npc.properties || !npc.properties.tag) return;  // TODO: throw an error here as soon as all maps are caught up

      const npcDef = this.game.contentManager.getNPCScript(npc.properties.tag);
      if (!npcDef) throw new Error(`Script ${npc.properties.tag} does not exist for NPC ${npc.name}`);

      npcDef.x = npc.x / 64;
      npcDef.y = (npc.y / 64) - 1;
      npcDef.sprite = npc.gid - this.map.mapData.tiledJSON.tilesets[3].firstgid;
      npcDef.allegiance = npcDef.allegiance || Allegiance.None;
      npcDef.alignment = npcDef.alignment || Alignment.Neutral;
      npcDef.hostility = npcDef.hostility || Hostility.Never;

      return npcDef;
    }).filter(Boolean);

    const spawner = new Spawner(this.game, this.map, this, {
      x: 0,
      y: 0,
      map: this.map.name,
      name: `${this.map.name} Green NPC Spawner`,
      leashRadius: -1,
      respawnRate: 300,
      requireDeadToRespawn: true,
      removeDeadNPCs: false,
      doInitialSpawnImmediately: true,
      eliteTickCap: -1,
      respectKnowledge: false,
      npcDefs
    } as Partial<Spawner>);

    this.addSpawner(spawner);
  }

  // create mob spawners
  private createOtherSpawners() {
    this.map.allSpawners.forEach(spawner => {
      const spawnerX = spawner.x / 64;
      const spawnerY = (spawner.y / 64) - 1;
      const tag = spawner.properties.tag;
      if (!tag) throw new Error(`Spawner ${this.map.name} - ${spawnerX},${spawnerY} has no tag!`);

      const spawnerData = this.game.contentManager.getSpawnerByTag(tag);
      if (!spawnerData) throw new Error(`Tagged spawner ${tag} does not exist.`);

      spawnerData.name = spawner.name;
      spawnerData.x = spawnerX;
      spawnerData.y = spawnerY;
      spawnerData.doInitialSpawnImmediately = spawnerData.initialSpawn > 0;

      extend(spawnerData, spawner.properties);

      if (spawner.properties.lairName) {
        spawnerData.npcIds = [spawner.properties.lairName];
        spawnerData.respectKnowledge = false;
      }

      if (spawner.properties.resourceName) spawnerData.npcIds = [spawner.properties.resourceName];

      const createdSpawner = new Spawner(this.game, this.map, this, spawnerData);
      this.addSpawner(createdSpawner);
    });
  }

  // add spawner to our list of tickable spawners
  public addSpawner(spawner: Spawner) {
    this.spawners.push(spawner);
  }

  // remove a dead or useless spawner
  public removeSpawner(spawner: Spawner) {
    this.spawners = this.spawners.filter(x => x !== spawner);
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

    this.triggerAndSendUpdate(door.x / 64, (door.y / 64) - 1);
  }

  // tick spawners (respawn, buffs, etc)
  public steadyTick() {
    this.spawners.forEach(s => s.steadyTick());
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
  private getPlayersFromQuadtrees(ref: { x: number, y: number }, radius: number = 0): Player[] {
    return this.players
      .search({ minX: ref.x - radius, maxX: ref.x + radius, minY: ref.y - radius, maxY: ref.y + radius })
      .map(({ uuid }) => this.playersByUUID[uuid])
      .filter(Boolean);
  }

  // get all NPCS from the quadtree
  private getNPCsFromQuadtrees(ref: { x: number, y: number }, radius: number = 0): INPC[] {
    return this.npcs
      .search({ minX: ref.x - radius, maxX: ref.x + radius, minY: ref.y - radius, maxY: ref.y + radius })
      .map(({ uuid }) => this.npcsByUUID[uuid])
      .filter(Boolean);
  }

  // get all PLAYERS AND NPCS from the quadtree
  private getAllTargetsFromQuadtrees(ref: { x: number, y: number }, radius: number = 0): ICharacter[] {
    return [
      ...this.getPlayersFromQuadtrees(ref, radius),
      ...this.getNPCsFromQuadtrees(ref, radius)
    ];
  }

  // get all PLAYERS in range (simple)
  public getAllPlayersInRange(ref: { x: number, y: number }, radius: number): Player[] {
    return this.getPlayersFromQuadtrees(ref, radius);
  }

  // get PLAYERS in range (query)
  public getPlayersInRange(ref: ICharacter, radius, except: string[] = [], useSight = true): ICharacter[] {
    return this.getPlayersFromQuadtrees(ref, radius)
      .filter(char => char
                   && !this.game.characterHelper.isDead(char)
                   && !except.includes(char.uuid)
                   && this.game.targettingHelper.isVisibleTo(ref, char, useSight));
  }

  // get PLAYERS in range (query, but able to use args from above)
  public getAllInRangeRaw(ref: { x: number, y: number }, radius, except: string[] = []): ICharacter[] {
    return this.getAllTargetsFromQuadtrees(ref, radius)
      .filter(char => char && !except.includes(char.uuid));
  }

  // get ALL characters in range
  public getAllInRange(ref: ICharacter, radius, except: string[] = [], useSight = true): ICharacter[] {
    return this.getAllTargetsFromQuadtrees(ref, radius)
      .filter(char => char
                   && !this.game.characterHelper.isDead(char)
                   && !except.includes(char.uuid)
                   && this.game.targettingHelper.isVisibleTo(ref, char, useSight));
  }

  // get ONLY HOSTILES in range
  public getAllHostilesInRange(ref: ICharacter, radius): ICharacter[] {
    const targets = this.getAllInRange(ref, radius);
    return targets.filter((target: ICharacter) => this.game.targettingHelper.checkTargetForHostility(ref, target));
  }

  // get ONLY ALLIES in range
  public getAllAlliesInRange(ref: ICharacter, radius): ICharacter[] {
    const targets = this.getAllInRange(ref, radius);
    return targets.filter((target: ICharacter) => !this.game.targettingHelper.checkTargetForHostility(ref, target));
  }

  // get TARGETS for an NPC
  public getPossibleTargetsFor(me: INPC, radius = 0): ICharacter[] {

    let targetArray: ICharacter[] = [];

    // optimization for thirsty monsters
    if (me.hostility === Hostility.Always && size(me.agro) === 0) {
      targetArray = this.getPlayersInRange(me, radius);
    } else {
      targetArray = this.getAllInRange(me, radius);
    }

    return targetArray.filter((char: ICharacter) => {

      // no hitting myself
      if (me === char) return false;

      // if they can't attack, they're not worth fighting
      if ((char as INPC).hostility === Hostility.Never) return false;

      // TODO: stealth affects sight
      // if(!me.canSeeThroughStealthOf(char)) return false;

      if (this.game.targettingHelper.checkTargetForHostility(me, char)) return true;

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
    if ((character as IPlayer).username) {
      this.movePlayer(character as Player, { oldX, oldY });
    } else {
      this.moveNPC(character as INPC, { oldX, oldY });
    }
  }

  // update all players for a particular coordinate
  public triggerAndSendUpdate(x: number, y: number, triggeringPlayer?: Player) {
    const playersToUpdate = this.getPlayersToUpdate(x, y);
    playersToUpdate
      .filter(p => p !== triggeringPlayer)
      .forEach(p => {
        this.game.playerHelper.resetStatus(p);
        this.triggerFullUpdateForPlayer(p);
      });
  }

  // trigger a full update for a particular player
  public triggerFullUpdateForPlayer(player: Player) {
    this.onlyUpdatePlayer(player);
    this.updateStateForPlayer(player);
  }

  // update only player related stuff
  private onlyUpdatePlayer(player: Player) {
    this.game.transmissionHelper.generateAndQueuePlayerPatches(player);
  }

  // update the entire gamestate for the players fov
  private updateStateForPlayer(player: Player) {
    const state = this.game.playerManager.getPlayerState(player);

    // update players
    const nearbyPlayers = this.players
      .search({ minX: player.x - 4, maxX: player.x + 4, minY: player.y - 4, maxY: player.y + 4 })
      .filter(({ uuid }) => uuid !== player.uuid)
      .map(({ uuid }) => pick(this.playersByUUID[uuid], PLAYER_KEYS))
      .filter(Boolean);

    state.players = keyBy(nearbyPlayers, 'uuid');

    // update npcs
    const nearbyNPCs = this.npcs
      .search({ minX: player.x - 4, maxX: player.x + 4, minY: player.y - 4, maxY: player.y + 4 })
      .map(({ uuid }) => pick(this.npcsByUUID[uuid], NPC_KEYS))
      .filter(Boolean);

    state.npcs = keyBy(nearbyNPCs, 'uuid');

    state.openDoors = this.openDoors;

    // TODO: also send ground
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
    this.generateKnowledgeRadius(player, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    delete this.bushStorage[player.uuid];

    this.players.remove(rbushPlayer);

    this.triggerAndSendUpdate(player.x, player.y, player);
  }

  private movePlayer(player: Player, { oldX, oldY }) {
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

  // generate a radius that will notify a player in the following circumstances:
  // - TODO: a character moves in or out
  // - TODO: a character changes visibility to the player
  // - TODO: a character changes their hand items or visible armor item
  // - TODO: a character health value changes
  // - TODO: a character hostility value changes
  // - TODO: an item drops or is removed
  private generateKnowledgeRadius(player: { uuid: string, x: number, y: number }, doesKnow: boolean) {
    for (let x = player.x - 3; x < player.x + 3; x++) {
      for (let y = player.y - 3; y < player.y + 3; y++) {
        if (doesKnow) setWith(this.playerKnowledgePositions, [x, y, player.uuid], true, Object);
        else          unset(this.playerKnowledgePositions, [x, y, player.uuid]);
      }
    }
  }

  // npc functions
  public addNPC(npc: INPC) {
    this.npcsByUUID[npc.uuid] = npc;

    const rbushNPC = this.toRBushFormat(npc);
    this.bushStorage[npc.uuid] = rbushNPC;

    this.npcs.insert(rbushNPC);

    this.triggerAndSendUpdate(npc.x, npc.y);
  }

  public removeNPC(npc: INPC) {

    delete this.npcsByUUID[npc.uuid];

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

}
