
import RBush from 'rbush';

import { get, setWith, unset } from 'lodash';

import { Game } from '../../helpers';
import { WorldMap } from './Map';

import { ICharacter, IPlayer } from '../../interfaces';
import { Player } from '../orm';

interface RBushCharacter {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  uuid: string;
}

export class MapState {

  private players = new RBush();
  private npcs = new RBush();
  private groundItems = new RBush();

  private bushStorage: { [uuid: string]: RBushCharacter } = {};

  // TODO: ground manager, expire items unless bound,
    // trash has a 99% chance of breaking before hitting ground - condense items with same id but no mods

  private npcsByUUID: { [uuid: string]: ICharacter } = {};
  private playersByUUID: { [uuid: string]: IPlayer } = {};

  private playerKnowledgePositions = {};

  constructor(private game: Game, private map: WorldMap) {}

  public tick() {

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
  public getPlayerView(player: Player): ICharacter[] {
    // return players and npcs in view
    return [];
  }

  // get the specific players that need to be updated for a particular coordinate
  public getPlayersToUpdate(x: number, y: number): string[] {
    return Object.keys(get(this.playerKnowledgePositions, [x, y], {}));
  }

  // move an NPC or a player without the caller having to figure out which func to call
  public moveNPCOrPlayer(character: ICharacter): void {
    if ((character as IPlayer).username) {
      this.movePlayer(character as Player);
    } else {
      this.moveNPC(character);
    }
  }

  // update all players for a particular coordinate
  public triggerUpdate(x: number, y: number) {
    const playersToUpdate = this.getPlayersToUpdate(x, y);
  }

  // trigger a full update for a particular player
  public triggerFullUpdateForPlayer(player: Player) {
    this.game.transmissionHelper.patchPlayer(player);

    // TODO: also send npcs, items, players
  }

  // player functions
  public addPlayer(player: Player) {
    this.playersByUUID[player.uuid] = player;

    this.generateKnowledgeRadius({ uuid: player.uuid, x: player.x, y: player.y }, true);

    const rbushPlayer = this.toRBushFormat(player);
    this.bushStorage[player.uuid] = rbushPlayer;

    this.players.insert(rbushPlayer);

    this.triggerUpdate(player.x, player.y);
  }

  public removePlayer(player: Player) {
    this.generateKnowledgeRadius(player, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    delete this.bushStorage[player.uuid];

    this.players.remove(rbushPlayer);

    this.triggerUpdate(player.x, player.y);
  }

  private movePlayer(player: Player) {
    this.generateKnowledgeRadius(player, false);

    const rbushPlayer = this.bushStorage[player.uuid];
    this.players.remove(rbushPlayer);

    rbushPlayer.minX = rbushPlayer.maxX = player.x;
    rbushPlayer.minY = rbushPlayer.maxY = player.y;

    this.players.insert(rbushPlayer);

    this.generateKnowledgeRadius({ uuid: player.uuid, x: player.x, y: player.y }, true);

    this.triggerUpdate(player.x, player.y);
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
  public addNPC(npc: ICharacter) {
    this.npcsByUUID[npc.uuid] = npc;

    const rbushNPC = this.toRBushFormat(npc);
    this.bushStorage[npc.uuid] = rbushNPC;

    this.npcs.insert(rbushNPC);

    this.triggerUpdate(npc.x, npc.y);
  }

  public removeNPC(npc: ICharacter) {

    delete this.npcsByUUID[npc.uuid];

    const rbushNPC = this.bushStorage[npc.uuid];
    delete this.bushStorage[npc.uuid];

    this.npcs.remove(rbushNPC);

    this.triggerUpdate(npc.x, npc.y);
  }

  private moveNPC(npc: ICharacter) {
    const rbushNPC = this.bushStorage[npc.uuid];
    this.npcs.remove(rbushNPC);

    rbushNPC.minX = rbushNPC.maxX = npc.x;
    rbushNPC.minY = rbushNPC.maxY = npc.y;

    this.npcs.insert(rbushNPC);

    this.triggerUpdate(npc.x, npc.y);
  }

}
