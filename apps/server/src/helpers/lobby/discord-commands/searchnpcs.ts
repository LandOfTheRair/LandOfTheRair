import * as Discord from 'discord.js';

import type { IDiscordCommand } from '../../../interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../core';

export class SearchNPCsCommand implements IDiscordCommand {
  command = new Discord.SlashCommandBuilder()
    .setName('npc')
    .setDescription('Search for an NPC.')
    .addStringOption((option) =>
      option
        .setName('npcid')
        .setDescription('The name of the NPC to search for.')
        .setRequired(true),
    );

  do(interaction: Discord.CommandInteraction, game: Game) {
    if (!interaction.member) return;

    const query = interaction.options.get('npcid')?.value as string;

    const npcs = game.npcHelper.searchNPCs(query);
    const npc = npcs[0];

    if (!npc) return interaction.reply(`No NPC matches the query "${query}".`);

    const fullCreature = game.npcHelper.getNPCDefinition(npc);
    const embed = game.discordHelper.createNPCEmbed(fullCreature);

    return interaction.reply({ embeds: [embed] });
  }
}
