
import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { IPlayer } from '../../../interfaces';
import { Account, AccountBank, Player, PlayerQuests } from '../../../models';
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

  public async init() {}

  public async createCharacter(account: Account, { slot, name, allegiance, baseclass, gender, weapons }): Promise<IPlayer> {

    const oldPlayerSlot = account.players.findIndex(char => char?.charSlot === slot);

    if (oldPlayerSlot !== -1) {
      await this.deletePlayer(account.players[oldPlayerSlot] as Player);
      account.players.splice(oldPlayerSlot, 1);
    }

    const characterDetails = this.characterRoller.rollCharacter({ allegiance, baseclass, weapons });

    const player = new Player();
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
    player.level = 1;
    player.traits.tp = 2;
    player.map = 'Tutorial';
    player.x = 14;
    player.y = 14;

    player.hp = { current: 100, maximum: 100, minimum: 0 };
    player.mp = { current: 0, maximum: 0, minimum: 0 };

    this.game.playerHelper.becomeClass(player, player.baseClass, false);

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

  public async populatePlayer(player: Player, account: Account): Promise<void> {
    const results = await Promise.all([
      this.db.findSingle<PlayerItems>(PlayerItems, { _id: player._items }),
      this.db.findSingle<PlayerTraits>(PlayerTraits, { _id: player._traits }),
      this.db.findSingle<PlayerQuests>(PlayerQuests, { _id: player._quests }),
      this.db.findSingle<AccountBank>(AccountBank, { _id: account._id }),
      this.db.findSingle<PlayerStatistics>(PlayerStatistics, { _id: player._statistics }),
      this.db.findSingle<PlayerLockers>(PlayerLockers, { _id: player._lockers })
    ]);

    let [items, traits, quests, bank, statistics, lockers] = results;

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

    if (!bank) {
      const newBank = new AccountBank();
      newBank._id = new ObjectId();

      bank = newBank;
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
    player.bank = bank;
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

    const playerOp = playerColl.initializeUnorderedBulkOp();
    const itemOp = itemsColl.initializeUnorderedBulkOp();
    const traitOp = traitsColl.initializeUnorderedBulkOp();
    const questOp = questsColl.initializeUnorderedBulkOp();
    const statsOp = statsColl.initializeUnorderedBulkOp();
    const lockersOp = lockersColl.initializeUnorderedBulkOp();
    const bankOp = bankColl.initializeUnorderedBulkOp();

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
        .find({ _id: player._account })
        .upsert()
        .replaceOne(this.db.getPersistObject(player.bank as AccountBank));
    });

    return Promise.all([
      playerOp.execute(),
      itemOp.execute(),
      traitOp.execute(),
      questOp.execute(),
      statsOp.execute(),
      lockersOp.execute(),
      bankOp.execute()
    ]);
  }

  public async savePlayer(player: Player): Promise<void> {
    this.game.playerHelper.reformatPlayerBeforeSave(player);

    await Promise.all([
      this.db.save(player),
      this.db.save(player.items as PlayerItems),
      this.db.save(player.traits as PlayerTraits),
      this.db.save(player.quests as PlayerQuests),
      this.db.save(player.statistics as PlayerStatistics),
      this.db.save(player.lockers as PlayerLockers),
      this.db.save(player.bank as AccountBank)
    ]);
  }

}
