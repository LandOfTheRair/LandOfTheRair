import { Injectable } from 'injection-js';
import { isArray, random } from 'lodash';
import uuid from 'uuid/v4';

import { Allegiance, BaseClass, BaseService, BGM, Currency, Direction, initializePlayer, IPlayer, MessageType, Skill, Stat } from '../../interfaces';
import { Account, Player } from '../../models';
import { SubscriptionHelper } from '../account';
import { GetSwimLevel, StaticTextHelper, WorldManager } from '../data';
import { CharacterHelper } from './CharacterHelper';
import { TeleportHelper } from './TeleportHelper';
import { VisibilityHelper } from './VisibilityHelper';


@Injectable()
export class PlayerHelper extends BaseService {

  constructor(
    private characterHelper: CharacterHelper,
    private staticTextHelper: StaticTextHelper,
    private visibilityHelper: VisibilityHelper,
    private subscriptionHelper: SubscriptionHelper,
    private teleportHelper: TeleportHelper,
    private worldManager: WorldManager
  ) {
    super();
  }

  public init() {}

  public migrate(player: Player, playerAccount: Account): void {
    const basePlayer = initializePlayer({});
    Object.keys(basePlayer).forEach(key => {
      if (player[key]) return;
      player[key] = basePlayer[key];
    });

    if (!player.uuid) player.uuid = uuid();
    if (!player.dir) player.dir = Direction.South;
    if (!player.actionQueue) player.actionQueue = { fast: [], slow: [] };
    if (!player.effects.debuff) player.effects.debuff = [];
    if (!player.effects.buff) player.effects.buff = [];
    if (!player.effects.outgoing) player.effects.outgoing = [];
    if (!player.effects.incoming) player.effects.incoming = [];
    if (!player.stats.mp) player.stats.mp = 100;
    if (!player.stats.mpregen) player.stats.mpregen = 1;
    if ((player.mp as any).__current) {
      player.mp.current = (player.mp as any).__current;
      delete (player.mp as any).__current;
    }
    if ((player.hp as any).__current) {
      player.hp.current = (player.hp as any).__current;
      delete (player.hp as any).__current;
    }

    player.agro = {};

    player.isGM = playerAccount.isGameMaster;
    player.isTester = playerAccount.isTester;
    player.username = playerAccount.username;
    player.isSubscribed = this.subscriptionHelper.isSubscribed(playerAccount);

    player.lastRegionDesc = '';
    player.lastTileDesc = '';

    this.reformatPlayerAfterLoad(player);
  }

  public becomeClass(player: IPlayer, baseClass: BaseClass) {
    const maxMP: Record<BaseClass, number> = {
      [BaseClass.Healer]: 20,
      [BaseClass.Mage]: 30,
      [BaseClass.Warrior]: 100,
      [BaseClass.Thief]: 100,
      [BaseClass.Undecided]: 0
    };

    player.baseClass = baseClass;
    player.mp.maximum = maxMP[baseClass];
    player.stats.mp = maxMP[baseClass];
  }

  public reformatPlayerBeforeSave(player: Player): void {

    // persist remaining ticks so on load we don't lose effect times
    Object.values(player.effects || {}).forEach(arr => {
      if (!isArray(arr)) return;

      arr.forEach(eff => {
        if (eff.endsAt === -1) return;
        eff._ticksLeft = Math.floor((eff.endsAt - Date.now()) / 1000);
      });
    });
  }

  public reformatPlayerAfterLoad(player: Player): void {

    // re-hydrate effect timers
    Object.values(player.effects || {}).forEach(arr => {
      if (!isArray(arr)) return;

      arr.forEach(eff => {
        if (!eff._ticksLeft) return;
        eff.endsAt = Date.now() + (eff._ticksLeft * 1000);
        delete eff._ticksLeft;
      });
    });
  }

  public tick(player: Player, type: 'fast'|'slow'): void {

    if (type === 'slow') {
      this.characterHelper.tick(player);
      this.game.transmissionHelper.generateAndQueuePlayerPatches(player);
    }

    // do actions if we have any
    if (player.actionQueue) {
      const queue = player.actionQueue[type] || [];

      const actions = type === 'fast' ? 1 : (this.getStat(player as IPlayer, Stat.ActionSpeed) || 1);

      for (let i = 0; i < actions; i++) {
        const command = queue.shift();
        if (!command) continue;

        command();
      }
    }

    // if we're on a dense tile, "respawn"
    const { map } = this.worldManager.getMap(player.map);
    if (map.getWallAt(player.x, player.y) || map.getDenseDecorAt(player.x, player.y)) {
      this.teleportHelper.teleportToRespawnPoint(player);
    }
  }

