import { Injectable } from 'injection-js';

import type {
  IGuild,
  IGuildMember } from '@lotr/interfaces';
import {
  Currency,
  GameAction,
  GuildRole
} from '@lotr/interfaces';
import { sortBy } from 'lodash';
import type { Guild, Player } from '../../models';
import { BaseService } from '../../models/BaseService';

const autoGuilds: IGuild[] = [
  {
    level: 0,
    members: {},
    motd: '',
    name: 'Game Masters',
    tag: 'GM',
    timestamp: 0,
    treasury: 0,
  },
  {
    level: 0,
    members: {},
    motd: '',
    name: 'Testers',
    tag: 'TEST',
    timestamp: 0,
    treasury: 0,
  },
];

@Injectable()
export class GuildManager extends BaseService {
  private guilds: Record<string, Guild> = {};

  public async init() {
    await this.loadGuilds();
    this.createAutoGuilds();
  }

  private createAutoGuilds() {
    autoGuilds.forEach((guild) => {
      if (this.getGuildByTag(guild.tag)) return;

      this.game.guildsDB.createGuild(undefined, guild.name, guild.tag);
    });
  }

  private isAutoGuild(guild: Guild): boolean {
    return ['TEST', 'GM'].includes(guild.tag);
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

  // get a guild by id (if possible)
  public getGuildByTag(tag: string): Guild | undefined {
    return Object.values(this.guilds).find((g) => g.tag === tag);
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
    return this.getGuildMemberForPlayerById(guild, player.uuid);
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

    this.sendGuildUpdateToGuild(guild);
  }

  // update all guild members guild info
  private sendGuildUpdateToGuild(guild: Guild) {
    this.getGuildMembers(guild).forEach((member) => {
      const onlinePlayer = this.game.playerManager.getPlayerByUsername(
        member.playerUsername,
      );
      if (!onlinePlayer) return;

      this.sendGuildUpdateToPlayer(onlinePlayer);
    });
  }

  // update a specific players guild info
  public sendGuildUpdateToPlayer(player: Player) {
    const guild = this.getGuildForPlayer(player);
    if (!guild) return;

    this.game.wsCmdHandler.sendToSocket(player.username, {
      action: GameAction.UpdateGuild,
      guild,
    });
  }

  // update a players props, usually after joining/leaving
  private updatePlayerProps(player: Player) {
    this.game.playerHelper.refreshPlayerMapState(player);
  }

  // send empty guild / reset to player
  private emptyGuildForPlayer(player: Player) {
    player.affiliation = '';
    player.guildId = '';

    this.game.wsCmdHandler.sendToSocket(player.username, {
      action: GameAction.UpdateGuild,
      guild: null,
    });
  }

  private emptyGuildForPlayerByUsername(username: string) {
    const onlinePlayer = this.game.playerManager.getPlayerByUsername(username);
    if (!onlinePlayer) return;

    this.emptyGuildForPlayer(onlinePlayer);
  }

  // check if a member is the same as a player
  private isTargetSameAsMember(check: Player, member: IGuildMember): boolean {
    return check.username === member.playerUsername;
  }

  // load all of the guilds
  public async loadGuilds() {
    const allGuilds = await this.game.guildsDB.loadAllGuilds();
    allGuilds.forEach((guild) => {
      this.guilds[guild._id.toHexString()] = guild;
    });
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

  // disband a guild
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

  // delete the guild (called by disband)
  public async deleteGuild(guild: Guild) {
    if (this.isAutoGuild(guild)) return;

    this.getGuildMembers(guild).forEach((member) => {
      const onlinePlayer = this.game.playerManager.getPlayerByUsername(
        member.playerUsername,
      );
      if (!onlinePlayer) return;

      onlinePlayer.guildId = '';
      onlinePlayer.affiliation = '';

      this.updatePlayerProps(onlinePlayer);

      this.game.wsCmdHandler.sendToSocket(onlinePlayer.username, {
        action: GameAction.UpdateGuild,
        guild: null,
      });
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
    this.removeGuildMemberById(guild, member.uuid);
  }

  // remove a guild member by id rather than player ref
  private removeGuildMemberById(guild: Guild, uuid: string) {
    delete guild.members[uuid];
  }

  public addGuildMember(
    guild: Guild,
    member: Player,
    role = GuildRole.Invited,
  ) {
    guild.members[member.uuid] = {
      playerClass: member.baseClass,
      playerId: member.uuid,
      playerLevel: member.level,
      playerName: member.name,
      playerUsername: member.username,
      playerRole: role,
      joinedAt: new Date(),
    };
  }

  // invite a new member to the guild
  public async inviteMember(actor: Player, target: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

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

    const existingMember = this.getGuildMemberForPlayer(guild, target);
    if (existingMember) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You already invited that player!',
      );
      return;
    }

    const totalMembers = this.getGuildMembers(guild).length;
    const memberCap =
      this.game.contentManager.settingsData.guild.specs.maxMembers;
    if (totalMembers >= memberCap) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        `You have reached the member cap (${memberCap}) and can't invite any more members!`,
      );
      return;
    }

    this.addGuildMember(guild, target);
    this.setGuildForPlayer(target);
    this.logMemberAction(actor, `Invited ${target.name} to guild.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You invited ${target.name} to join your guild!`,
    );

    this.game.messageHelper.sendSimpleMessage(
      target,
      `You've been invited to a guild by ${actor.name}: ${guild.name} [${guild.tag}]!`,
    );

    this.sendGuildUpdateToPlayer(target);
  }

