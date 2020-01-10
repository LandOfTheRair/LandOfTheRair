
import { Injectable } from 'injection-js';
import { BaseService, GameAction, GameServerResponse, ICharacter } from '../../interfaces';
import { Player } from '../../models';


@Injectable()
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

  public async broadcastChatMessage(player: ICharacter, message: string): Promise<void> {

    const account = (player as Player).account;
    if (!account) return;

    const username = await account.get('username');

    this.game.wsCmdHandler.broadcast({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message,
      from: username
    });

    this.game.wsCmdHandler.broadcast({
      type: GameServerResponse.Chat,
      timestamp: Date.now(),
      message,
      from: username
    });
  }

}