  public clearActionQueue(player: Player, target?: string) {

    // if we specify a target, we remove them from the queue as convenience
    if (target) {
      player.actionQueue.fast = player.actionQueue.fast.filter(x => !(x as any).args.stringArgs.includes(target));
      player.actionQueue.slow = player.actionQueue.slow.filter(x => !(x as any).args.stringArgs.includes(target));
      return;
    }

    // otherwise, just reset the entire queue
    player.actionQueue = { fast: [], slow: [] };
  }

  // reset swim level, fov, region desc
  public resetStatus(player: Player, ignoreMessages?: boolean) {

    this.visibilityHelper.calculatePlayerFOV(player);

    const { map } = this.worldManager.getMap(player.map);

    const swimTile = map.getFluidAt(player.x, player.y);
    const swimInfo = GetSwimLevel(swimTile);

    if (swimInfo) {
      const { element, swimLevel } = swimInfo;
      player.swimElement = element;
      player.swimLevel = swimLevel;

      if (!this.game.effectHelper.hasEffect(player, 'Swimming')
      && !this.game.effectHelper.hasEffect(player, 'Drowning')) {
        const swimDuration = this.game.characterHelper.getStat(player, Stat.STR);
        this.game.effectHelper.addEffect(player, '', 'Swimming', { effect: { duration: swimDuration } });
      }

    } else {
      player.swimElement = '';
      player.swimLevel = 0;

      this.game.effectHelper.removeEffectByName(player, 'Swimming');
      this.game.effectHelper.removeEffectByName(player, 'Drowning');
    }

    // update the players BGM
    const newBGM = map.getBackgroundMusicAt(player.x, player.y);
    player.bgmSetting = (newBGM ?? 'wilderness') as BGM;

    // send message updates while the player is walking around the world
    if (!ignoreMessages) {

      const regionDesc = map.getRegionDescriptionAt(player.x, player.y);

      let desc = '';

      const descObj = map.getInteractableAt(player.x, player.y) || map.getDecorAt(player.x, player.y);
      desc = this.staticTextHelper.getGidDescription(descObj?.gid);

      // we do this to avoid unnecessary lookups
      if (!desc) {
        desc = this.staticTextHelper.getGidDescription(map.getFluidAt(player.x, player.y));
      }

      if (!desc) {
        desc = map.getFoliageAt(player.x, player.y) ? 'You are near some trees.' : '';
      }

      if (!desc) {
        desc = this.staticTextHelper.getGidDescription(map.getFloorAt(player.x, player.y));
      }

      if (!desc) {
        desc = this.staticTextHelper.getGidDescription(map.getTerrainAt(player.x, player.y));
      }

      // send a new region desc if possible
      const hasNewRegion = regionDesc && regionDesc !== player.lastRegionDesc;
      if (hasNewRegion) {
        player.lastRegionDesc = regionDesc;
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: regionDesc }, [MessageType.Environment]);

      } else if (!regionDesc) {
        player.lastRegionDesc = '';
      }

      // send a new tile desc if possible
      if (!hasNewRegion && desc && desc !== player.lastTileDesc) {
        player.lastTileDesc = desc;
        this.game.messageHelper.sendLogMessageToPlayer(player, { message: desc }, [MessageType.Environment]);
      }
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

  // whether or not the player can get skill on the current map
  public canGainSkillOnMap(player: IPlayer, skill: Skill): boolean {
    const { map } = this.worldManager.getMap(player.map);
    return player.skills[skill.toLowerCase()] < map.maxSkillExp;
  }

  // whether or not the player can get xp on the current map
  public canGainExpOnMap(player: IPlayer): boolean {
    const { map } = this.worldManager.getMap(player.map);
    return player.exp < map.maxLevelExp;
  }

  // gain exp for a player
  public gainExp(player: IPlayer, xpGained: number): void {
    if (player.gainingAXP && xpGained > 0) return;

    const xpGainBoostPercent = this.game.characterHelper.getStat(player, Stat.XPBonusPercent);
    xpGained += Math.floor((xpGainBoostPercent * xpGained) / 100);

    // TODO: modify xpGained for sub
    if (isNaN(xpGained)) throw new Error(`XP gained for ${player.name} is NaN!`);

    player.exp = Math.max(Math.floor(player.exp + xpGained), 0);
    player.exp = Math.min(player.exp, this.game.configManager.MAX_EXP);

  }

