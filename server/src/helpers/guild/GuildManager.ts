import { Injectable } from 'injection-js';

import {
  Currency,
  GuildRole,
  IGuildMember,
} from '../../../../shared/interfaces';
import { Guild, Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class GuildManager extends BaseService {
  private guilds: Record<string, Guild> = {};

  public async init() {
    await this.loadGuilds();
  }

  // set the guild id for a player
  public setGuildForPlayer(player: Player) {
    player.guildId = '';
    player.affiliation = '';

    Object.values(this.guilds).forEach((guild) => {
      if (!this.getGuildMemberForPlayer(guild, player)) return;

      player.guildId = guild._id.toHexString();
    });

    if (player.guildId) {
      const guild = this.getGuildById(player.guildId);
      if (!guild) return;

      const member = this.getGuildMemberForPlayer(guild, player);
      if (!member || member.playerRole === GuildRole.Invited) return;

      player.affiliation = `${guild.name} [${guild.tag}]`;
    }
  }

  // sync player attributes with their guild equivalent
  public syncPlayerWithGuild(player: Player) {
    if (!player.guildId) return;

    const guild = this.getGuildById(player.guildId);
    if (!guild) return;

    const member = this.getGuildMemberForPlayer(guild, player);
    if (!member) return;

    member.playerClass = player.baseClass;
    member.playerLevel = player.level;
    member.playerName = player.name;

    this.saveGuild(guild);
  }

  // get a guild ref for a player (if possible)
  public getGuildForPlayer(player: Player): Guild | undefined {
    return this.guilds[player.guildId];
  }

  // get a guild by id (if possible)
  public getGuildById(id: string): Guild | undefined {
    return this.guilds[id];
  }

  // get the members for a guild in an iterable form
  public getGuildMembers(guild: Guild): IGuildMember[] {
    return Object.values(guild.members);
  }

  // get a guild member ref for a specific player
  public getGuildMemberForPlayer(
    guild: Guild,
    player: Player,
  ): IGuildMember | undefined {
    return this.getGuildMemberForPlayerById(guild, player._id.toHexString());
  }

  // get a guild member ref for a specific player by id
  public getGuildMemberForPlayerById(
    guild: Guild,
    id: string,
  ): IGuildMember | undefined {
    return guild.members[id];
  }

  // save the guild
  private saveGuild(guild: Guild) {
    if (!guild) return;

    this.game.guildsDB.saveGuild(guild);
  }

  private updatePlayerProps(player: Player) {
    this.game.playerHelper.refreshPlayerMapState(player);
  }

  public async loadGuilds() {
    const allGuilds = await this.game.guildsDB.loadAllGuilds();
    allGuilds.forEach((guild) => {
      this.guilds[guild._id.toHexString()] = guild;
    });

    // TODO: if no gm guild, make one
    // TODO: if no tester guild, make one
  }

  // create the guild
  public async createGuild(player: Player, name: string, tag: string) {
    const guild = await this.game.guildsDB.createGuild(player, name, tag);
    if (!guild) {
      this.game.messageHelper.sendSimpleMessage(
        player,
        'Failed to create guild!',
      );
      return;
    }

    this.guilds[guild._id.toHexString()] = guild;

    this.setGuildForPlayer(player);
    this.syncPlayerWithGuild(player);

    this.updatePlayerProps(player);

    this.logMemberAction(player, `Created guild.`);

    this.game.messageHelper.sendSimpleMessage(
      player,
      `You've successfully created a guild: ${name} [${tag}]!`,
    );
  }

  public async disbandGuild(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        `You don't have a guild!`,
      );
      return;
    }

    if (!this.canMemberDoAction(actor, GuildRole.Owner)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    this.logMemberAction(actor, `Disbanded guild.`);

    await this.deleteGuild(guild);

    this.setGuildForPlayer(actor);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You've successfully disbanded a guild: ${guild.name} [${guild.tag}]!`,
    );
  }

  // delete the guild
  public async deleteGuild(guild: Guild) {
    if (['GM', 'TEST'].includes(guild.tag)) return;

    this.getGuildMembers(guild).forEach((member) => {
      const onlinePlayer = this.game.playerManager.getPlayerByUsername(
        member.playerUsername,
      );
      if (!onlinePlayer) return;

      onlinePlayer.guildId = '';
      onlinePlayer.affiliation = '';

      this.updatePlayerProps(onlinePlayer);
    });

    delete this.guilds[guild._id.toHexString()];

    return this.game.guildsDB.deleteGuild(guild);
  }

  // check if a guild member can do an action
  private canMemberDoAction(
    actor: Player,
    requiredPermission: GuildRole,
  ): boolean {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return false;

    const member = this.getGuildMemberForPlayer(guild, actor);
    if (!member) return false;

    return member.playerRole >= requiredPermission;
  }

  // change a guild members permission level
  private changeMemberPermissionLevel(actor: Player, newPermission: GuildRole) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    const member = this.getGuildMemberForPlayer(guild, actor);
    if (!member) return;

    member.playerRole = newPermission;

    this.syncPlayerWithGuild(actor);
    this.saveGuild(guild);
  }

  // log a member action for the audit log
  private logMemberAction(actor: Player, action: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    this.game.guildLogsDB.addLogEntry(guild, action, actor.name);
  }

  // remove a guild member
  private removeGuildMember(guild: Guild, member: Player) {
    delete guild.members[member._id.toHexString()];
  }

  public addGuildMember(
    guild: Guild,
    member: Player,
    role = GuildRole.Invited,
  ) {
    guild.members[member._id.toHexString()] = {
      playerClass: member.baseClass,
      playerId: member._id.toHexString(),
      playerLevel: member.level,
      playerName: member.name,
      playerUsername: member.username,
      playerRole: role,
    };
  }

  // invite a new member to the guild
  public async inviteMember(actor: Player, target: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    const targetGuild = this.getGuildForPlayer(target);
    if (targetGuild) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'That player already has a guild!',
      );
      return;
    }

    if (!this.canMemberDoAction(actor, GuildRole.Administrator)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    this.addGuildMember(guild, target);
    this.setGuildForPlayer(actor);
    this.logMemberAction(actor, `Invited ${target.name} to guild.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(
      target,
      `You've been invited to a guild by ${actor.name}: ${guild.name} [${guild.tag}]!`,
    );
  }

  // accept a guild invite
  public async acceptInvite(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (!this.canMemberDoAction(actor, GuildRole.Invited)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    this.changeMemberPermissionLevel(actor, GuildRole.Member);
    this.logMemberAction(actor, `Accepted guild invite.`);
  }

  // deny a guild invite
  public async denyInvite(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (!this.canMemberDoAction(actor, GuildRole.Invited)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    this.removeGuildMember(guild, actor);
    this.logMemberAction(actor, `Denied guild invite.`);
    this.saveGuild(guild);
  }

  // remove a member from the guild (eg, kick)
  public async removeMember(actor: Player, target: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (!this.canMemberDoAction(actor, GuildRole.Administrator)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayerById(guild, target);
    if (!member) return;

    this.removeGuildMember(guild, actor);
    this.logMemberAction(actor, `Removed ${member.playerName} from guild.`);
    this.saveGuild(guild);
  }

  // promote a guild member
  public async promoteMember(actor: Player, target: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (!this.canMemberDoAction(actor, GuildRole.Owner)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayerById(guild, target);
    if (!member) return;

    if (member.playerRole === GuildRole.Administrator) {
      member.playerRole = GuildRole.Owner;
    }

    if (member.playerRole === GuildRole.Member) {
      member.playerRole = GuildRole.Administrator;
    }

    this.logMemberAction(actor, `Promoted ${member.playerName}.`);
    this.saveGuild(guild);
  }

  // demote a guild member
  public async demoteMember(actor: Player, target: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (!this.canMemberDoAction(actor, GuildRole.Owner)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayerById(guild, target);
    if (!member) return;

    if (member.playerRole === GuildRole.Administrator) {
      member.playerRole = GuildRole.Member;
    }

    if (member.playerRole === GuildRole.Owner) {
      member.playerRole = GuildRole.Administrator;
    }

    this.logMemberAction(actor, `Demoted ${member.playerName}.`);
    this.saveGuild(guild);
  }

  // add coins to the guild treasury
  public async addToTreasury(actor: Player, amount: number) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    amount = this.game.userInputHelper.cleanNumber(amount, 0, {
      floor: true,
      abs: true,
    });
    if (amount <= 0) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'Not enough to add to treasury!',
      );
      return;
    }

    if (!this.game.currencyHelper.hasCurrency(actor, amount, Currency.Gold)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'Not enough to add to treasury!',
      );
      return;
    }

    this.game.currencyHelper.loseCurrency(actor, amount, Currency.Gold);
    guild.treasury += amount;

    this.logMemberAction(
      actor,
      `Added ${amount.toLocaleString()} gold to treasury.`,
    );

    this.saveGuild(guild);
  }

  public async removeFromTreasury(actor: Player, amount: number) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    amount = this.game.userInputHelper.cleanNumber(amount, 0, {
      floor: true,
      abs: true,
    });
    if (amount <= 0 || guild.treasury < amount) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'Not enough to take from treasury!',
      );
      return;
    }

    if (!this.canMemberDoAction(actor, GuildRole.Administrator)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    this.game.currencyHelper.gainCurrency(actor, amount, Currency.Gold);
    guild.treasury -= amount;

    this.logMemberAction(
      actor,
      `Removed ${amount.toLocaleString()} from treasury.`,
    );

    this.saveGuild(guild);
  }

  // update the MOTD for the guild
  public async updateMOTD(actor: Player, newMOTD: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    newMOTD = newMOTD.substring(0, 100);

    if (!this.canMemberDoAction(actor, GuildRole.Administrator)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    guild.motd = newMOTD;

    this.logMemberAction(actor, `Set MOTD to ${newMOTD}.`);
    this.saveGuild(guild);
  }

  // get the guild audit log for viewing
  public async getAuditLog(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    return this.game.guildLogsDB.getEntriesForGuild(guild);
  }
}
