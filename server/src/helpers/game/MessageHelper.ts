
import { Injectable } from 'injection-js';
import { BaseService, GameAction, GameServerResponse, ICharacter, MessageType } from '../../interfaces';
import { Player } from '../../models';


@Injectable()
export class MessageHelper extends BaseService {

  public init() {}

  public sendLogMessageToPlayer(
    player: ICharacter,
    { message, sfx }: { message: string, sfx?: string },
    messageTypes: MessageType[] = [MessageType.Miscellaneous]
  ): void {

    const account = this.game.lobbyManager.getAccount((player as Player).username);
    if (!account) return;

    this.game.transmissionHelper.sendResponseToAccount((player as Player).username, GameServerResponse.GameLog, {
      type: GameServerResponse.GameLog,
      messageTypes,
      message,
      sfx
    });
  }

  public sendLogMessageToRadius(
    player: ICharacter,
    radius: number,
    { message, sfx }: { message: string, sfx?: string },
    messageTypes: MessageType[] = [MessageType.Miscellaneous]
  ): void {

    const { state } = this.game.worldManager.getMap(player.map);
    const allPlayers = state.getAllPlayersInRange(player, radius);

    allPlayers.forEach(checkPlayer => {
      const account = this.game.lobbyManager.getAccount((checkPlayer as Player).username);
      if (!account) return;

      this.game.transmissionHelper.sendResponseToAccount((checkPlayer as Player).username, GameServerResponse.GameLog, {
        type: GameServerResponse.GameLog,
        messageTypes,
        message,
        sfx
      });
    });
  }

  public sendSimpleMessage(character: ICharacter, message: string, sfx?: string): void {
    this.sendLogMessageToPlayer(character, { message, sfx });
  }

  public sendPrivateMessage(from: ICharacter, to: ICharacter, message: string): void {
    this.sendLogMessageToPlayer(to, { message: `from ${from.name}: ${message}` }, [MessageType.Private, MessageType.PlayerChat]);
    this.sendLogMessageToPlayer(from, { message: `to ${to.name}: ${message}` }, [MessageType.Private, MessageType.PlayerChat]);
  }

  public broadcastSystemMessage(message: string): void {
    this.sendMessage('★System', message);
  }

  public broadcastChatMessage(player: ICharacter, message: string): void {

    const account = this.game.lobbyManager.getAccount((player as Player).username);
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
