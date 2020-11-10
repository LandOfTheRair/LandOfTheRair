import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { Account } from '../../models';
import { ServerAction } from '../../models/ServerAction';

export class RollCharacterAction extends ServerAction {
  type = GameServerEvent.CreateCharacter;
  requiredKeys = ['slot', 'name', 'gender', 'allegiance', 'baseclass'];

  async act(game: Game, { emit }, data) {
    const { gender, allegiance, baseclass, account } = data;
    let { slot, name } = data;

    slot = Math.round(slot);

    const charCreateData = game.contentManager.charSelectData;

    if (!charCreateData.allegiances.find(x => x.name === allegiance)) throw new Error('Bad allegiance.');
    if (!charCreateData.classes.find(x => x.name === baseclass)) throw new Error('Bad class.');
    if (!['male', 'female'].find(x => x === gender)) throw new Error('Bad gender.');
    if (slot < 0 || slot > 3) throw new Error('Bad slot.'); // TODO: track premium in account, mark here to check against account max slots

    name = name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
    name = name.replace(/[^a-zA-Z]/g, '');
    name = name.slice(0, 19);

    if (name.length < 2) throw new Error('Bad name.');

    const player = await game.characterDB.createCharacter(account, { slot, name, gender, allegiance, baseclass });

    emit({
      action: GameAction.SetCharacterSlotInformation,
      slot,
      characterInfo: player
    });

    return {};

  }
}
