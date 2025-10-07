import { Injectable } from 'injection-js';
import { isArray, random } from 'lodash';

import {
  canAct,
  getStat,
  hasLearned,
  hasLearnedFromItem,
  isDead,
  isPlayer,
} from '@lotr/characters';
import { hasEffect } from '@lotr/effects';
import {
  calcSkillLevelForCharacter,
  calcTradeskillLevelForCharacter,
  calculateSkillXPRequiredForLevel,
  calculateXPRequiredForLevel,
} from '@lotr/exp';
import type {
  Allegiance,
  BaseClass,
  BGM,
  Holiday,
  IPlayer,
  ISuccorInfo,
  Tradeskill,
} from '@lotr/interfaces';
import { DamageClass, MessageType, Skill, Stat } from '@lotr/interfaces';
import { consoleLog } from '@lotr/logger';
import { cleanNumber } from '@lotr/shared';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';
import { GetSwimLevel } from '../data';

@Injectable()
export class PlayerHelper extends BaseService {
  private mapXPMultiplier = {
    uncut: 1,
    firstSoftCut: 0.9,
    secondSoftCut: 0.75,
    hardCut: 0.5,
    unknown: 0.1,
  };

  public init() {
    this.mapXPMultiplier = this.game.contentManager.getGameSetting(
      'map',
      'xpMultiplier',
    ) ?? {
      uncut: 1,
      firstSoftCut: 0.9,
      secondSoftCut: 0.75,
      hardCut: 0.5,
      unknown: 0.1,
    };
  }

  public becomeClass(
    player: IPlayer,
    baseClass: BaseClass,
    recalculateAfterTrait = true,
  ) {
    const maxMP = this.game.contentManager.getClassConfigSetting<'baseMP'>(
      baseClass,
      'baseMP',
    );

    player.baseClass = baseClass;
    player.mp.maximum = maxMP;
    player.stats.mp = maxMP;

    player.mp.current = 0;

    const learnTrait =
      this.game.contentManager.getClassConfigSetting<'learnedTrait'>(
        player.baseClass,
        'learnedTrait',
      );

    if (learnTrait) {
      this.game.traitHelper.learnTrait(
        player,
        learnTrait,
        recalculateAfterTrait,
      );
    }

    const castSkill =
      this.game.contentManager.getClassConfigSetting<'castSkill'>(
        player.baseClass,
        'castSkill',
      );

    if (castSkill === Skill.Restoration) {
      player.skills[Skill.Restoration] = calculateSkillXPRequiredForLevel(1);
    }

    if (castSkill === Skill.Conjuration) {
      player.skills[Skill.Conjuration] = calculateSkillXPRequiredForLevel(1);
    }

    this.game.guildManager.setGuildForPlayer(player as Player);
    this.game.guildManager.syncPlayerWithGuild(player as Player);
  }

  public reformatPlayerBeforeSave(player: Player): void {
    // persist remaining ticks so on load we don't lose effect times
    Object.values(player.effects || {}).forEach((arr) => {
      if (!isArray(arr)) return;

      arr.forEach((eff) => {
        if (eff.endsAt === -1) return;
        eff._ticksLeft = Math.floor((eff.endsAt - Date.now()) / 1000);
      });
    });
  }

  public tick(player: Player, type: 'fast' | 'slow', tick: number): void {
    if (type === 'slow') {
      this.game.characterHelper.tick(player, tick);
      this.game.transmissionHelper.generateAndQueuePlayerPatches(player);

      if (player.skillTicks > 0) {
        player.skillTicks--;
        if (player.skillTicks <= 0 && player.flaggedSkills.length > 0) {
          this.game.playerHelper.flagSkill(player, []);
        }
      }
    }

    const canTakeActions = canAct(player);

    if (!canTakeActions && type === 'slow') {
      this.game.characterHelper.tryDance(player);
      return;
    }

    // do actions if we have any
    if (player.actionQueue && canTakeActions) {
      const queue = player.actionQueue[type] || [];

      const actions =
        type === 'fast'
          ? 5
          : this.getStat(player as IPlayer, Stat.ActionSpeed) || 1;

      for (let i = 0; i < actions; i++) {
        const command = queue.shift();

        // if there isn't a command we can't do anything
        if (!command) continue;

        // check if we can actually cast this
        const args = (command as any).args;

        this.game.crashContext.logContextEntry(
          player,
          `${player.username}#${player.name}: ${args.calledAlias} ${args.stringArgs}`,
        );

        //  if we have a spell, we gotta do a lot of checks
        if (args.spell) {
          const [prefix, spell] = args.spell.split(' ');
          let hasLearnedAbility = hasLearned(player, spell || prefix);
          if (
            !hasLearnedAbility &&
            (prefix === 'stance' ||
              prefix === 'powerword' ||
              prefix === 'findfamiliar' ||
              prefix === 'song')
          ) {
            hasLearnedAbility = hasLearned(player, `${prefix}${spell}`);
          }

          // if we have to bail because we dont know the spell, we let them know
          if (!hasLearnedAbility) {
            this.game.messageHelper.sendSimpleMessage(
              player,
              'You do not know that ability!',
            );
            continue;

            // otherwise, we know it, but we'll try to abuse an item for it
          } else {
            if (hasLearnedFromItem(player, spell)) {
              args.overrideEffect =
                this.game.characterHelper.abuseItemsForLearnedSkillAndGetEffect(
                  player,
                  spell,
                );
            }
          }
        }

        // finally, we do the command
        command();
      }
    }

    // if we're on a dense tile, "respawn"
    const map = this.game.worldManager.getMap(player.map)?.map;
    if (
      !hasEffect(player, 'WallWalk') &&
      (map?.getWallAt(player.x, player.y) ||
        map?.getDenseDecorAt(player.x, player.y))
    ) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        `Whoops. Tell a GM "invalid loc" happened at ${player.x}, ${player.y} on ${player.map}.`,
      );

