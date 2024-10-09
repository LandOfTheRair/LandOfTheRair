import { Injectable } from 'injection-js';
import { GameEvent, IRNGDungeonMetaConfig } from '../../interfaces';
import { Player } from '../../models';

import { BaseService } from '../../models/BaseService';

@Injectable()
export class RNGDungeonManager extends BaseService {
  // yyyy-MM-dd timestamp of last reset; used to prevent resetting the dungeon too often
  private lastDungeonReset = '';

  public init(): void {
    this.game.gameEvents.once(GameEvent.GameStarted, () => {
      this.generateDungeons();
    });
  }

  public tick(timer): void {
    const now = Date.now();

    timer.startTimer(`rngdungeon-${now}`);

    if (this.shouldReset()) {
      this.generateDungeons();
    }

    timer.stopTimer(`rngdungeon-${now}`);
  }

  public generateDungeons(): void {
    this.game.logger.log('RNGDungeonManager', 'Generating dungeons...');

    // reset the timestamp first, just in case the tick comes around again too quickly
    this.setLastDungeonReset();

    const dungeons =
      this.game.contentManager.rngDungeonConfigData.dungeonConfigs;

    // lock the maps, kick all players out before generation
    dungeons.forEach((map) => {
      this.lockAndKickFrom(map.name);
    });

    // we want to generate the maps afterwards
    dungeons.forEach((map) => {
      this.generateDungeon(map);
    });
  }

  // generate a dungeon, get the json, etc
  public generateDungeon(map: IRNGDungeonMetaConfig, seed?: number): void {
    // do this again in case this function is called directly; not too likely but needs to be done
    this.lockAndKickFrom(map.name);

    // generate a new map
    this.game.rngDungeonGenerator.generateDungeon(map, seed);
  }

  // lock a map, and kick all the players out
  private lockAndKickFrom(map: string): void {
    const mapData = this.game.worldManager.getMap(map);
    if (!mapData || !mapData.map) return;

    mapData.map.properties.blockEntry = true;

    this.game.worldManager.getPlayersInMap(map).forEach((p) => {
      // first, we check if the map is a "respawnKick" map, which means it will kick us back to the maps specified respawn time
      const props = mapData?.map.properties;

      if (
        props &&
        props.respawnKick &&
        props.kickMap &&
        props.kickX &&
        props.kickY
      ) {
        const respawnMap = props.kickMap;
        const respawnX = props.kickX ?? 0;
        const respawnY = props.kickY ?? 0;

        this.game.teleportHelper.teleport(p as Player, {
          x: respawnX,
          y: respawnY,
          map: respawnMap,
        });

        // if it isn't, then we can teleport to our respawn point
      } else {
        this.game.teleportHelper.teleportToRespawnPoint(p as Player);
      }

      this.game.messageHelper.sendLogMessageToPlayer(p, {
        message: 'The ether forces you out of your current location!',
      });
    });
  }

  // check if we should reset (if the timestamps differ)
  private shouldReset(): boolean {
    return (
      this.lastDungeonReset !==
      this.game.dailyHelper.resetTime.toFormat('yyyy-MM-dd')
    );
  }

  // set the reset timestamp
  private setLastDungeonReset(): void {
    const resetTime = this.game.dailyHelper.resetTime;
    this.lastDungeonReset = resetTime.toFormat('yyyy-MM-dd');
  }
}
