import type { IServerGame } from '@lotr/interfaces';
import { GameAction, GameServerEvent } from '@lotr/interfaces';

import { coreCharSelect } from '@lotr/content';
import { premiumMaxCharacters } from '@lotr/premium';
import { ServerAction } from '../../models/ServerAction';

export class RollCharacterAction extends ServerAction {
  override type = GameServerEvent.CreateCharacter;
  override requiredKeys = ['slot', 'name', 'gender', 'allegiance', 'baseclass'];

  override async act(game: IServerGame, { emit }, data) {
    const { gender, allegiance, baseclass, weapons, account } = data;
    let { slot, name } = data;

    slot = Math.round(slot);

    const charCreateData = coreCharSelect();

    const maxCharacters = premiumMaxCharacters(account);

    if (!charCreateData.allegiances.find((x) => x.name === allegiance)) {
      return { message: 'Bad allegiance.' };
    }
    if (!charCreateData.classes.find((x) => x.name === baseclass)) {
      return { message: 'Bad class.' };
    }
    if (!charCreateData.weapons.find((x) => x.name === weapons)) {
      return { message: 'Bad specialization.' };
    }
    if (!['male', 'female'].find((x) => x === gender)) {
      return { message: 'Bad gender.' };
    }
    if (slot < 0 || slot > maxCharacters - 1) return { message: 'Bad slot.' };

    name = name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
    name = name.replace(/[^a-zA-Z]/g, '');
    name = name.slice(0, 19);

    if (name.length < 2) return { message: 'Bad name.' };

    const player = await game.characterDB.createCharacter(account, {
      slot,
      name,
      gender,
      allegiance,
      baseclass,
      weapons,
    });

    emit({
      action: GameAction.SetCharacterSlotInformation,
      slot,
      characterInfo: player,
    });

    return {};
  }
}
