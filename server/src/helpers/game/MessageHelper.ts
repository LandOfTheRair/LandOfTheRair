
import { Injectable } from 'injection-js';
import { BaseService, GameAction, GameServerResponse, ICharacter, MessageInfo, MessageType, SoundEffect } from '../../interfaces';
import { Player } from '../../models';

@Injectable()
export class MessageHelper extends BaseService {

  public init() {}

  public sendLogMessageToPlayer(
    charOrUUID: ICharacter | string,
    { message, sfx, from, setTarget, logInfo }: MessageInfo,
    messageTypes: MessageType[] = [MessageType.Miscellaneous],
    formatArgs: ICharacter[] = []
  ): void {

    let uuid = (charOrUUID as ICharacter).uuid;
    if (!uuid) uuid = charOrUUID as string;

    const ref: ICharacter = this.game.worldManager.getCharacter(uuid);
    if (!ref) return;

    const account = this.game.lobbyManager.getAccount((ref as Player).username);
    if (!account) return;

    if (from) message = `**${from}**: ${message}`;

    let sendMessage = message;
    if (formatArgs.length > 0) sendMessage = this.formatMessage(ref, sendMessage, formatArgs);

    if (sfx) this.playSoundForPlayer((ref as Player), sfx);

    this.game.transmissionHelper.sendResponseToAccount((ref as Player).username, GameServerResponse.GameLog, {
      type: GameServerResponse.GameLog,
      messageTypes,
      message: sendMessage,
      sfx,
      setTarget,
      logInfo
    });
  }

  public sendLogMessageToRadius(
    player: ICharacter,
    radius: number,
    { message, sfx, from, setTarget, except }: MessageInfo,
    messageTypes: MessageType[] = [MessageType.Miscellaneous],
    formatArgs: ICharacter[] = []
  ): void {

    if (from) message = `**${from}**: ${message}`;

    const { state } = this.game.worldManager.getMap(player.map);
    const allPlayers = state.getAllPlayersInRange(player, radius);

    allPlayers.forEach(checkPlayer => {
      const account = this.game.lobbyManager.getAccount((checkPlayer as Player).username);
      if (!account) return;

      if (except && except.includes(checkPlayer.uuid)) return;

      let sendMessage = message;
      if (formatArgs.length > 0) sendMessage = this.formatMessage(checkPlayer, sendMessage, formatArgs);

      if (sfx) this.playSoundForPlayer((checkPlayer as Player), sfx);

      this.game.transmissionHelper.sendResponseToAccount((checkPlayer as Player).username, GameServerResponse.GameLog, {
        type: GameServerResponse.GameLog,
        messageTypes,
        message: sendMessage,
        sfx,
        setTarget
      });
    });
  }

  public sendSimpleMessage(character: ICharacter, message: string, sfx?: SoundEffect): void {
    this.sendLogMessageToPlayer(character, { message, sfx });
  }

  public sendPrivateMessage(from: ICharacter, to: ICharacter, message: string): void {
    this.sendLogMessageToPlayer(to, { message: `from **${from.name}**: ${message}` }, [MessageType.Private, MessageType.PlayerChat]);
    this.sendLogMessageToPlayer(from, { message: `to **${to.name}**: ${message}` }, [MessageType.Private, MessageType.PlayerChat]);
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

  public formatMessage(target: ICharacter, message: string, formatArgs: any[]): string {
    if (!formatArgs.length) return message;

    return [...formatArgs].reduce((str, c: ICharacter, idx) => {
      if (!c) return str;

      let name = c.name;
      if (!this.game.visibilityHelper.canSee(target, c.x, c.y) || !this.game.visibilityHelper.canSeeThroughStealthOf(target, c)) name = 'somebody';
      if (target === c) name = 'yourself';
      return str.replace(new RegExp(`%${idx}`), name);

    }, message);
  }

  public playSoundForPlayer(player: Player, sfx: string): void {
    this.game.transmissionHelper.sendResponseToPlayer(player, GameServerResponse.PlaySFX, { sfx });
  }

}
