
import RBush from 'rbush';

import { keyBy, pick, setWith, unset } from 'lodash';

import { Game } from '../../helpers';
import { WorldMap } from './Map';

import { Alignment, Allegiance, Hostility, ICharacter, INPC, IPlayer } from '../../interfaces';
import { Player } from '../orm';
import { Spawner } from './Spawner';

const PLAYER_KEYS = [
  'dir', 'swimLevel', 'uuid', 'partyName', 'name',
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

  private npcsByUUID: { [uuid: string]: ICharacter } = {};
  private playersByUUID: { [uuid: string]: IPlayer } = {};

  private playerKnowledgePositions = {};

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
      if (!npc.properties.tag) return;  // TODO: throw an error here as soon as all maps are caught up

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
      name: 'Green NPC Spawner',
      leashRadius: -1,
      respawnRate: 300,
      doInitialSpawnImmediately: true,
      eliteTickCap: -1,
      npcDefs
    } as Partial<Spawner>);

    this.addSpawner(spawner);
  }

  private createOtherSpawners() {
    this.map.allSpawners.forEach(spawner => {
      // const spawner = new Spawner(this.game, this.map, this, )
    });
  }

  private addSpawner(spawner: Spawner) {
    this.spawners.push(spawner);
  }

  // tick spawners (respawn, buffs, etc)
  public steadyTick() {
    this.spawners.forEach(s => s.steadyTick());
  }

  // tick spawner npcs
  public npcTick() {
    this.spawners.forEach(s => s.npcTick());
  }

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

  // get the specific players that need to be updated for a particular coordinate
  public getPlayersToUpdate(x: number, y: number): Player[] {

    // eventually, the model may shift to using the knowledge hash, but for now... no
    // return Object.keys(get(this.playerKnowledgePositions, [x, y], {}));
    const playersInRange = this.players.search({ minX: x - 4, maxX: x + 4, minY: y - 4, maxY: y + 4 });

    return playersInRange.map(({ uuid }) => this.playersByUUID[uuid]).filter(Boolean);
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
  public triggerUpdate(x: number, y: number, triggeringPlayer?: Player) {
    const playersToUpdate = this.getPlayersToUpdate(x, y);
    playersToUpdate
      .filter(p => p !== triggeringPlayer)
      .forEach(p => this.triggerFullUpdateForPlayer(p));
  }

  // trigger a full update for a particular player
  public triggerFullUpdateForPlayer(player: Player) {
    this.game.transmissionHelper.generateAndQueuePlayerPatches(player);

    this.updateStateForPlayer(player);
  }

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

    // TODO: also send ground
  }

  // player functions
  public addPlayer(player: Player) {
    this.playersByUUID[player.uuid] = player;

    this.generateKnowledgeRadius({ uuid: player.uuid, x: player.x, y: player.y }, true);

    const rbushPlayer = this.toRBushFormat(player);
    this.bushStorage[player.uuid] = rbushPlayer;

    this.players.insert(rbushPlayer);

    this.triggerUpdate(player.x, player.y, player);
  }

  public removePlayer(player: Player) {
    this.generateKnowledgeRadius(player, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    delete this.bushStorage[player.uuid];

    this.players.remove(rbushPlayer);

    this.triggerUpdate(player.x, player.y, player);
  }

  private movePlayer(player: Player, { oldX, oldY }) {
    this.triggerUpdate(oldX, oldY, player);

    this.generateKnowledgeRadius(player, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    this.players.remove(rbushPlayer);

    rbushPlayer.minX = rbushPlayer.maxX = player.x;
    rbushPlayer.minY = rbushPlayer.maxY = player.y;

    this.players.insert(rbushPlayer);

    this.generateKnowledgeRadius({ uuid: player.uuid, x: player.x, y: player.y }, true);

    this.triggerUpdate(player.x, player.y, player);
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

    this.triggerUpdate(npc.x, npc.y);
  }

  public removeNPC(npc: INPC) {

    delete this.npcsByUUID[npc.uuid];

    const rbushNPC = this.bushStorage[npc.uuid];
    delete this.bushStorage[npc.uuid];

    this.npcs.remove(rbushNPC);

    this.triggerUpdate(npc.x, npc.y);
  }

  private moveNPC(npc: INPC, { oldX, oldY }) {
    this.triggerUpdate(oldX, oldY);

    const rbushNPC = this.bushStorage[npc.uuid];
    this.npcs.remove(rbushNPC);

    rbushNPC.minX = rbushNPC.maxX = npc.x;
    rbushNPC.minY = rbushNPC.maxY = npc.y;

    this.npcs.insert(rbushNPC);

    this.triggerUpdate(npc.x, npc.y);
  }

}
