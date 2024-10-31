import { Injectable } from 'injection-js';

import { truncate } from 'lodash';

import {
  GameAction,
  GameServerResponse,
  ICharacter,
  IDialogChatAction,
  IPlayer,
} from '../../interfaces';
import { Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import { WorldManager } from '../data/WorldManager';

@Injectable()
export class TeleportHelper extends BaseService {
  constructor(private worldManager: WorldManager) {
    super();
  }

  public init() {}

  public setCharXY(char: ICharacter, x: number, y: number) {
    const oldPos = { oldX: char.x, oldY: char.y };

    char.x = x;
    char.y = y;

    const mapData = this.game.worldManager.getMap(char.map);
    if (!mapData) return;

    const { map, state } = mapData;

    if (
      char.x > map.width - 4 ||
      char.x < 4 ||
      char.y > map.height - 4 ||
      char.y < 4
    ) {
      char.x = map.respawnPoint.x;
      char.y = map.respawnPoint.y;
      this.game.messageHelper.sendSimpleMessage(
        char,
        `This teleport has gone out of bounds to ${x}, ${y} - please report this to a GM.`,
      );
    }

    state.moveNPCOrPlayer(char, oldPos);

    if (this.game.characterHelper.isPlayer(char)) {
      this.game.visibilityHelper.calculatePlayerFOV(char as Player);
    }
  }

  // teleport a player to their respawn point
  public teleportToRespawnPoint(player: Player): void {
    this.teleport(player, {
      x: player.respawnPoint.x,
      y: player.respawnPoint.y,
      map: player.respawnPoint.map,
    });
  }

  // whether or not you can enter a map - instanced maps require you to be in a party
  public canEnterMap(player: Player, map: string): boolean {
    if (this.game.worldManager.isDungeon(map)) {
      return this.game.partyHelper.isInParty(player);
    }

    return true;
  }

  // teleport a player somewhere
  public teleport(
    player: Player,
    { x, y, map }: { x: number; y: number; map?: string },
  ): boolean {
    // if we're not changing maps, move on this one
    if (!map || player.map === map) {
      this.setCharXY(player, x, y);
      this.game.playerHelper.resetStatus(player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(player);
    }

    // check if the new map even exists before going
    if (map && player.map !== map) {
      // get the real destination name (in case of dungeon) and ensure it exists before traveling there
      const destinationMapName = this.worldManager.getDestinationMapName(
        player,
        map,
      );
      this.game.worldManager.ensureMapExists(
        map,
        this.game.partyHelper.partyName(player),
        destinationMapName,
      );

      const mapData = this.worldManager.getMap(destinationMapName);
      if (!mapData) return false;

      // check if the map exists (it may not; invalid refs happen)
      if (!mapData.state) {
        this.game.messageHelper.sendLogMessageToPlayer(player, {
          message: `Warning: map ${map} does not exist.`,
        });
        return false;
      }

      // some maps can temporarily block entry
      if (mapData.map.properties.blockEntry) {
        const message =
          mapData.map.properties.blockEntryMessage ||
          'That area is closed temporarily.';
        this.game.messageHelper.sendLogMessageToPlayer(player, { message });
        return false;
      }

      if (!player.isBeingForciblyRespawned) {
        this.game.worldManager.leaveMap(player);
      } else {
        this.game.worldManager
          .getMapStateForCharacter(player)
          ?.removePlayer(player);
      }

      // order of operations here is REALLY important

      // first we update the map, then join the map
      player.map = destinationMapName;
      this.game.worldManager.joinMap(player);

      // then we send a blank FOV patch to the player so they don't see a random spot on the map
      this.game.transmissionHelper.sendMovementPatch(player, true);

      // then we update their x/y to the new x/y
      player.x = x;
      player.y = y;

      // then we send them the new map
      this.game.transmissionHelper.sendActionToPlayer(
        player,
        GameAction.GameSetMap,
        { map: mapData.map.mapData },
      );

      // then we update their status based on the new map, and send them the new movement patch with their real FOV
      this.game.playerHelper.resetStatus(player, { sendFOV: false });
      this.game.transmissionHelper.sendMovementPatch(player);

      if (this.game.worldManager.isDungeon(player.map)) {
        this.game.effectHelper.addEffect(player, '', 'EtherManipulation');
      }
    }

    return true;
  }

  // these are all related to the teleport skill
  public maxLocations(player: IPlayer): number {
    return 20 + this.game.traitHelper.traitLevelValue(player, 'ExpandedMemory');
  }

  public memorizeLocation(player: IPlayer, name: string): boolean {
    name = truncate(name, { length: 15, omission: '' }).trim();
    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return false;

    if (!map.canMemorize || !map.canTeleport(player)) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message:
          'The surroundings swirl together in your head, making it hard to concentrate.',
      });
      return false;
    }

    const maxTeleports = this.maxLocations(player);
    if (Object.keys(player.teleportLocations || {}).length >= maxTeleports) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'You find it difficult to remember any more locations.',
      });
      return false;
    }

    if (player.teleportLocations?.[name]) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'You already know a place by that name!',
      });
      return false;
    }

    player.teleportLocations = player.teleportLocations || {};
    player.teleportLocations[name] = {
      x: player.x,
      y: player.y,
      map: player.map,
    };

    return true;
  }

  public forgetLocation(player: IPlayer, name: string): boolean {
    if (player.teleportLocations?.[name]) {
      delete player.teleportLocations[name];
      return true;
    }

    return false;
  }

  public showTeleports(player: IPlayer, spell = 'teleport') {
    const teleports = Object.keys(player.teleportLocations || {});
    const teleportsCurrently = teleports.length;
    const teleportsMax = this.maxLocations(player);

    if (teleports.length === 0) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'You have not memorized any locations to teleport to.',
      });

      const memorizeChat: IDialogChatAction = {
        message: 'You need to memorize a new location first.',
        displayTitle: 'No Teleports',
        options: [
          { text: 'Cancel', action: 'noop' },
          {
            text: `Memorize New (${teleportsCurrently}/${teleportsMax})`,
            action: 'memorize',
          },
        ],
      };

      this.game.transmissionHelper.sendResponseToAccount(
        player.username,
        GameServerResponse.DialogChat,
        memorizeChat,
      );
      return;
    }

    const options = [
      { text: 'Nowhere', action: 'noop' },
      { text: 'Forget Location', action: 'forget' },
      {
        text: `Memorize New (${teleportsCurrently}/${teleportsMax})`,
        action: 'memorize',
      },
    ];

    let msg = `Your teleports (${teleportsCurrently}/${teleportsMax}):`;
    teleports.forEach((tp, i) => {
      msg = `${msg}<br>${i + 1}: ${tp} - ${player.teleportLocations[tp].map}`;
      options.push({
        text: `"${tp}" (${player.teleportLocations[tp].map})`,
        action: `cast ${spell} ${tp}`,
      });
    });

    this.game.messageHelper.sendLogMessageToPlayer(player, { message: msg });

    const formattedChat: IDialogChatAction = {
      message: 'Teleport to where?',
      displayTitle: 'Teleport',
      width: '600px',
      options,
    };

    this.game.transmissionHelper.sendResponseToAccount(
      player.username,
      GameServerResponse.DialogChat,
      formattedChat,
    );
  }
}
