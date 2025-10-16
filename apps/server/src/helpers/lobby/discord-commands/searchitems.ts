import * as Discord from 'discord.js';

import type { IDiscordCommand } from '../../../interfaces';

import { itemGet, searchItems } from '@lotr/content';
import type { IServerGame } from '@lotr/interfaces';

export class SearchItemsCommand implements IDiscordCommand {
  command = new Discord.SlashCommandBuilder()
    .setName('item')
    .setDescription('Search for an item.')
    .addStringOption((option) =>
      option
        .setName('itemname')
        .setDescription('The name of the item to search for.')
        .setRequired(true),
    );

  do(interaction: Discord.CommandInteraction, game: IServerGame) {
    if (!interaction.member) return;

    const query = interaction.options.get('itemname')?.value as string;

    const items = searchItems(query);
    const item = items[0];

    if (!item) {
      return interaction.reply(`No item matches the query "${query}".`);
    }

    const fullItem = itemGet(item)!;
    const embed = game.discordHelper.createItemEmbed({
      name: fullItem.name,
      mods: {},
      uuid: '',
    });

    return interaction.reply({ embeds: [embed] });
  }
}
