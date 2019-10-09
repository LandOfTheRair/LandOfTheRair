import { Game } from '../../helpers';
import { GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class Login extends ServerAction {
  type = GameServerEvent.Login;
  requiredKeys = ['username', 'password'];

  async act(game: Game, data) {

    if (!data.username) throw new Error('Must specify username.');
    if (!data.password) throw new Error('Must specify password.');

    const account = await game.accountDB.getAccount(data.username);
    if (!account) throw new Error(`Username not registered.`);

    if (!game.accountDB.checkPassword(data, account)) throw new Error('Password does not match.');

    try {
      const res = { ...account };
      delete res.password;

      return { type: GameServerResponse.Login, ...res };

    } catch (e) {
      game.logger.error('LoginAction', e);
      throw new Error('Could not login username?');
    }
  }
}
