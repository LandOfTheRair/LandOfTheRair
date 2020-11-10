
import { Injectable } from 'injection-js';
import { merge } from 'lodash';
import { ObjectId } from 'mongodb';

import { BaseClass, BaseService, initializePlayer, IPlayer } from '../../../interfaces';
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

    const oldPlayer = account.players.find(char => char.charSlot === slot);

    if (oldPlayer) {
      account.players.splice(slot, 1);
      await this.db.delete(oldPlayer as Player);
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

    await this.savePlayer(player);

    return player;
  }

  public async savePlayer(player: Player): Promise<void> {
    await Promise.all([
      this.db.save(player),
      this.db.save(player.items as PlayerItems)
    ]);
  }

}
