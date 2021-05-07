
import * as Discord from 'discord.js';
import { IDiscordCommand, Stat } from '../../../interfaces';

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

    const hp = fullCreature.hp.min === fullCreature.hp.max
      ? fullCreature.hp.max.toLocaleString()
      : `${fullCreature.hp.min.toLocaleString()}~${fullCreature.hp.max.toLocaleString()}`;

    const embed = new Discord.MessageEmbed();
    embed
      .setAuthor(fullCreature.name)
      .setThumbnail(`https://play.rair.land/assets/spritesheets/creatures/${fullCreature.sprite.toString().padStart(4, '0')}.png`);

    embed
      .addField('Level', fullCreature.level, true)
      .addField('HP', hp, true)
      .addField('Allegiance', fullCreature.allegiance, true);

    if (fullCreature.tansFor) {
      embed.addField('Tannable', 'Yes', true);
    }

    if (fullCreature.affiliation) {
      embed.addField('Affiliation', fullCreature.affiliation, true);
    }

    const importantStats = [Stat.STR, Stat.DEX, Stat.AGI, Stat.INT, Stat.WIS, Stat.WIL, Stat.CON, Stat.CHA, Stat.LUK];
    embed.addField('Stats', importantStats.map(x => `**${x.toUpperCase()}**: ${fullCreature.stats[x]}`).join(', '));

    return message.channel.send({ embed });
  }
}
