import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChatAction extends ServerAction {
  override type = GameServerEvent.Chat;
  override requiredKeys = ['content'];

  override async act(game: Game, { emit }, data) {
    if (data.account.isMuted || data.account.isBanned) {
      emit(
        game.messageHelper.getSystemMessageObject(
          'You are not able to chat at this time. Contact a GM or email help@rair.land if you believe this is in error.',
        ),
      );

      return {};
    }

    data.content = game.profanityHelper.cleanMessage(data.content);

    // try to do a slash command before running the chat message
    if (data.content.startsWith('/')) {
      const cmd = data.content.split(' ')[0];
      if (game.lobbyManager.hasCommand(cmd)) {
        if (data.account.isGameMaster) {
          const res = await game.lobbyManager.doCommand(
            cmd,
            data.content,
            emit,
          );
          if (!res) {
            const syntax = game.lobbyManager.getCommandSyntax(cmd);
            emit(
              game.messageHelper.getSystemMessageObject(
                `Invalid usage. Syntax: ${syntax}`,
              ),
            );
          }
        } else {
          emit(
            game.messageHelper.getSystemMessageObject(
              'Only GMs can use slash commands.',
            ),
          );
        }
      } else {
        emit(
          game.messageHelper.getSystemMessageObject(
            'That slash command does not exist.',
          ),
        );
      }

      return {};
    }

    try {
      game.messageHelper.sendMessage(data.username, data.content);
    } catch (e) {
      game.logger.error('ChatAction', e);
      return {
        message:
          'Could not send chat message? Try again, or if this persists contact a GM.',
      };
    }

    return {};
  }
}
