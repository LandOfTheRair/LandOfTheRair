import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class RegisterAction extends ServerAction {
  type = GameServerEvent.Register;
  requiredKeys = [];

  async act(game: Game, { broadcast, emit }, data) {

    if (!data.username) throw new Error('Must specify username.');
    if (data.username.length < 2) throw new Error('Username must be >2 characters.');
    if (data.username.length > 20) throw new Error('Username must be <20 characters.');

    if (!data.password) throw new Error('Must specify password.');
    if (data.password.length < 10) throw new Error('Password must be >10 characters.');
    if (data.password.length > 256) throw new Error('Password must be less than <256 characters.');

    if (!data.email) throw new Error('Must specify email.');
    if (!data.email.includes('.') || !data.email.includes('@')) throw new Error('Email must match basic format.');

    const account = await game.accountDB.getAccount(data.username);
    if (account) throw new Error(`Username already registered.`);

    try {
      const res = await game.accountDB.createAccount(data);
      if (!res) throw new Error('Could not register.');

      broadcast({
        action: GameAction.ChatAddUser,
        user: res
      });

      game.lobbyManager.addAccount(res);

      emit({
        type: GameServerResponse.Login,
        account: res,
        motd: game.lobbyManager.motd,
        onlineUsers: game.lobbyManager.onlineUsers
      });

    } catch (e) {
      game.logger.error('RegisterAction', e);
      throw new Error('Could not register username?');
    }
  }
}
