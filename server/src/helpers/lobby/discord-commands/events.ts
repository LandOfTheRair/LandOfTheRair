import * as Discord from 'discord.js';
import { IDiscordCommand } from '../../../interfaces';

import { Game } from '../../core';

export class EventsCommand implements IDiscordCommand {
  command = new Discord.SlashCommandBuilder()
    .setName('events')
    .setDescription('Toggle having the Event Watcher role.');

  do(interaction: Discord.CommandInteraction, game: Game) {
    const member = interaction.member as Discord.GuildMember;
    if (!member) return;

    const watcherRole = game.discordHelper.getRole('Event Watcher');
    if (!watcherRole) return;

    const hasRole = member.roles.cache.has(watcherRole.id);

    if (hasRole) {
      game.discordHelper.removeRole(member, watcherRole);
      interaction.reply(
        'You are **no longer watching** events. You will no longer receive event notifications.',
      );
    } else {
      game.discordHelper.addRole(member, watcherRole);
      interaction.reply(
        'You have been assigned the role "Event Watcher". You will be notified when something cool happens.',
      );
    }
  }
}
