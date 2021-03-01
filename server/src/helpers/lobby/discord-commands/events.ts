
import * as Discord from 'discord.js';

import { Game } from '../../core';

export class EventsCommand {
  name = '!events';

  do(message: Discord.Message, game: Game) {
    if (!message.member) return;

    const watcherRole = game.discordHelper.getRole('Event Watcher');
    const hasRole = (message.member?.roles.cache as any).find(x => x.name === 'Event Watcher');

    if (watcherRole) {
      if (hasRole) {
        game.discordHelper.removeRole(message.member, watcherRole);
        message.reply('you are **no longer watching** events. You will no longer receive event notifications.');
      } else {
        game.discordHelper.addRole(message.member, watcherRole);
        message.reply('you have been assigned the role "Event Watcher". You will be notified when something cool happens.');
      }
    }
  }
}
