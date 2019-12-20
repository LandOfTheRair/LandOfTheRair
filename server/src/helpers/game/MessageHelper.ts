
import { Singleton } from 'typescript-ioc';
import { BaseService, GameServerResponse, ICharacter } from '../../interfaces';
import { Player } from '../../models';


@Singleton
export class MessageHelper extends BaseService {

  public init() {}

  public async sendMessage(player: ICharacter, message: string, messageTypes: string[] = ['misc']): Promise<void> {

    const account = (player as Player).account;
    if (!account) return;

    this.game.wsCmdHandler.sendToSocket(await account.get('username'), {
      type: GameServerResponse.GameLog,
      messageTypes,
      message
    });
  }

}
