import * as Discord from 'discord.js';
import { Injectable } from 'injection-js';

import {
  IAccount,
  IDiscordCommand,
  INPCDefinition,
  IPlayer,
  ISimpleItem,
  Stat,
  WeaponClasses,
} from '../../interfaces';
import { BaseService } from '../../models/BaseService';

import * as commands from './discord-commands';

@Injectable()
export class DiscordHelper extends BaseService {
  private discord: Discord.Client;
  private discordGuild: Discord.Guild | undefined;
  private discordChannel: Discord.TextChannel | undefined;
  private discordBotCommandChannel: Discord.TextChannel | undefined;
  private discordMarketplaceChannel: Discord.TextChannel | undefined;

  private discordCommands: Record<string, IDiscordCommand> = {};

  public async init() {
    if (!process.env.DISCORD_SECRET || !process.env.DISCORD_GUILD_ID) return;

    this.discord = new Discord.Client();

    try {
      await this.discord.login(process.env.DISCORD_SECRET);
      this.game.logger.log('Discord', 'Connected!');
    } catch (e) {
      this.game.logger.error('Discord', (e as Error).message);
      return;
    }

    this.discord.on('error', (error) => {
      this.game.logger.error('Discord', error);
    });

    this.discordGuild = await this.discord.guilds.fetch(
      process.env.DISCORD_GUILD_ID,
    );
    if (!this.discordGuild) {
      this.game.logger.error(
        'Discord',
        `Could not find guild with ID ${process.env.DISCORD_GUILD_ID}.`,
      );
      return;
    }

    await this.discordGuild.fetch();

    // try to load the bridge channel
    if (process.env.DISCORD_CHANNEL_ID) {
      this.discordChannel = (this.discordGuild.channels.cache as any).get(
        process.env.DISCORD_CHANNEL_ID,
      );
      if (!this.discordChannel) {
        this.game.logger.error(
          'Discord',
          `Could not find channel with ID ${process.env.DISCORD_CHANNEL_ID}.`,
        );
        return;
      }
    }

    // try to load the bot command channel
    if (process.env.DISCORD_BOT_CHANNEL_ID) {
      this.discordBotCommandChannel = (
        this.discordGuild.channels.cache as any
      ).get(process.env.DISCORD_BOT_CHANNEL_ID);
      if (!this.discordBotCommandChannel) {
        this.game.logger.error(
          'Discord',
          `Could not find bot channel with ID ${process.env.DISCORD_BOT_CHANNEL_ID}.`,
        );
        return;
      }
    }

    // try to load the market channel
    if (process.env.DISCORD_MARKET_CHANNEL_ID) {
      this.discordMarketplaceChannel = (
        this.discordGuild.channels.cache as any
      ).get(process.env.DISCORD_MARKET_CHANNEL_ID);
      if (!this.discordMarketplaceChannel) {
        this.game.logger.error(
          'Discord',
          `Could not find market channel with ID ${process.env.DISCORD_MARKET_CHANNEL_ID}.`,
        );
        return;
      }
    }

    this.updateLobbyChannel();
    this.watchChat();
    this.initCommands();
  }

  // get the discord user by the tag for use in this service
  public async getDiscordUserByTag(
    tag: string,
  ): Promise<Discord.GuildMember | undefined> {
    try {
      const member = await this.discordGuild?.members.fetch(tag);
      return member;
    } catch {
      return undefined;
    }
  }

  // check if the current user is in discord
  public async isTagInDiscord(tag: string): Promise<boolean> {
    return !!(await this.getDiscordUserByTag(tag));
  }

  // update discord roles for the user: subscriber, verified, online in lobby, etc
  public async updateDiscordRoles(account: IAccount): Promise<void> {
    if (!account.discordTag) return;

    const user = await this.getDiscordUserByTag(account.discordTag);
    if (!user) return;

    const verified = this.getRole('Verified');
    const subscriber = this.getRole('Subscriber');
    const online = this.getRole('Online In Lobby');
    const events = this.getRole('Event Watcher');

    if (verified) {
      if (account.discordTag) {
        this.addRole(user, verified);
      } else {
        this.removeRole(user, verified);
      }
    }

    if (subscriber) {
      if (this.game.subscriptionHelper.isSubscribed(account)) {
        this.addRole(user, subscriber);
      } else {
        this.removeRole(user, subscriber);
      }
    }

    if (online) {
      if (account.alwaysOnline) {
        this.addRole(user, online);
      } else {
        this.removeRole(user, online);
      }
    }

    if (events) {
      if (account.eventWatcher) {
        this.addRole(user, events);
      } else {
        this.removeRole(user, events);
      }
    }
  }

  // remove all discord roles for the user: subscriber, verified, online in lobby; only called before removing the tag
  public async removeDiscordRoles(account: IAccount): Promise<void> {
    if (!account.discordTag) return;

    const user = await this.getDiscordUserByTag(account.discordTag);
    if (!user) return;

    const verified = this.getRole('Verified');
    const subscriber = this.getRole('Subscriber');
    const online = this.getRole('Online In Lobby');
    const events = this.getRole('Event Watcher');

    if (verified) this.removeRole(user, verified);
    if (subscriber) this.removeRole(user, subscriber);
    if (online) this.removeRole(user, online);
    if (events) this.removeRole(user, events);
  }

  // add a role
  public async addRole(
    user: Discord.GuildMember,
    role: Discord.Role,
  ): Promise<void> {
    await user.roles.add(role);
  }

