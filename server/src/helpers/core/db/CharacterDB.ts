
import { Inject, Singleton } from 'typescript-ioc';

import { Reference } from 'mikro-orm';
import { Account, Player } from '../../../models';
import { CharacterRoller } from '../../lobby';
import { Database } from '../Database';

@Singleton
export class CharacterDB {

  @Inject private db: Database;

  @Inject private characterRoller: CharacterRoller;

  public async init() {}

  public async createCharacter(account: Account, { slot, name, allegiance, baseclass, gender }): Promise<Player | null> {

    const oldPlayer = account.players.getItems().find(char => char.charSlot === slot);

    if (oldPlayer) {
      account.players.remove(oldPlayer);
    }

    const characterDetails = this.characterRoller.rollCharacter({ allegiance, baseclass });

    const player = this.db.create<Player>(Player);
    player.account = Reference.create(account);

    player.charSlot = slot;
    player.name = name;
    player.allegiance = allegiance;
    player.baseClass = baseclass;
    player.gender = gender;
    player.currency = { gold: characterDetails.gold };
    player.stats = characterDetails.stats;

    account.players.add(player);
    await this.db.save(account);

    return player;
  }

}