  // accept a guild invite
  public async acceptInvite(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

    if (!this.canMemberDoAction(actor, GuildRole.Invited)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayer(guild, actor);
    if (!member) return;

    if (member.playerRole !== GuildRole.Invited) return;

    this.changeMemberPermissionLevel(actor, GuildRole.Member);
    this.setGuildForPlayer(actor);
    this.logMemberAction(actor, `Accepted guild invite.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You've accepted the invite to the guild: ${guild.name} [${guild.tag}]!`,
    );

    this.sendGuildUpdateToPlayer(actor);
  }

  // deny a guild invite
  public async denyInvite(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

    if (!this.canMemberDoAction(actor, GuildRole.Invited)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayer(guild, actor);
    if (!member) return;

    if (member.playerRole !== GuildRole.Invited) return;

    this.removeGuildMember(guild, actor);
    this.logMemberAction(actor, `Denied guild invite.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You've rejected the invite to the guild: ${guild.name} [${guild.tag}]!`,
    );

    this.emptyGuildForPlayer(actor);
  }

  // leave the guild
  public async leaveGuild(actor: Player) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

    const member = this.getGuildMemberForPlayer(guild, actor);
    if (!member) return;

    const numOwners = this.getGuildMembers(guild).filter(
      (m) => m.playerRole >= GuildRole.Owner,
    ).length;
    if (numOwners === 1 && member.playerRole >= GuildRole.Owner) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You cannot leave as the only owner. You must disband or make someone else an owner, first!',
      );
      return;
    }

    this.removeGuildMember(guild, actor);
    this.logMemberAction(actor, `Left guild.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(actor, `You left your guild.`);

    this.emptyGuildForPlayer(actor);
  }

  // remove a member from the guild (eg, kick)
  public async removeMember(actor: Player, target: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

    if (!this.canMemberDoAction(actor, GuildRole.Administrator)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayerById(guild, target);
    if (!member) return;

    if (this.isTargetSameAsMember(actor, member)) return;

    this.removeGuildMemberById(guild, member.playerId);
    this.logMemberAction(actor, `Removed ${member.playerName} from guild.`);
    this.saveGuild(guild);

    this.emptyGuildForPlayerByUsername(member.playerUsername);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You kicked ${member.playerName}!`,
    );
  }

  // promote a guild member
  public async promoteMember(actor: Player, target: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

    if (!this.canMemberDoAction(actor, GuildRole.Owner)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayerById(guild, target);
    if (!member) return;

    if (this.isTargetSameAsMember(actor, member)) return;

    if (member.playerRole === GuildRole.Invited) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'They need to join first!',
      );
      return;
    }

    if (member.playerRole === GuildRole.Administrator) {
      member.playerRole = GuildRole.Owner;
    }

    if (member.playerRole === GuildRole.Member) {
      member.playerRole = GuildRole.Administrator;
    }

    this.logMemberAction(actor, `Promoted ${member.playerName}.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You promoted ${member.playerName}!`,
    );
  }

  // demote a guild member
  public async demoteMember(actor: Player, target: string) {
    const guild = this.getGuildForPlayer(actor);
    if (!guild) return;

    if (this.isAutoGuild(guild)) return;

    if (!this.canMemberDoAction(actor, GuildRole.Owner)) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'You do not have permission to do that!',
      );
      return;
    }

    const member = this.getGuildMemberForPlayerById(guild, target);
    if (!member) return;

    if (member.playerRole === GuildRole.Invited) {
      this.game.messageHelper.sendSimpleMessage(
        actor,
        'They need to join first!',
      );
      return;
    }

    if (this.isTargetSameAsMember(actor, member)) return;

    if (member.playerRole === GuildRole.Administrator) {
      member.playerRole = GuildRole.Member;
    }

    if (member.playerRole === GuildRole.Owner) {
      member.playerRole = GuildRole.Administrator;
    }

    this.logMemberAction(actor, `Demoted ${member.playerName}.`);
    this.saveGuild(guild);

    this.game.messageHelper.sendSimpleMessage(
      actor,
      `You demoted ${member.playerName}!`,
    );
  }

  // add gold to the guild treasury
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

  // remove gold from the treasury
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

    newMOTD = newMOTD.substring(0, 250);

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

    const logEntries = await this.game.guildLogsDB.getEntriesForGuild(guild);

    const entriesToSend = sortBy(logEntries, (entry) => -entry.timestamp).slice(
      0,
      30,
    );

    this.game.wsCmdHandler.sendToSocket(actor.username, {
      action: GameAction.UpdateGuildAuditLog,
      auditLog: entriesToSend,
    });
  }

  public guildMessage(guild: Guild, message: string) {
    this.getGuildMembers(guild).forEach((member) => {
      const onlinePlayer = this.game.playerManager.getPlayerByUsername(
        member.playerUsername,
      );
      if (!onlinePlayer) return;

      this.game.messageHelper.sendSimpleMessage(onlinePlayer, message);
    });
  }
}
