
import { Injectable } from 'injection-js';

import { Reference, wrap } from '@mikro-orm/core';
import { BaseClass, BaseService, initializePlayer } from '../../../interfaces';
import { Account, Player } from '../../../models';
import { CharacterItems } from '../../../models/orm/CharacterItems';
import { PlayerHelper } from '../../character';
import { CharacterRoller } from '../../lobby';
import { Database } from '../Database';

@Injectable()
export class CharacterDB extends BaseService {

  constructor(
    private db: Database,
    private characterRoller: CharacterRoller,
    private playerHelper: PlayerHelper
  ) {
    super();
  }

  public async init() {}

  public async createCharacter(account: Account, { slot, name, allegiance, baseclass, gender }): Promise<void> {

    const oldPlayer = account.players.getItems().find(char => char.charSlot === slot);

    if (oldPlayer) {
      account.players.remove(oldPlayer);
    }

    const characterDetails = this.characterRoller.rollCharacter({ allegiance, baseclass });

    const basePlayer = initializePlayer({});
    const player = this.db.create<Player>(Player, basePlayer);
    player.account = wrap(account).toReference();

    const items = new CharacterItems();
    Object.keys(characterDetails.items).forEach(itemSlot => {
      items.equipment[itemSlot] = characterDetails.items[itemSlot];
    });

    player.items = wrap(items).toReference();

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

    account.players.add(player);
    await this.db.save(account);
  }

  public async savePlayer(player: Player): Promise<void> {
    return this.db.save(player);
  }

}
