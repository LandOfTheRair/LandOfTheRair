import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { select } from '@ngxs/store';

import { GameState } from '../../../../stores';

import { GuildRole, IGuildMember } from '@interfaces/guild';
import { sortBy } from 'lodash';
import { ModalService } from 'src/app/services/modal.service';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-guild',
  templateUrl: './guild.component.html',
  styleUrls: ['./guild.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildComponent {
  public player = select(GameState.player);
  public guild = select(GameState.guild);

  private gameService = inject(GameService);
  private modalService = inject(ModalService);

  public guildMembers = computed(() =>
    sortBy(Object.values(this.guild()?.members ?? {}), [
      (member) => -member.playerRole,
      (member) => member.playerName,
    ]),
  );

  public myMember = computed(() => this.guild()?.members[this.player()?.uuid]);

  public myPowerLevel = computed(() => this.myMember()?.playerRole ?? 0);

  public canDoOwnerActions = computed(
    () => this.myPowerLevel() >= GuildRole.Owner,
  );
  public canDoAdministratorActions = computed(
    () => this.myPowerLevel() >= GuildRole.Administrator,
  );
  public canDoMemberActions = computed(
    () => this.myPowerLevel() >= GuildRole.Member,
  );
  public canDoInvitedActions = computed(
    () => this.myPowerLevel() >= GuildRole.Invited,
  );

  public isInvitee = computed(() => this.myPowerLevel() === GuildRole.Invited);

  public memberIcon(member: IGuildMember): string {
    if (member.playerRole >= GuildRole.Owner) return 'caesar';
    if (member.playerRole >= GuildRole.Administrator) return 'brute';
    if (member.playerRole >= GuildRole.Member) return 'bully-minion';

    return 'ages';
  }

  public disbandGuild() {
    this.modalService
      .confirm(
        'Disband Guild',
        'Are you sure you want to disband your guild? This will kick everyone out, and is NOT reversible!',
      )
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString('guild disband');
      });
  }

  public leaveGuild() {
    this.modalService
      .confirm('Leave Guild', 'Are you sure you want to leave your guild?')
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString('guild leave');
      });
  }

  public inviteMember() {
    this.modalService
      .input(
        'Invite Guild Member',
        'Who would you like to invite to your guild? They need to be near you to send an invitation.',
      )
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString(`guild invite ${res}`);
      });
  }

  public changeMOTD() {
    this.modalService
      .input('Change MOTD', 'Change the message of the day for your guild.')
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString(`guild setmotd ${res}`);
      });
  }

  public acceptInvite() {
    this.gameService.sendCommandString('guild inviteaccept');
  }

  public denyInvite() {
    this.gameService.sendCommandString('guild invitereject');
  }

  public promoteMember(memberId: string) {
    this.gameService.sendCommandString(`guild promote ${memberId}`);
  }

  public demoteMember(memberId: string) {
    this.gameService.sendCommandString(`guild demote ${memberId}`);
  }

  public kickMember(memberId: string) {
    this.gameService.sendCommandString(`guild kick ${memberId}`);
  }
}