  // gain axp for a player
  public gainAxp(player: IPlayer, axpGained: number): void {
    if (!player.gainingAXP && axpGained > 0) return;

    // TODO: modify axpGained for sub
    if (isNaN(axpGained)) throw new Error(`AXP gained for ${player.name} is NaN!`);
    player.axp = Math.max(Math.floor(player.axp + axpGained), 0);

  }

  // gain skill for a character
  public gainSkill(player: IPlayer, skill: Skill, skillGained: number): void {
    if (!skill) skill = Skill.Martial;

    const xpGainBoostPercent = this.game.characterHelper.getStat(player, Stat.SkillBonusPercent);
    skillGained += Math.floor((xpGainBoostPercent * skillGained) / 100);

    // TODO: modify skillGained for sub
    if (isNaN(skillGained)) throw new Error(`Skill gained for ${player.name} is NaN!`);

    player.skills[skill.toLowerCase()] = Math.max((player.skills[skill.toLowerCase()] ?? 0) + skillGained);
    player.skills[skill.toLowerCase()] = Math.min(player.skills[skill.toLowerCase()], this.game.configManager.MAX_SKILL_EXP);
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

  public hasCurrency(player: IPlayer, total: number, currency: Currency = Currency.Gold): boolean {
    return (player.currency[currency] || 0) >= total;
  }

  // gain currency for a player
  public gainCurrency(player: IPlayer, currencyGained: number, currency: Currency = Currency.Gold): void {
    if (isNaN(currencyGained)) throw new Error(`Currency gained ${currency} for ${player.name} is NaN!`);

    player.currency[currency] = Math.max(Math.floor((player.currency[currency] ?? 0) + currencyGained), 0);

  }

  // lose currency for a player (either by taking it, or spending it)
  public loseCurrency(player: IPlayer, currencyLost: number, currency: Currency = Currency.Gold): void {
    this.gainCurrency(player, -currencyLost, currency);
  }

  // modify rep for a faction
  public modifyReputationForAllegiance(player: IPlayer, allegiance: Allegiance, mod: number): void {
    player.allegianceReputation[allegiance] = player.allegianceReputation[allegiance] ?? 0;
    player.allegianceReputation[allegiance]! += mod;
  }

  // gain stats for leveling up
  public gainLevelStats(player: IPlayer): void {

    const con = this.game.characterHelper.getStat(player, Stat.CON);
    const wis = this.game.characterHelper.getStat(player, Stat.WIS);
    const int = this.game.characterHelper.getStat(player, Stat.INT);

    const classStats: Record<BaseClass, () => void> = {
      [BaseClass.Undecided]: () => {
        const hpGained = Math.floor(random(2, con / 2) + con / 2);
        this.game.characterHelper.gainPermanentStat(player, Stat.HP, hpGained);
      },

      [BaseClass.Warrior]: () => {
        const hpGained = Math.floor(random(1, con / 2) + con / 2);
        this.game.characterHelper.gainPermanentStat(player, Stat.HP, hpGained);
      },

      [BaseClass.Thief]: () => {
        const hpGained = Math.floor(random(2, con) + con / 2);
        this.game.characterHelper.gainPermanentStat(player, Stat.HP, hpGained);
      },

      [BaseClass.Healer]: () => {
        const hpGained = Math.floor(random(con / 5, (3 * con / 5)) + con / 3);
        this.game.characterHelper.gainPermanentStat(player, Stat.HP, hpGained);

        const mpGained = Math.floor(random(1, wis) + wis / 3);
        this.game.characterHelper.gainPermanentStat(player, Stat.MP, mpGained);
      },

      [BaseClass.Mage]: () => {
        const hpGained = Math.floor(random(1, con));
        this.game.characterHelper.gainPermanentStat(player, Stat.HP, hpGained);

        const mpGained = Math.floor(random(2, int * 2) + int / 5);
        this.game.characterHelper.gainPermanentStat(player, Stat.MP, mpGained);
      }
    };

    classStats[player.baseClass]();
  }

  // try to level up a player to the maximum possible level they can go based on the trainer they see
  public tryLevelUp(player: IPlayer, maxLevel = 0): void {
    do {
      if (player.level >= maxLevel) break;

      const neededXp = this.game.calculatorHelper.calculateXPRequiredForLevel(player.level + 1);
      if (player.exp > neededXp) {
        player.level += 1;
        if (player.level > player.highestLevel) {
          player.highestLevel = player.level;
          this.gainLevelStats(player);
        }
        break;
      } else {
        break;
      }
    } while (player.level < maxLevel);
  }

}
