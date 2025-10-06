import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameServerEvent } from '@lotr/interfaces';
import { select } from '@ngxs/store';
import { AccountState } from '../../../../stores';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  public socketService = inject(SocketService);
  public dialogRef = inject(MatDialogRef<AccountComponent>);

  public account = select(AccountState.account);

  public currentPassword: string;
  public newPassword: string;
  public newEmail: string;
  public verificationCode: string;

  public canRequestVerificationCode = true;

  public get canChangePassword() {
    return (
      this.currentPassword && this.newPassword && this.newPassword.length > 10
    );
  }

  public get canChangeTag() {
    return (
      !this.account().discordTag ||
      (this.account().discordTag && this.account().discordTag.length > 16)
    );
  }

  public changeTag() {
    this.socketService.emit(GameServerEvent.ChangeDiscordTag, {
      discordTag: this.account().discordTag,
    });
  }

  public changeOnline() {
    this.socketService.emit(GameServerEvent.ChangeAlwaysOnline, {
      alwaysOnline: this.account().alwaysOnline,
    });
  }

  public changeEvents() {
    this.socketService.emit(GameServerEvent.ChangeEventWatcher, {
      eventWatcher: this.account().eventWatcher,
    });
  }

  public changePassword() {
    this.socketService.emit(GameServerEvent.ChangePassword, {
      oldPassword: this.currentPassword,
      newPassword: this.newPassword,
    });
  }

  public changeEmail() {
    this.socketService.emit(GameServerEvent.ChangeEmail, {
      newEmail: this.newEmail,
    });
    this.newEmail = '';
  }

  public requestVerify() {
    this.canRequestVerificationCode = false;
    setTimeout(() => {
      this.canRequestVerificationCode = true;
    }, 60000);

    this.socketService.emit(GameServerEvent.RequestVerification);
  }

  public doVerify() {
    this.socketService.emit(GameServerEvent.SubmitVerification, {
      verificationCode: this.verificationCode,
    });
    this.verificationCode = '';
  }
}
