import { Game } from '../../helpers';
import { GameAction, GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChatAction extends ServerAction {
  type = GameServerEvent.Chat;
  requiredKeys = ['content'];

  async act(game: Game, { emit }, data) {
    if (data.account.isMuted || data.account.isBanned) {
      emit({
        action: GameAction.ChatAddMessage,
        timestamp: Date.now(),
        message: 'You are not able to chat at this time. Contact a GM or email help@rair.land if you believe this is in error.',
        from: '★System'
      });

      return {};
    }

    data.content = game.profanityHelper.cleanMessage(data.content);

    // try to do a slash command before running the chat message
    if (data.content.startsWith('/')) {
      const cmd = data.content.split(' ')[0];
      if (game.lobbyManager.hasCommand(cmd)) {
        if (data.account.isGameMaster) {
          const res = game.lobbyManager.doCommand(cmd, data.content, emit);
          if (!res) {
            const syntax = game.lobbyManager.getCommandSyntax(cmd);
            emit({
              action: GameAction.ChatAddMessage,
              timestamp: Date.now(),
              message: `Invalid usage. Syntax: ${syntax}`,
              from: '★System'
            });
          }

        } else {
          emit({
            action: GameAction.ChatAddMessage,
            timestamp: Date.now(),
            message: 'Only GMs can use slash commands.',
            from: '★System'
          });

        }

      } else {
        emit({
          action: GameAction.ChatAddMessage,
          timestamp: Date.now(),
          message: 'That slash command does not exist.',
          from: '★System'
        });
      }

      return {};
    }

    try {
      game.messageHelper.sendMessage(data.username, data.content);

    } catch (e) {
      game.logger.error('ChatAction', e);
      return { message: 'Could not send chat message? Try again, or if this persists contact a GM.' };
    }

    return {};
  }
}
