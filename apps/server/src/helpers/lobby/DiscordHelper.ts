import * as Discord from 'discord.js';
import { Injectable } from 'injection-js';

import type {
  IAccount,
  INPCDefinition,
  IPlayer,
  ISimpleItem,
} from '@lotr/interfaces';
import { Stat, WeaponClasses } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

import { itemGet } from '@lotr/content';
import {
  lobbyDiscordUserCountSet,
  lobbyGetUsernameByDiscordId,
  lobbyInGamePlayerCount,
  lobbyUserCount,
} from '@lotr/lobby';
import { consoleError, consoleLog } from '@lotr/logger';
import { isSubscribed } from '@lotr/premium';
import type { IDiscordCommand } from '../../interfaces';
import * as commands from './discord-commands';

@Injectable()
export class DiscordHelper extends BaseService {
  private discord: Discord.Client;
  private discordGuild: Discord.Guild | undefined;
  private discordChannel: Discord.TextChannel | undefined;
  private discordBotCommandChannel: Discord.TextChannel | undefined;
  private discordMarketplaceChannel: Discord.TextChannel | undefined;
  private discordBugReportsChannel: Discord.TextChannel | undefined;

  private commands = new Discord.Collection<string, IDiscordCommand>();

  private get discordSecret(): string {
    return process.env.DISCORD_SECRET as string;
  }

  private get discordServer(): string {
    return process.env.DISCORD_GUILD_ID as string;
  }

  private get discordApplication(): string {
    return process.env.DISCORD_APPLICATION_ID as string;
  }

  public get canSendBugReports() {
    return !!this.discordBugReportsChannel;
  }

