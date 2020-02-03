
import { Injectable } from 'injection-js';
import { BaseService, GameAction, GameServerResponse, ICharacter, MessageType } from '../../interfaces';
import { Player } from '../../models';


@Injectable()
export class MessageHelper extends BaseService {

  public init() {}

  public async sendLogMessageToPlayer(
    player: ICharacter,
    message: string,
    messageTypes: MessageType[] = [MessageType.Miscellaneous]
  ): Promise<void> {

    const account = (player as Player).account;
    if (!account) return;

    this.game.wsCmdHandler.sendToSocket((player as Player).username, {
      type: GameServerResponse.GameLog,
      messageTypes,
      message
    });
  }

  public async broadcastSystemMessage(message: string): Promise<void> {
    this.sendMessage('★System', message);
  }

  public async broadcastChatMessage(player: ICharacter, message: string): Promise<void> {

    const account = (player as Player).account;
    if (!account) return;

    const username = (player as Player).username;

    this.sendMessage(username, message);
  }

  private sendMessage(from: string, message: string): void {
    message = message.trim();
    if (!message) return;

    this.game.wsCmdHandler.broadcast({
      action: GameAction.ChatAddMessage,
      timestamp: Date.now(),
      message,
      from
    });

    this.game.wsCmdHandler.broadcast({
      type: GameServerResponse.Chat,
      timestamp: Date.now(),
      message,
      from
    });
  }

}
