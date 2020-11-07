import { Game } from '../../helpers';
import { GameServerEvent, GameServerResponse } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangeDiscordTagAction extends ServerAction {
  type = GameServerEvent.ChangeDiscordTag;
  requiredKeys = ['discordTag'];
  requiresLoggedIn = true;

  async act(game: Game, { emit }, data) {

    try {
      await game.accountDB.changeDiscordTag(data.account, data.discordTag);
      game.logger.log('Auth:ChangeDiscordTag', `${data.username} changed Discord tag to ${data.discordTag}.`);

      emit({
        type: GameServerResponse.SendNotification,
        message: `Successfully changed your Discord tag.`
      });

    } catch (e) {
      game.logger.error('ChangeDiscordTag', e);
      throw new Error('Could not change discord tag?');
    }
  }
}