  public async init() {
    if (!this.discordSecret || !this.discordServer) return;

    this.discord = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds],
    });

    this.discord.on(Discord.Events.ClientReady, async () => {
      consoleLog('Discord', 'Ready!');

      this.discordGuild = await this.discord.guilds.fetch(this.discordServer);
      if (!this.discordGuild) {
        consoleError(
          'Discord',
          new Error(
            `Could not find guild with ID ${process.env.DISCORD_GUILD_ID}.`,
          ),
        );
        return;
      }

      await this.extractChannels();
      this.updateLobbyChannel();
      this.watchChat();
      this.initCommands();
    });

    try {
      await this.discord.login(this.discordSecret);
      consoleLog('Discord', 'Connected!');
    } catch (e) {
      consoleError('Discord', e as Error);
      return;
    }

    this.discord.on(Discord.Events.Error, (error) => {
      consoleError('Discord', error);
    });
  }

  private async extractChannels() {
    if (!this.discordGuild) return;

    await this.discordGuild.fetch();

    // try to load the bridge channel
    if (process.env.DISCORD_CHANNEL_ID) {
      this.discordChannel = (this.discordGuild.channels.cache as any).get(
        process.env.DISCORD_CHANNEL_ID,
      );
      if (!this.discordChannel) {
        consoleError(
          'Discord',
          new Error(
            `Could not find channel with ID ${process.env.DISCORD_CHANNEL_ID}.`,
          ),
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
        consoleError(
          'Discord',
          new Error(
            `Could not find bot channel with ID ${process.env.DISCORD_BOT_CHANNEL_ID}.`,
          ),
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
        consoleError(
          'Discord',
          new Error(
            `Could not find market channel with ID ${process.env.DISCORD_MARKET_CHANNEL_ID}.`,
          ),
        );
        return;
      }
    }

    // try to load the bug report channel
    if (process.env.DISCORD_BUGREPORT_CHANNEL_ID) {
      this.discordBugReportsChannel = (
        this.discordGuild.channels.cache as any
      ).get(process.env.DISCORD_BUGREPORT_CHANNEL_ID);
      if (!this.discordBugReportsChannel) {
        consoleError(
          'Discord',
          new Error(
            `Could not find bug report channel with ID ${process.env.DISCORD_BUGREPORT_CHANNEL_ID}.`,
          ),
        );
        return;
      }
    }
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
      if (isSubscribed(account)) {
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

    const online = lobbyUserCount();
    const inGame = lobbyInGamePlayerCount();

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
      embeds: [this.createMarketplaceEmbed(player, sellItem, price)],
    });
  }

  public createMarketplaceEmbed(
    player: IPlayer,
    sellItem: ISimpleItem,
    price: number,
  ): Discord.EmbedBuilder {
    const embed = this.createItemEmbed(sellItem);
    embed
      .setAuthor({ name: player.name })
      .setTitle('View this seller on Rair Global')
      .setURL(
        `https://global.rair.land/character/?username=${player.username}&charSlot=${player.charSlot}`,
      )
      .addFields([{ name: 'Price', value: price.toLocaleString() + ' gold' }]);

    return embed;
  }

  // create an item embed for !item
  public createItemEmbed(sellItem: ISimpleItem): Discord.EmbedBuilder {
    const fullItem = itemGet(sellItem.name)!;

    const sprite = sellItem.mods.sprite ?? fullItem.sprite;

    const embed = new Discord.EmbedBuilder();
    embed
      .setAuthor({ name: fullItem.name })
      .setThumbnail(
        `https://play.rair.land/assets/spritesheets/items/${sprite.toString().padStart(4, '0')}.png`,
      )
      .addFields([
        { name: 'Description', value: fullItem.desc },
        { name: 'Item Type', value: fullItem.itemClass, inline: true },
      ]);

    if (WeaponClasses.includes(fullItem.itemClass as any)) {
      embed.addFields([
        { name: 'Attack Skill', value: fullItem.type, inline: true },
      ]);
    }

    if (fullItem.requirements) {
      const requirements: string[] = [];
      if (fullItem.requirements.baseClass) {
        requirements.push(`Class: ${fullItem.requirements.baseClass}`);
      }
      if (fullItem.requirements.level) {
        requirements.push(`Level: ${fullItem.requirements.level}`);
      }

      embed.addFields([
        { name: 'Requirements', value: requirements.join(', '), inline: true },
      ]);
    }

    return embed;
  }

  // create an npc embed for !npc
  public createNPCEmbed(fullCreature: INPCDefinition): Discord.EmbedBuilder {
    const hp =
      fullCreature.hp.min === fullCreature.hp.max
        ? fullCreature.hp.max.toLocaleString()
        : `${fullCreature.hp.min.toLocaleString()}~${fullCreature.hp.max.toLocaleString()}`;

    const embed = new Discord.EmbedBuilder();
    embed
      .setAuthor({ name: fullCreature.name?.[0] ?? 'Unknown Name' })
      .setThumbnail(
        `https://play.rair.land/assets/spritesheets/creatures/${fullCreature.sprite.toString().padStart(4, '0')}.png`,
      );

    embed.addFields([
      { name: 'Level', value: fullCreature.level.toString(), inline: true },
      { name: 'HP', value: hp.toString(), inline: true },
      {
        name: 'Allegiance',
        value: fullCreature.allegiance as string,
        inline: true,
      },
    ]);

    if (fullCreature.tansFor) {
      embed.addFields([{ name: 'Tannable', value: 'Yes', inline: true }]);
    }

    if (fullCreature.affiliation) {
      embed.addFields([
        { name: 'Affiliation', value: fullCreature.affiliation, inline: true },
      ]);
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
    embed.addFields([
      {
        name: 'Stats',
        value: importantStats
          .map((x) => `**${x.toUpperCase()}**: ${fullCreature.stats[x]}`)
          .join(', '),
      },
    ]);

    return embed;
  }

  public getBugReportEmbed(
    player: IPlayer,
    { report, userAgent },
  ): Discord.EmbedBuilder {
    const embed = new Discord.EmbedBuilder();

    embed
      .setAuthor({
        name: player.name,
        url: `https://global.rair.land/character/?username=${player.username}&charSlot=${player.charSlot}`,
      })
      .setTimestamp()
      .setDescription(`Report: ${report}`)
      .addFields([
        { name: 'User Agent', value: userAgent },
        { name: 'Location', value: `${player.map}:${player.x},${player.y}` },
      ]);

    return embed;
  }

  public async sendBugReport(player: IPlayer, embedData) {
    const embed = this.getBugReportEmbed(player, embedData);

    const pJsonAttachment = new Discord.AttachmentBuilder(
      Buffer.from(JSON.stringify(player, null, 2)),
      {
        name: `${player.name}.json`,
        description: `${player.name}'s current status`,
      },
    );

    const pStateJsonAttachment = new Discord.AttachmentBuilder(
      Buffer.from(
        JSON.stringify(this.game.playerManager.getPlayerState(player), null, 2),
      ),
      {
        name: `${player.name}-state.json`,
        description: `${player.name}'s current game state`,
      },
    );

    const newMessage = await this.discordBugReportsChannel?.send({
      content: '**New Bug Report!**',
      embeds: [embed],
      files: [pJsonAttachment, pStateJsonAttachment],
    });

    newMessage?.startThread({
      name: `Bug Discussion: ${player.name} - ${embedData.report.substring(0, 50)}`,
    });
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
      ) {
        return;
      }

      if (channel.id === this.discordChannel.id) {
        const username = lobbyGetUsernameByDiscordId(author.id);
        const fromName =
          username ?? member?.nickname ?? member?.displayName ?? 'unknown';
        this.game.messageHelper.sendMessage(
          fromName,
          cleanContent,
          true,
          !!username,
        );
      }
    });

    this.discord.on('presenceUpdate', () => {
      const allOnline = (this.discordGuild?.members.cache as any).filter((x) =>
        x.roles.cache.some((r) => r.name === 'Online In Lobby'),
      );
      lobbyDiscordUserCountSet(allOnline.array().length);
    });
  }

  private async createAndDeployCommands() {
    const commandList: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] =
      [];

    Object.values(commands).forEach((command) => {
      const commandData: IDiscordCommand = new command() as IDiscordCommand;
      this.commands.set(commandData.command.name, commandData);
      commandList.push(commandData.command.toJSON());
    });

    const rest = new Discord.REST().setToken(this.discordSecret);
    consoleLog('Discord', `Started refreshing application (/) commands.`);

    consoleLog('Discord', 'Registering global (/) commands...');

    try {
      await rest.put(
        Discord.Routes.applicationCommands(this.discordApplication),
        {
          body: commandList,
        },
      );

      consoleLog('Discord', `Successfully reloaded application (/) commands.`);
    } catch (e) {
      consoleError('Discord', e as Error);
    }
  }

  // watch for commands and do stuff
  private async initCommands() {
    if (!this.discordApplication) {
      consoleLog(
        'Discord',
        `No application ID, skipping (/) command registration...`,
      );
      return;
    }

    await this.createAndDeployCommands();

    this.discord.on(Discord.Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`,
        );
        return;
      }

      try {
        await command.do(interaction, this.game);
      } catch (error) {
        consoleError('Discord:Interaction', error as Error);

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    });
  }
}
