import * as Discord from 'discord.js';
import { IDiscordCommand } from '../../../interfaces';

import { Game } from '../../core';

export class SearchItemsCommand implements IDiscordCommand {
  name = '!item';

  do(message: Discord.Message, game: Game) {
    if (!message.member) return;

    const query = message.content.split(this.name).join('').trim();

    const items = game.itemHelper.searchItems(query);
    const item = items[0];

    if (!item) return message.reply(`No item matches the query "${query}".`);

    const fullItem = game.itemHelper.getItemDefinition(item);
    const embed = game.discordHelper.createItemEmbed({
      name: fullItem.name,
      mods: {},
      uuid: '',
    });

    return (
      message.client.channels.cache.get(
        message.channelId,
      ) as Discord.TextChannel
    ).send({ embeds: [embed] });
  }
}
