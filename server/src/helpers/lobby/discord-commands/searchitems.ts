
import * as Discord from 'discord.js';
import { IDiscordCommand, WeaponClasses } from '../../../interfaces';

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

    const embed = new Discord.MessageEmbed();
    embed
      .setAuthor(fullItem.name)
      .setThumbnail(`https://play.rair.land/assets/spritesheets/items/${fullItem.sprite.toString().padStart(4, '0')}.png`)
      .addField('Description', fullItem.desc)
      .addField('Item Type', fullItem.itemClass, true);

    if (WeaponClasses.includes(fullItem.itemClass as any)) {
      embed.addField('Attack Skill', fullItem.type, true);
    }

    if (fullItem.requirements) {
      const requirements: string[] = [];
      if (fullItem.requirements.baseClass) requirements.push(`Class: ${fullItem.requirements.baseClass}`);
      if (fullItem.requirements.level)     requirements.push(`Level: ${fullItem.requirements.level}`);

      embed.addField('Requirements', requirements.join(', '), true);
    }

    /*
    if(Object.keys(fullItem.stats || {}).length > 0) {

    }

    if(fullItem.trait) {

    }

    if(fullItem.useEffect) {

    }

    if(fullItem.equipEffect) {

    }

    if(fullItem.strikeEffect) {

    }
    */

    return message.channel.send({ embed });
  }
}
