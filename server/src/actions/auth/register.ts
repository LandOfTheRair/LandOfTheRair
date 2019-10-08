import { GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class RegisterAction extends ServerAction {
  type = GameServerEvent.Register;
  requiredKeys = [];

  async act(data) {
    console.log('register', data);
    return { type: GameServerResponse.Login };
  }
}
