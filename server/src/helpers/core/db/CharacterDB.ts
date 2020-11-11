
import { Injectable } from 'injection-js';
import { ObjectId } from 'mongodb';

import { BaseClass, BaseService, IPlayer } from '../../../interfaces';
import { Account, Player } from '../../../models';
import { PlayerItems } from '../../../models/orm/PlayerItems';
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

  public async createCharacter(account: Account, { slot, name, allegiance, baseclass, gender }): Promise<IPlayer> {

    const oldPlayerSlot = account.players.findIndex(char => char?.charSlot === slot);

    if (oldPlayerSlot !== -1) {
      await this.deletePlayer(account.players[oldPlayerSlot] as Player);
      account.players.splice(oldPlayerSlot, 1);
    }

    const characterDetails = this.characterRoller.rollCharacter({ allegiance, baseclass });

    const player = new Player();
    player._id = new ObjectId();

    player._account = account._id;

    await this.game.accountDB.populatePlayer(player, account);

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

    if (player.baseClass === BaseClass.Healer) player.mp.maximum = 20;
    if (player.baseClass === BaseClass.Mage) player.mp.maximum = 30;

    if (player.baseClass === BaseClass.Thief) player.mp.maximum = 100;
    if (player.baseClass === BaseClass.Warrior) player.mp.maximum = 100;

    player.mp.__current = player.mp.maximum;

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
      this.db.findSingle<PlayerItems>(PlayerItems, { _id: player._items })
    ]);

    let [items] = results;

    if (!items) {
      const newItems = new PlayerItems();
      newItems._id = new ObjectId();

      items = newItems;
      player._items = items._id;
    }

    player.items = items;
  }

  public async deletePlayer(player: Player): Promise<void> {
    await Promise.all([
      this.db.delete(player),
      this.db.delete(player.items as PlayerItems)
    ]);
  }

  public async savePlayer(player: Player): Promise<void> {
    this.game.playerHelper.reformatPlayerBeforeSave(player);

    await Promise.all([
      this.db.save(player),
      this.db.save(player.items as PlayerItems)
    ]);
  }

}
