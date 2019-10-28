
import { Inject, Singleton } from 'typescript-ioc';

import { Reference } from 'mikro-orm';
import { BaseService, initializePlayer } from '../../../interfaces';
import { Account, Player } from '../../../models';
import { CharacterItems } from '../../../models/orm/CharacterItems';
import { CharacterRoller } from '../../lobby';
import { Database } from '../Database';

@Singleton
export class CharacterDB extends BaseService {

  @Inject private db: Database;

  @Inject private characterRoller: CharacterRoller;

  public async init() {}

  public async createCharacter(account: Account, { slot, name, allegiance, baseclass, gender }): Promise<Player | null> {

    const oldPlayer = account.players.getItems().find(char => char.charSlot === slot);

    if (oldPlayer) {
      account.players.remove(oldPlayer);
    }

    const characterDetails = this.characterRoller.rollCharacter({ allegiance, baseclass });

    const basePlayer = initializePlayer({});
    const player = this.db.create<Player>(Player, basePlayer);

    player.account = Reference.create(account);

    const items = new CharacterItems();
    player.items = Reference.create(items);

    player.charSlot = slot;
    player.name = name;
    player.allegiance = allegiance;
    player.baseClass = baseclass;
    player.gender = gender;
    player.currency = { gold: characterDetails.gold };
    player.stats = characterDetails.stats;
    player.skills = characterDetails.skills;

    Object.keys(characterDetails.items).forEach(itemSlot => {
      items.equipment[itemSlot] = characterDetails.items[itemSlot];
    });

    account.players.add(player);
    await this.db.save(account);

    return player;
  }

}
