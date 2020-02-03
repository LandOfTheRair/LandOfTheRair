import { Injectable } from 'injection-js';
import { wrap } from 'mikro-orm';
import uuid from 'uuid/v4';

import { BaseService, Currency, Direction, initializePlayer, IPlayer, Skill, Stat } from '../../interfaces';
import { Player } from '../../models';
import { WorldManager } from '../data';


@Injectable()
export class PlayerHelper extends BaseService {

  constructor(private world: WorldManager) {
    super();
  }

  public init() {}

  public migrate(player: Player): void {
    if (!player.uuid) player.uuid = uuid();
    if (!player.dir) player.dir = Direction.South;
    if (!player.actionQueue) player.actionQueue = { fast: [], slow: [] };

    const playerPristine = initializePlayer(player);
    wrap(player).assign(playerPristine, { mergeObjects: true });
  }

  public tick(player: Player, type: 'fast'|'slow'): void {

    // do actions if we have any
    if (player.actionQueue) {
      const queue = player.actionQueue[type] || [];

      const actions = type === 'fast' ? 1 : (this.getStat(player, Stat.ActionSpeed) || 1);

      for (let i = 0; i < actions; i++) {
        const command = queue.shift();
        if (!command) continue;

        command();
      }
    }

    // if we're on a dense tile, "respawn"
    const { map } = this.world.getMap(player.map);
    if (map.getWallAt(player.x, player.y) || map.getDenseDecorAt(player.x, player.y)) {
      this.teleportToRespawnPoint(player);
    }
  }

  // teleport a player to their respawn point
  public teleportToRespawnPoint(player: Player): void {
    this.teleport(player, player.respawnPoint.x, player.respawnPoint.y, player.respawnPoint.map);
  }

  // reset swim level, fov, region desc
  public resetStatus(player: Player, ignoreMessages?: boolean) {
    // TODO: fov
    // TODO: swimming, drowning

    if (!ignoreMessages) {
      // TODO: send messages
    }
  }

  // teleport a player to a new location
  public teleport(player: Player, x: number, y: number, map: string = player.map): void {
    player.x = x;
    player.y = y;

    const { state } = this.world.getMap(player.map);

    if (player.map === map) {
      state.moveNPCOrPlayer(player);

    } else {
      state.removePlayer(player);

      const { state: newState } = this.world.getMap(map);
      player.map = map;
      newState.addPlayer(player);
    }
  }

  // get a stat from a player, or 0
  public getStat(player: IPlayer, stat: Stat): number {
    return player.stats[stat] || 0;
  }

  // flag a certain skill for a player
  public flagSkill(player: IPlayer, skill: Skill|Skill[]): void {
    player.flaggedSkills = Array.isArray(skill) ? skill : [skill];
  }

  // gain exp for a player
  public gainExp(player: IPlayer, xpGained: number): void {
    if (player.gainingAXP && xpGained > 0) return;

    // TODO: modify xpGained for sub
    if (isNaN(xpGained)) throw new Error(`XP gained for ${player.name} is NaN!`);
    player.exp += Math.max(Math.floor(player.exp + xpGained), 0);

  }

  // gain axp for a player
  public gainAxp(player: IPlayer, axpGained: number): void {
    if (!player.gainingAXP && axpGained > 0) return;

    // TODO: modify axpGained for sub
    if (isNaN(axpGained)) throw new Error(`AXP gained for ${player.name} is NaN!`);
    player.axp = Math.max(Math.floor(player.axp + axpGained), 0);

  }

  // gain skill for a player
  public gainSkill(player: IPlayer, skill: Skill, skillGained: number): void {

    // TODO: modify skillGained for sub
    if (isNaN(skillGained)) throw new Error(`Skill gained for ${player.name} is NaN!`);

    player.skills[skill] = Math.max((player.skills[skill] ?? 0) + skillGained);

  }

  // gain all currently flagged skills
  public gainCurrentSkills(player: IPlayer, skillGained: number): void {
    if (!player.flaggedSkills || !player.flaggedSkills.length) return;

    const [primary, secondary, tertiary, quaternary] = player.flaggedSkills;

    if (quaternary) {
      this.gainSkill(player, primary, skillGained * 0.45);
      this.gainSkill(player, secondary, skillGained * 0.25);
      this.gainSkill(player, tertiary, skillGained * 0.15);
      this.gainSkill(player, quaternary, skillGained * 0.15);

    } else if (tertiary) {
      this.gainSkill(player, primary, skillGained * 0.55);
      this.gainSkill(player, secondary, skillGained * 0.25);
      this.gainSkill(player, tertiary, skillGained * 0.20);

    } else if (secondary) {
      this.gainSkill(player, primary, skillGained * 0.75);
      this.gainSkill(player, secondary, skillGained * 0.25);

    } else {
      this.gainSkill(player, primary, skillGained);
    }
  }

  // gain currency for a player
  public gainCurrency(player: IPlayer, currency: Currency = Currency.Gold, currencyGained: number): void {
    if (isNaN(currencyGained)) throw new Error(`Currency gained ${currency} for ${player.name} is NaN!`);

    player.currency[currency] = Math.max(Math.floor((player.currency[currency] ?? 0) + currencyGained), 0);

  }

}
