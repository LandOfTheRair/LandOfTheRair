import { Game } from '../../helpers';
import { GameServerEvent } from '../../interfaces';
import { ServerAction } from '../../models/ServerAction';

export class ChangeDiscordTagAction extends ServerAction {
  type = GameServerEvent.ChangeDiscordTag;
  requiredKeys = ['discordTag'];
  requiresLoggedIn = true;

  async act(game: Game, callbacks, data) {

    try {
      try {
        await game.discordHelper.removeDiscordRoles(data.account);

        const isUserInDiscord = await game.discordHelper.isTagInDiscord(data.discordTag);
        if (data.discordTag && !isUserInDiscord) {
          return { wasSuccess: false, message: 'That Discord user ID is not in the Land of the Rair Discord. Join here: https://discord.rair.land' };
        }

        await game.accountDB.changeDiscordTag(data.account, data.discordTag);
        await game.discordHelper.updateDiscordRoles(data.account);
      } catch {
        return { wasSuccess: false, message: 'That Discord user ID is already in use or is invalid.' };
      }

      game.logger.log('Auth:ChangeDiscordTag', `${data.username} changed Discord user ID to ${data.discordTag}.`);

    } catch (e) {
      game.logger.error('ChangeDiscordTag', e);
      return { message: 'Could not change Discord user ID? Try again, or contact a GM if this persists.' };
    }

    return {
      wasSuccess: true,
      message: 'Successfully changed your Discord user ID.'
    };
  }
}