      this.game.teleportHelper.teleportToRespawnPoint(player);
    }

    // bop players who aren't subscribers out of subscriber maps
    if (map?.subscriberOnly && !player.subscriptionTier) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        "This location is subscriber only, you'll have to come back later!",
      );

      this.resetSpawnPointToDefault(player);
      this.game.teleportHelper.teleportToRespawnPoint(player);
    }

    if (
      map?.holiday &&
      !this.game.holidayHelper.isHoliday(map.holiday as Holiday) &&
      !player.isGM
    ) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'This location is not active during this time of year!',
      );

      this.game.teleportHelper.teleportToRespawnPoint(player);
    }
  }

  public clearActionQueue(player: Player, target?: string) {
    // if we specify a target, we remove them from the queue as convenience
    if (player && player.actionQueue && target) {
      player.actionQueue.fast = player.actionQueue.fast.filter(
        (x) => !(x as any).args.stringArgs.includes(target),
      );
      player.actionQueue.slow = player.actionQueue.slow.filter(
        (x) => !(x as any).args.stringArgs.includes(target),
      );
      return;
    }

    // otherwise, just reset the entire queue
    player.actionQueue = { fast: [], slow: [] };
  }

  private handleSwimming(
    player: Player,
    element: DamageClass,
    swimLevel: number,
  ): void {
    player.swimElement = element;
    player.swimLevel = swimLevel;

    if (!hasEffect(player, 'Swimming') && !hasEffect(player, 'Drowning')) {
      if (element === DamageClass.Water) {
        if (hasEffect(player, 'WaterBreathing')) return;

        const swimDuration = getStat(player, Stat.STR);
        this.game.effectHelper.addEffect(player, '', 'Swimming', {
          effect: { duration: swimDuration },
        });

        return;
      }

      if (element === DamageClass.Fire) {
        if (hasEffect(player, 'LavaBreathing')) return;

        this.game.effectHelper.addEffect(player, '', 'Drowning', {
          effect: { duration: -1 },
        });
        return;
      }
    }
  }

  // reset swim level, fov, region desc
  public resetStatus(
    player: Player,
    opts: { ignoreMessages?: boolean; sendFOV?: boolean } = { sendFOV: true },
  ) {
    this.game.visibilityHelper.calculatePlayerFOV(player, opts.sendFOV);

    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return;

    const z = map.getZLevelAt(player.x, player.y);
    player.z = z;

    const swimTile = map.getFluidAt(player.x, player.y);
    const swimInfo = GetSwimLevel(swimTile);

    if (swimInfo) {
      this.handleSwimming(player, swimInfo.element, swimInfo.swimLevel);
    } else {
      player.swimElement = '';
      player.swimLevel = 0;

      this.game.effectHelper.removeEffectByName(player, 'Swimming');
      this.game.effectHelper.removeEffectByName(player, 'Drowning');
    }

    // update the players BGM
    const newBGM = map.getBackgroundMusicAt(player.x, player.y);
    const oldBGM = player.bgmSetting;

    if (oldBGM !== newBGM) {
      player.bgmSetting = (newBGM || 'wilderness') as BGM;
    }

    // send message updates while the player is walking around the world
    if (!opts.ignoreMessages) {
      const regionDesc = map.getRegionDescriptionAt(player.x, player.y);

      let desc = '';

      const descObj =
        map.getInteractableAt(player.x, player.y) ||
        map.getDecorAt(player.x, player.y);
      desc = this.game.staticTextHelper.getGidDescription(descObj?.gid);

      // we do this to avoid unnecessary lookups
      if (!desc) {
        desc = this.game.staticTextHelper.getGidDescription(
          map.getFluidAt(player.x, player.y),
        );
      }

      if (!desc) {
        desc = map.getFoliageAt(player.x, player.y)
          ? 'You are near some trees.'
          : '';
      }

      if (!desc) {
        desc = this.game.staticTextHelper.getGidDescription(
          map.getFloorAt(player.x, player.y),
        );
      }

      if (!desc) {
        desc = this.game.staticTextHelper.getGidDescription(
          map.getTerrainAt(player.x, player.y),
        );
      }

      // send a new region desc if possible
      const hasNewRegion = regionDesc && regionDesc !== player.lastRegionDesc;
      if (hasNewRegion) {
        player.lastRegionDesc = regionDesc;
        this.game.messageHelper.sendLogMessageToPlayer(
          player,
          { message: regionDesc },
          [MessageType.Environment],
        );
      } else if (!regionDesc) {
        player.lastRegionDesc = '';
      }

      // send a new tile desc if possible
      if (!hasNewRegion && desc && desc !== player.lastTileDesc) {
        player.lastTileDesc = desc;
        this.game.messageHelper.sendLogMessageToPlayer(
          player,
          { message: desc },
          [MessageType.Environment],
        );
      }
    }
  }

  // get a stat from a player, or 0
  public getStat(player: IPlayer, stat: Stat): number {
    return player.stats[stat] || 0;
  }

  // flag a certain skill for a player
  public flagSkill(player: IPlayer, skill: Skill | Skill[]): void {
    if (!isPlayer(player)) return;

    player.flaggedSkills = Array.isArray(skill) ? skill : [skill];

    if (skill.length !== 0) {
      player.skillTicks =
        this.game.contentManager.getGameSetting(
          'character',
          'skillActiveTicks',
        ) ?? 30;
    }
  }

  // flag a certain skill for a player
  public trainSkill(player: IPlayer, skill: Skill, amt: number): void {
    player.paidSkills[skill] = player.paidSkills[skill] || 0;

    const baseVal = player.paidSkills[skill] ?? 0;
    player.paidSkills[skill] = baseVal + amt;

    if (isNaN(baseVal + amt)) player.paidSkills[skill] = amt;
  }

  // whether or not the player can get skill on the current map
  public canGainSkillOnMap(player: IPlayer, skill: Skill): boolean {
    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return false;

    return (player.skills[skill.toLowerCase()] ?? 0) < map.maxSkillExp;
  }

  // whether or not the player can get xp on the current map
  public canGainExpOnMap(player: IPlayer): boolean {
    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return false;

    return player.exp < map.maxLevelExp;
  }

  public expMultiplierForMap(player: IPlayer): number {
    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return this.mapXPMultiplier.unknown;

    if (player.exp < map.firstCutExp) return this.mapXPMultiplier.uncut;
    if (player.exp < map.secondCutExp) return this.mapXPMultiplier.firstSoftCut;
    if (player.exp < map.maxLevelExp) return this.mapXPMultiplier.secondSoftCut;

    return this.mapXPMultiplier.hardCut;
  }

  // lose exp (eat, suck)
  public loseExp(player: IPlayer, xpLost: number): void {
    this.gainExp(player, -xpLost);
  }

  // gain exp for a player
  public gainExp(player: IPlayer, xpGained: number): void {
    if (player.gainingAXP && xpGained > 0) return;
    if (isDead(player) && xpGained > 0) return;

    if (xpGained > 0) {
      const xpGainBoostPercent =
        getStat(player, Stat.XPBonusPercent) +
        this.game.dynamicEventHelper.getStat(Stat.XPBonusPercent);
      xpGained += Math.floor((xpGainBoostPercent / 100) * xpGained);
      xpGained = this.game.subscriptionHelper.xpGained(player, xpGained);
      xpGained = cleanNumber(xpGained, 0, {
        floor: true,
      });
    }

    player.exp = Math.max(Math.floor(player.exp + xpGained), 1);
    player.exp = Math.min(player.exp, this.game.configManager.MAX_EXP);
  }

  // gain axp for a player
  public gainAxp(player: IPlayer, axpGained: number): void {
    if (!player.gainingAXP && axpGained > 0) return;
    if (isDead(player) && axpGained > 0) return;

    axpGained = this.game.subscriptionHelper.axpGained(player, axpGained);
    axpGained = cleanNumber(axpGained, 0, {
      floor: true,
    });
    player.axp = Math.max(Math.floor(player.axp + axpGained), 0);
  }

  // try to gain skill based on the current map etc
  public tryGainSkill(
    player: IPlayer,
    skill: Skill,
    skillGained: number,
  ): void {
    if (!this.canGainSkillOnMap(player, skill)) {
      this.gainSkill(player, skill, 1);
      return;
    }

    this.gainSkill(player, skill, skillGained);
  }

  // lose some skill (eat, suck)
  public loseSkill(player: IPlayer, skill: Skill, skillLost: number): void {
    this.gainSkill(player, skill, -skillLost);
  }

  // gain skill for a character
  public gainSkill(player: IPlayer, skill: Skill, skillGained: number): void {
    if (isDead(player)) return;

    if (!skill) skill = Skill.Martial;

    const skillGainBoostPercent =
      getStat(player, Stat.SkillBonusPercent) +
      this.game.dynamicEventHelper.getStat(Stat.SkillBonusPercent);

    skillGained += Math.floor((skillGainBoostPercent / 100) * skillGained);

    // paid skill is doubled as long as we have money in it
    const paidVal = player.paidSkills?.[skill] ?? 0;
    if (paidVal > 0) {
      player.paidSkills[skill] = paidVal - skillGained;
      skillGained *= 2;
    }

    skillGained = this.game.subscriptionHelper.skillGained(player, skillGained);
    skillGained = cleanNumber(skillGained, 0);

    const oldSkillValue = calcSkillLevelForCharacter(player, skill);

    player.skills[skill.toLowerCase()] = Math.max(
      (player.skills[skill.toLowerCase()] ?? 0) + skillGained,
      0,
    );
    player.skills[skill.toLowerCase()] = Math.min(
      player.skills[skill.toLowerCase()],
      this.game.configManager.MAX_SKILL_EXP,
    );

    const newSkillValue = calcSkillLevelForCharacter(player, skill);

    if (
      oldSkillValue !== newSkillValue &&
      newSkillValue % 5 === 0 &&
      isPlayer(player)
    ) {
      this.game.achievementsHelper.checkAllAchievements(player as Player);
    }
  }

  // gain tradeskill skill for a character
  public gainTradeskill(
    player: IPlayer,
    skill: Tradeskill,
    skillGained: number,
  ): void {
    if (isDead(player)) return;
    if (!skill) return;

    skillGained = cleanNumber(skillGained, 0);

    const oldSkillValue = calcTradeskillLevelForCharacter(player, skill);

    player.tradeskills[skill.toLowerCase()] = Math.max(
      (player.tradeskills[skill.toLowerCase()] ?? 0) + skillGained,
      0,
    );

    const newSkillValue = calcTradeskillLevelForCharacter(player, skill);

    if (oldSkillValue !== newSkillValue && newSkillValue % 5 === 0) {
      this.game.achievementsHelper.checkAllAchievements(player as Player);
    }
  }

  // gain all currently flagged skills
  public gainCurrentSkills(player: IPlayer, skillGained: number): void {
    if (!player.flaggedSkills || !player.flaggedSkills.length) return;

    const [primary, secondary, tertiary, quaternary] = player.flaggedSkills;

    if (quaternary) {
      const skillgain =
        this.game.contentManager.getGameSetting('skillgain', 'four') ?? [];
      this.tryGainSkill(player, primary, skillGained * (skillgain[0] ?? 0.45));
      this.tryGainSkill(
        player,
        secondary,
        skillGained * (skillgain[1] ?? 0.25),
      );
      this.tryGainSkill(player, tertiary, skillGained * (skillgain[2] ?? 0.15));
      this.tryGainSkill(
        player,
        quaternary,
        skillGained * (skillgain[3] ?? 0.15),
      );
    } else if (tertiary) {
      const skillgain =
        this.game.contentManager.getGameSetting('skillgain', 'three') ?? [];
      this.tryGainSkill(player, primary, skillGained * (skillgain[0] ?? 0.55));
      this.tryGainSkill(
        player,
        secondary,
        skillGained * (skillgain[1] ?? 0.25),
      );
      this.tryGainSkill(player, tertiary, skillGained * (skillgain[2] ?? 0.2));
    } else if (secondary) {
      const skillgain =
        this.game.contentManager.getGameSetting('skillgain', 'two') ?? [];
      this.tryGainSkill(player, primary, skillGained * (skillgain[0] ?? 0.75));
      this.tryGainSkill(
        player,
        secondary,
        skillGained * (skillgain[1] ?? 0.25),
      );
    } else {
      const skillgain =
        this.game.contentManager.getGameSetting('skillgain', 'one') ?? [];
      this.tryGainSkill(player, primary, skillGained * (skillgain[0] ?? 1));
    }
  }

  // modify rep for a faction
  public modifyReputationForAllegiance(
    player: IPlayer,
    allegiance: Allegiance,
    mod: number,
  ): void {
    // event that can double rep gain
    if (this.game.dynamicEventHelper.isEventActive('Friendship Festival')) {
      mod *= 2;
    }

    try {
      player.allegianceReputation[allegiance] =
        player.allegianceReputation[allegiance] ?? 0;
      player.allegianceReputation[allegiance]! += mod;
    } catch {}
  }

  // gain stats for leveling up
  public gainLevelStats(player: IPlayer): void {
    const con = getStat(player, Stat.CON);

    const { hp, mp } =
      this.game.contentManager.getClassConfigSetting<'levelup'>(
        player.baseClass,
        'levelup',
      );

    const hpGained = Math.floor(
      random(
        hp.base,
        (hp.randomConBonusMultiplier * con) / hp.randomConDivisor,
      ) +
        con / (hp.bonusConDivisor ?? 2),
    );

    if (hpGained > 0) {
      this.game.characterHelper.gainPermanentStat(player, Stat.HP, hpGained);

      this.game.messageHelper.sendSimpleMessage(
        player,
        `You gained ${hpGained} max HP!`,
      );
    }

    const mpGainStat = getStat(player, mp.statUsed);

    const mpGained = Math.floor(
      random(mp.base, mpGainStat * mp.randomMultiplier) +
        mpGainStat / mp.randomDivisor,
    );

    if (mpGained > 0 && mp.base > 0) {
      this.game.characterHelper.gainPermanentStat(player, Stat.MP, mpGained);

      this.game.messageHelper.sendSimpleMessage(
        player,
        `You gained ${mpGained} max MP!`,
      );
    }

    this.game.characterHelper.recalculateEverything(player);
  }

  // try to level up a player to the maximum possible level they can go based on the trainer they see
  public tryLevelUp(player: IPlayer, maxLevel = 0): void {
    do {
      if (player.level >= maxLevel) break;

      const neededXp = calculateXPRequiredForLevel(player.level + 1);
      if (player.exp >= neededXp) {
        player.level += 1;
        if (player.level > player.highestLevel) {
          player.highestLevel = player.level;
          player.traits.tp += 1;
          this.gainLevelStats(player);
        }
        break;
      } else {
        break;
      }
    } while (player.level < maxLevel);

    this.game.achievementsHelper.checkAllAchievements(player as Player);
    this.game.guildManager.syncPlayerWithGuild(player as Player);
  }

  public tryAncientLevelUp(player: IPlayer): void {
    const maxPerLevel =
      this.game.contentManager.getGameSetting('character', 'axpPerLevel') ??
      500;

    while (player.axp > maxPerLevel) {
      player.axp -= maxPerLevel;
      player.ancientLevel += 1;
      player.traits.ap += 1;
    }
  }

  // teleport the player to the succor location
  public doSuccor(player: IPlayer, succorInfo: ISuccorInfo) {
    if (isDead(player)) return;

    const map = this.game.worldManager.getMap(player.map)?.map;
    if (!map) return;

    if (!map.canSuccor(player)) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'The blob turns to ash in your hand!',
      );
      return;
    }

    if (!succorInfo.map || !succorInfo.x || !succorInfo.y) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'Your succor is not valid.',
      );
      consoleLog(
        'PlayerHelper:DoSuccor',
        `Bad Succor: ${JSON.stringify(succorInfo)}`,
      );
      return;
    }

    this.game.messageHelper.sendSimpleMessage(
      player,
      'You are whisked back to the place in your stored memories!',
    );
    this.game.teleportHelper.teleport(player as Player, succorInfo);
    this.game.transmissionHelper.sendMovementPatch(player as Player);
  }

  // refresh the players state based on their map, shortcut
  public refreshPlayerMapState(player: Player): void {
    const state = this.game.worldManager.getMap(player.map)?.state;
    if (!state) return;

    state.triggerFullUpdateForPlayer(player as Player);
  }

  // reset the players respawn to the default
  public resetSpawnPointToDefault(player: Player): void {
    player.respawnPoint = this.game.contentManager.getGameSetting(
      'map',
      'defaultRespawnPoint',
    ) ?? {
      map: 'Rylt',
      x: 68,
      y: 13,
    };
  }
}
