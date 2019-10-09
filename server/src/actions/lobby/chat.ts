import { Game } from '../../helpers';
import { GameAction, GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChatAction extends ServerAction {
  type = GameServerEvent.Chat;
  requiredKeys = ['content'];

  async act(game: Game, { broadcast }, data) {
    data.content = game.profanityHelper.cleanMessage(data.content);

    const account = await game.accountDB.getAccount(data.username);
    if (!account) throw new Error(`Not logged in.`);

    try {
      broadcast({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: data.content,
        from: data.username
      });

    } catch (e) {
      game.logger.error('ChatAction', e);
      throw new Error('Could not send chat message?');
    }
  }
}
