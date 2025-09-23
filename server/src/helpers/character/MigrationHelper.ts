import { Injectable } from 'injection-js';
import { isArray, size } from 'lodash';
import uuid from 'uuid/v4';
import { initializePlayer } from '../../../../shared/initializers';
import {
  Direction,
  GameAction,
  GuildRole,
  IPlayer,
} from '../../../../shared/interfaces';
import { Account, Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class MigrationHelper extends BaseService {
  public init() {}

  public migrate(player: Player, playerAccount: Account): void {
    const basePlayer = initializePlayer({});
    Object.keys(basePlayer).forEach((key) => {
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
    if (!player.learnedRecipes) player.learnedRecipes = [];
    if (!player.tradeskills) player.tradeskills = {};
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

    // fix traits if needed
    if (!player.traits.tp && size(player.traits.traitsLearned) === 0) {
      this.game.traitHelper.resetTraits(player);
    }

    Object.keys(player.traits.traitsLearned ?? {}).forEach((trait) => {
      const def = this.game.contentManager.getTrait(
        trait,
        `Migrate:Trait:${player.name}`,
      );
      if (!def) {
        delete player.traits.traitsLearned[trait];
      }
    });

    // clean up invalid learned runes
    if (player.learnedRunes.length > 0) {
      const remove: string[] = [];

      player.learnedRunes.forEach((rune) => {
        const runeItem = this.game.contentManager.getItemDefinition(rune);
        if (!runeItem) {
          remove.push(rune);
          return;
        }

        const trait = runeItem.trait;
        if (
          trait?.restrict &&
          trait.restrict.length > 0 &&
          !trait.restrict.includes(player.baseClass)
        ) {
          remove.push(rune);
          return;
        }

        const requirements = runeItem.requirements;
        if (requirements?.level && player.level < requirements.level) {
          remove.push(rune);
          return;
        }
      });

      player.learnedRunes = player.learnedRunes.filter(
        (x) => !remove.includes(x),
      );
    }

    // clean up invalid runes
    if (player.runes.length > 0) {
      const remove: string[] = [];

      player.runes.forEach((rune) => {
        const runeItem = this.game.contentManager.hasItemDefinition(rune);
        if (runeItem) return;

        remove.push(rune);
      });

      player.runes = player.runes.filter((x) => !remove.includes(x));
    }

    // clean up invalid effects
    Object.keys(player.effects).forEach((buffType) => {
      if (buffType === '_hash') return;

      player.effects[buffType] = player.effects[buffType].filter((f) =>
        this.game.contentManager.hasEffect(f.effectName),
      );
    });

    Object.keys(player.effects._hash).forEach((key) => {
      const doesEffectExist = this.game.contentManager.hasEffect(key);
      if (doesEffectExist) return;

      delete player.effects._hash[key];
    });

    // basic resets
    player.agro = {};

    player.isGM = playerAccount.isGameMaster;
    player.isTester = playerAccount.isTester;
    player.username = playerAccount.username;
    player.subscriptionTier =
      this.game.subscriptionHelper.getSubscriptionTier(playerAccount);

    player.lastRegionDesc = '';
    player.lastTileDesc = '';

    if (!player.accountLockers.lockers) {
      player.accountLockers.lockers = { Shared: { items: [] } };
    }
    if (!player.accountLockers.pouch) {
      player.accountLockers.pouch = { items: [] };
    }
    if (!player.accountLockers.materials) player.accountLockers.materials = {};

    // add sated if nothing else exists
    if (
      !this.game.effectHelper.hasEffect(player, 'Sated') &&
      !this.game.effectHelper.hasEffect(player, 'Nourished') &&
      !this.game.effectHelper.hasEffect(player, 'Malnourished')
    ) {
      this.game.effectHelper.addEffect(player, '', 'Sated', {
        effect: { duration: 21600 },
      });
    }

    this.cleanUpInvalidItems(player);

    this.reformatPlayerAfterLoad(player);

    this.game.questHelper.recalculateQuestKillsAndStatRewards(player);

    this.game.achievementsHelper.checkAllAchievements(player);

    this.game.guildManager.setGuildForPlayer(player);
    this.game.guildManager.syncPlayerWithGuild(player);

    this.game.wsCmdHandler.sendToSocket(player.username, {
      action: GameAction.UpdateGuild,
      guild: null,
    });

    if (player.isGM) {
      const gmGuild = this.game.guildManager.getGuildByTag('GM');
      if (gmGuild) {
        player.guildId = gmGuild._id.toHexString();
        this.game.guildManager.addGuildMember(gmGuild, player, GuildRole.Owner);
      }
    }

    if (player.isTester) {
      const testGuild = this.game.guildManager.getGuildByTag('TEST');
      if (testGuild) {
        player.guildId = testGuild._id.toHexString();
        this.game.guildManager.addGuildMember(
          testGuild,
          player,
          GuildRole.Owner,
        );
      }
    }

    if (player.guildId) {
      const guild = this.game.guildManager.getGuildById(player.guildId);
      if (guild) {
        this.game.guildManager.sendGuildUpdateToPlayer(player);
      }

      if (guild?.motd) {
        setTimeout(() => {
          this.game.messageHelper.sendLogMessageToPlayer(player, {
            message: `Guild MOTD: ${guild.motd}`,
          });
        }, 50);
      }
    }
  }

  private reformatPlayerAfterLoad(player: Player): void {
    // re-hydrate effect timers
    Object.values(player.effects || {}).forEach((arr) => {
      if (!isArray(arr)) return;

      arr.forEach((eff) => {
        if (!eff._ticksLeft) return;
        eff.endsAt = Date.now() + eff._ticksLeft * 1000;
        delete eff._ticksLeft;
      });
    });
  }

  private cleanUpInvalidItems(player: IPlayer): void {
    const isValidItem = (itemName) =>
      this.game.contentManager.getItemDefinition(itemName);

    // clean invalid equipment
    Object.keys(player.items.equipment).forEach((slot) => {
      const item = player.items.equipment[slot];

      if (!item) return;
      if (isValidItem(item.name)) return;

      player.items.equipment[slot] = undefined;
    });

    // clean invalid inventory
    const removeBeltUUIDs: string[] = [];
    player.items.belt.items.forEach((item) => {
      if (isValidItem(item.name)) return;
      removeBeltUUIDs.push(item.uuid);
    });

    this.game.inventoryHelper.removeItemsFromBeltByUUID(
      player,
      removeBeltUUIDs,
    );

    const removeSackUUIDS: string[] = [];
    player.items.sack.items.forEach((item) => {
      if (isValidItem(item.name)) return;
      removeSackUUIDS.push(item.uuid);
    });

    this.game.inventoryHelper.removeItemsFromSackByUUID(
      player,
      removeSackUUIDS,
    );

    const removePouchUUIDs: string[] = [];
    player.accountLockers.pouch.items.forEach((item) => {
      if (isValidItem(item.name)) return;
      removePouchUUIDs.push(item.uuid);
    });

    this.game.inventoryHelper.removeItemsFromPouchByUUID(
      player,
      removePouchUUIDs,
    );

    // lockers
    Object.values(player.accountLockers.lockers || {})
      .concat(Object.values(player.lockers.lockers || {}))
      .forEach((locker) => {
        const removeUUIDs: string[] = [];
        locker.items.forEach((item) => {
          if (isValidItem(item.name)) return;
          removeUUIDs.push(item.uuid);
        });

        this.game.inventoryHelper.removeItemsFromLockerByUUID(
          player,
          removeUUIDs,
          locker,
        );
      });
  }
}
