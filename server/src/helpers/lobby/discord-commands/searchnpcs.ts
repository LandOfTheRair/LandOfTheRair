import * as Discord from 'discord.js';
import { IDiscordCommand } from '../../../interfaces';

import { Game } from '../../core';

export class SearchNPCsCommand implements IDiscordCommand {
  name = '!npc';

  do(message: Discord.Message, game: Game) {
    if (!message.member) return;

    const query = message.content.split(this.name).join('').trim();

    const npcs = game.npcHelper.searchNPCs(query);
    const npc = npcs[0];

    if (!npc) return message.reply(`No npc matches the query "${query}".`);

    const fullCreature = game.npcHelper.getNPCDefinition(npc);
    const embed = game.discordHelper.createNPCEmbed(fullCreature);

    return (
      message.client.channels.cache.get(
        message.channelId,
      ) as Discord.TextChannel
    ).send({ embeds: [embed] });
  }
}