  // remove a role
  public async removeRole(
    user: Discord.GuildMember,
    role: Discord.Role,
  ): Promise<void> {
    await user.roles.remove(role);
  }

  // get a role by name
  public getRole(name: string): Discord.Role | undefined {
    return (this.discordGuild?.roles.cache as any).find((x) => x.name === name);
  }

  // update the lobby channel to have in-lobby/in-game counts
  public async updateLobbyChannel() {
    if (!this.discordChannel) return;

    const online = this.game.lobbyManager.usersInLobby();
    const inGame = this.game.lobbyManager.usersInGameCount();

    await this.discordChannel.setTopic(
      `${online} user(s) connected, ${inGame} player(s) in game`,
    );
  }

  // broadcast a system message
  public async broadcastSystemMessage(message: string) {
    this.chatMessage('★System', message);
  }

  // send a chat message
  public async chatMessage(from: string, message: string) {
    this.discordChannel?.send(`<${from}> ${message}`);
  }

  // send a marketplace update
  public sendMarketplaceMessage(
    player: IPlayer,
    sellItem: ISimpleItem,
    price: number,
  ) {
    this.discordMarketplaceChannel?.send({
      embed: this.createMarketplaceEmbed(player, sellItem, price),
    });
  }

  public createMarketplaceEmbed(
    player: IPlayer,
    sellItem: ISimpleItem,
    price: number,
  ): Discord.MessageEmbed {
    const embed = this.createItemEmbed(sellItem);
    embed
      .setAuthor(player.name)
      .setTitle('View this seller on Rair Global')
      .setURL(
        `https://global.rair.land/character/?username=${player.username}&charSlot=${player.charSlot}`,
      )
      .addField('Price', price.toLocaleString() + ' gold');

    return embed;
  }

  // create an item embed for !item
  public createItemEmbed(sellItem: ISimpleItem): Discord.MessageEmbed {
    const fullItem = this.game.itemHelper.getItemDefinition(sellItem.name);

    const sprite = sellItem.mods.sprite ?? fullItem.sprite;

    const embed = new Discord.MessageEmbed();
    embed
      .setAuthor(fullItem.name)
      .setThumbnail(
        `https://play.rair.land/assets/spritesheets/items/${sprite.toString().padStart(4, '0')}.png`,
      )
      .addField('Description', fullItem.desc)
      .addField('Item Type', fullItem.itemClass, true);

    if (WeaponClasses.includes(fullItem.itemClass as any)) {
      embed.addField('Attack Skill', fullItem.type, true);
    }

    if (fullItem.requirements) {
      const requirements: string[] = [];
      if (fullItem.requirements.baseClass)
        requirements.push(`Class: ${fullItem.requirements.baseClass}`);
      if (fullItem.requirements.level)
        requirements.push(`Level: ${fullItem.requirements.level}`);

      embed.addField('Requirements', requirements.join(', '), true);
    }

    return embed;
  }

  // create an npc embed for !npc
  public createNPCEmbed(fullCreature: INPCDefinition): Discord.MessageEmbed {
    const hp =
      fullCreature.hp.min === fullCreature.hp.max
        ? fullCreature.hp.max.toLocaleString()
        : `${fullCreature.hp.min.toLocaleString()}~${fullCreature.hp.max.toLocaleString()}`;

    const embed = new Discord.MessageEmbed();
    embed
      .setAuthor(fullCreature.name)
      .setThumbnail(
        `https://play.rair.land/assets/spritesheets/creatures/${fullCreature.sprite.toString().padStart(4, '0')}.png`,
      );

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

    const importantStats = [
      Stat.STR,
      Stat.DEX,
      Stat.AGI,
      Stat.INT,
      Stat.WIS,
      Stat.WIL,
      Stat.CON,
      Stat.CHA,
      Stat.LUK,
    ];
    embed.addField(
      'Stats',
      importantStats
        .map((x) => `**${x.toUpperCase()}**: ${fullCreature.stats[x]}`)
        .join(', '),
    );

    return embed;
  }

  // watch for incoming chat messages
  private watchChat() {
    this.discord.on('message', (message) => {
      const { cleanContent, channel, author, member } = message;

      if (
        !channel ||
        !this.discordChannel ||
        !this.discordBotCommandChannel ||
        author.bot
      )
        return;

      if (channel.id === this.discordChannel.id) {
        const username =
          this.game.lobbyManager.getUsernameByDiscordId[author.id];
        const fromName =
          username ?? member?.nickname ?? member?.displayName ?? 'unknown';
        this.game.messageHelper.sendMessage(
          fromName,
          cleanContent,
          true,
          !!username,
        );
      }

      if (channel.id === this.discordBotCommandChannel.id) {
        const cmd = cleanContent.split(' ')[0];
        if (this.discordCommands[cmd]) {
          this.discordCommands[cmd].do(message, this.game);
        }
      }
    });

    this.discord.on('presenceUpdate', () => {
      const allOnline = (this.discordGuild?.members.cache as any).filter((x) =>
        x.roles.cache.some((r) => r.name === 'Online In Lobby'),
      );
      this.game.lobbyManager.setDiscordOnlineCount(allOnline.array().length);
    });
  }

  // watch for commands and do stuff
  private initCommands() {
    Object.values(commands).forEach((command) => {
      const cmdInst = new command();
      this.discordCommands[cmdInst.name] = cmdInst;
    });
  }
}
