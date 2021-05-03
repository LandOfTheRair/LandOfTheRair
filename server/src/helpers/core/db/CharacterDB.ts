
import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { initializeCharacter, IPlayer } from '../../../interfaces';
import { Account, AccountBank, AccountDaily, AccountLockers, Player, PlayerQuests } from '../../../models';
import { BaseService } from '../../../models/BaseService';
import { PlayerItems } from '../../../models/orm/PlayerItems';
import { PlayerLockers } from '../../../models/orm/PlayerLockers';
import { PlayerStatistics } from '../../../models/orm/PlayerStatistics';
import { PlayerTraits } from '../../../models/orm/PlayerTraits';
import { CharacterRoller } from '../../lobby';
import { Database } from '../Database';

@Injectable()
export class CharacterDB extends BaseService {

  constructor(
    private db: Database,
    private characterRoller: CharacterRoller
  ) {
    super();
  }

  public async init() {
    const coll = this.db.getCollection(Player);
    coll.createIndex({ name: 1 });

    const stats = this.db.getCollection(PlayerStatistics);
    stats.createIndex({ name: 1 });
  }

  public async createCharacter(account: Account, { slot, name, allegiance, baseclass, gender, weapons }): Promise<IPlayer> {

    const oldPlayerSlot = account.players.findIndex(char => char?.charSlot === slot);

    if (oldPlayerSlot !== -1) {
      await this.deletePlayer(account.players[oldPlayerSlot] as Player);
      account.players.splice(oldPlayerSlot, 1);
    }

    const characterDetails = this.characterRoller.rollCharacter({ allegiance, baseclass, weapons });

    const player = new Player();
    Object.assign(player, initializeCharacter());
    player._id = new ObjectId();

    player._account = account._id;

    await this.game.characterDB.populatePlayer(player, account);

    Object.keys(characterDetails.items).forEach(itemSlot => {
      player.items.equipment[itemSlot] = characterDetails.items[itemSlot];
    });

    player.charSlot = slot;
    player.name = name;
    player.allegiance = allegiance;
    player.baseClass = baseclass;
    player.gender = gender;
    player.currency = { gold: characterDetails.gold };
    player.stats = characterDetails.stats;
    player.skills = characterDetails.skills;
    player.traits.tp = 2;

    this.game.playerHelper.becomeClass(player, player.baseClass);
    this.game.characterHelper.healToFull(player);

    player.items.sack.items = [this.game.itemCreator.getSimpleItem('Newbie Book')];

    account.players.push(player);
    await this.savePlayer(player);

    return player;
  }

  public async loadPlayers(account: Account): Promise<Player[]> {
    const players = await this.db.findMany<Player>(Player, { _account: account._id });

    for (const player of players) {
      await this.populatePlayer(player, account);
    }

    return players;
  }

  public async reloadPlayerAccountInfo(player: Player, account: Account): Promise<void> {
    const results = await Promise.all([
      this.db.findSingle<AccountBank>(AccountBank, { _account: account._id }),
      this.db.findSingle<AccountLockers>(AccountLockers, { _account: account._id }),
    ]);

    let [bank, acctLockers] = results;

    if (!bank) {
      const newBank = new AccountBank();
      newBank._id = new ObjectId();
      newBank._account = account._id;

      bank = newBank;
    }

    if (!acctLockers) {
      const newAcctLockers = new AccountLockers();
      newAcctLockers._id = new ObjectId();
      newAcctLockers._account = account._id;

      acctLockers = newAcctLockers;
    }

    player.bank = bank;
    player.accountLockers = acctLockers;
  }

  public async loadPlayerDailyInfo(player: Player, account: Account): Promise<void> {

    const daily = await this.db.findSingle<AccountDaily>(AccountDaily, { _account: account._id });
    if (!daily) {
      const newDaily = new AccountDaily();
      newDaily._id = new ObjectId();
      newDaily._account = account._id;
      this.db.save(newDaily);
    }

    player.dailyItems = daily?.daily?.[player.charSlot]?.items ?? {};
    player.quests.npcDailyQuests = daily?.daily?.[player.charSlot]?.quests ?? {};
  }

  public async populatePlayer(player: Player, account: Account): Promise<void> {
    const results = await Promise.all([
      this.db.findSingle<PlayerItems>(PlayerItems, { _id: player._items }),
      this.db.findSingle<PlayerTraits>(PlayerTraits, { _id: player._traits }),
      this.db.findSingle<PlayerQuests>(PlayerQuests, { _id: player._quests }),
      this.db.findSingle<PlayerStatistics>(PlayerStatistics, { _id: player._statistics }),
      this.db.findSingle<PlayerLockers>(PlayerLockers, { _id: player._lockers })
    ]);

    let [items, traits, quests, statistics, lockers] = results;

    if (!items) {
      const newItems = new PlayerItems();
      newItems._id = new ObjectId();

      items = newItems;
      player._items = items._id;
    }

    if (!traits) {
      const newTraits = new PlayerTraits();
      newTraits._id = new ObjectId();

      traits = newTraits;
      player._traits = traits._id;
    }

    if (!quests) {
      const newQuests = new PlayerQuests();
      newQuests._id = new ObjectId();

      quests = newQuests;
      player._quests = quests._id;
    }

    if (!statistics) {
      const newStats = new PlayerStatistics();
      newStats._id = new ObjectId();

      statistics = newStats;
      player._statistics = statistics._id;
    }

    if (!lockers) {
      const newLockers = new PlayerLockers();
      newLockers._id = new ObjectId();

      lockers = newLockers;
      player._lockers = newLockers._id;
    }

    player.items = items;
    player.traits = traits;
    player.quests = quests;
    player.statistics = statistics;
    player.lockers = lockers;
  }

  public async deletePlayer(player: Player): Promise<void> {
    await Promise.all([
      this.db.delete(player),
      this.db.delete(player.items as PlayerItems),
      this.db.delete(player.traits as PlayerTraits),
      this.db.delete(player.quests as PlayerQuests),
      this.db.delete(player.statistics as PlayerStatistics),
      this.db.delete(player.lockers as PlayerLockers)
    ]);
  }

  public async saveAllPlayers(players: Player[]): Promise<any> {
    if (players.length === 0) return;

    const playerColl = this.db.getCollection(Player);
    const itemsColl = this.db.getCollection(PlayerItems);
    const traitsColl = this.db.getCollection(PlayerTraits);
    const questsColl = this.db.getCollection(PlayerQuests);
    const statsColl = this.db.getCollection(PlayerStatistics);
    const lockersColl = this.db.getCollection(PlayerLockers);
    const bankColl = this.db.getCollection(AccountBank);
    const acctLockerColl = this.db.getCollection(AccountLockers);
    const acctDailyColl = this.db.getCollection(AccountDaily);

    const playerOp = playerColl.initializeUnorderedBulkOp();
    const itemOp = itemsColl.initializeUnorderedBulkOp();
    const traitOp = traitsColl.initializeUnorderedBulkOp();
    const questOp = questsColl.initializeUnorderedBulkOp();
    const statsOp = statsColl.initializeUnorderedBulkOp();
    const lockersOp = lockersColl.initializeUnorderedBulkOp();
    const bankOp = bankColl.initializeUnorderedBulkOp();
    const acctLockerOp = acctLockerColl.initializeUnorderedBulkOp();
    const acctDailyOp = acctDailyColl.initializeUnorderedBulkOp();

    players.forEach(player => {
      playerOp
        .find({ _id: player._id })
        .upsert()
        .replaceOne(this.db.getPersistObject(player));

      itemOp
        .find({ _id: (player.items as PlayerItems)._id })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.items as PlayerItems));

      traitOp
        .find({ _id: (player.traits as PlayerTraits)._id })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.traits as PlayerTraits));

      questOp
        .find({ _id: (player.quests as PlayerQuests)._id })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.quests as PlayerQuests));

      statsOp
        .find({ _id: (player.statistics as PlayerStatistics)._id })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.statistics as PlayerStatistics));

      lockersOp
        .find({ _id: (player.lockers as PlayerLockers)._id })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.lockers as PlayerLockers));

      bankOp
        .find({ _account: player._account })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.bank as AccountBank));

      acctLockerOp
        .find({ _account: player._account })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.accountLockers as AccountLockers));

      acctDailyOp
        .find({ _account: player._account })
        .upsert()
        .updateOne({ $set: { [`daily.${player.charSlot}`]: { quests: player.quests.npcDailyQuests, items: player.dailyItems } } });
    });

    return Promise.all([
      playerOp.execute(),
      itemOp.execute(),
      traitOp.execute(),
      questOp.execute(),
      statsOp.execute(),
      lockersOp.execute(),
      bankOp.execute(),
      acctLockerOp.execute(),
      acctDailyOp.execute()
    ]);
  }

  public async savePlayer(player: Player): Promise<void> {
    this.game.playerHelper.reformatPlayerBeforeSave(player);
    this.game.statisticsHelper.syncBaseStatistics(player);

    const saves = [
      this.db.save(player),
      this.db.save(player.items as PlayerItems),
      this.db.save(player.traits as PlayerTraits),
      this.db.save(player.quests as PlayerQuests),
      this.db.save(player.statistics as PlayerStatistics),
      this.db.save(player.lockers as PlayerLockers),
      this.db.getCollection(AccountDaily).updateOne(
        { _account: player._account },
        { $set: { [`daily.${player.charSlot}`]: { quest: player.quests.npcDailyQuests, items: player.dailyItems } } }
      )
    ];

    if (player.bank)           saves.push(this.db.save(player.bank as AccountBank));
    if (player.accountLockers) saves.push(this.db.save(player.accountLockers as AccountLockers));

    await Promise.all(saves);
  }

}
