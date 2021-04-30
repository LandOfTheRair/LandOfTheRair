import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';
import { GameServerEvent, IAccount } from '../../../../interfaces';
import { AccountState } from '../../../../stores';
import { SocketService } from '../../../services/socket.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  @Select(AccountState.account) public account$: Observable<IAccount>;

  public accountSub: Subscription;
  public account: IAccount;
  public currentPassword: string;
  public newPassword: string;
  public newEmail: string;
  public verificationCode: string;

  public canRequestVerificationCode = true;

  public get canChangePassword() {
    return this.currentPassword && this.newPassword && this.newPassword.length > 10;
  }

  public get canChangeTag() {
    return !this.account.discordTag
        || (this.account.discordTag
        && this.account.discordTag.length === 18);
  }

  constructor(
    private socketService: SocketService,
    public dialogRef: MatDialogRef<AccountComponent>
  ) { }

  ngOnInit() {
    this.accountSub = this.account$.subscribe(acc => {
      console.log(acc);
      this.account = Object.assign({}, acc);
    });
  }

  ngOnDestroy() {
  }

  public changeTag() {
    this.socketService.emit(GameServerEvent.ChangeDiscordTag, { discordTag: this.account.discordTag });
  }

  public changeOnline() {
    this.socketService.emit(GameServerEvent.ChangeAlwaysOnline, { alwaysOnline: this.account.alwaysOnline });
  }

  public changeEvents() {
    this.socketService.emit(GameServerEvent.ChangeEventWatcher, { eventWatcher: this.account.eventWatcher });
  }

  public changePassword() {
    this.socketService.emit(GameServerEvent.ChangePassword, { oldPassword: this.currentPassword, newPassword: this.newPassword });
  }

  public changeEmail() {
    this.socketService.emit(GameServerEvent.ChangeEmail, { newEmail: this.newEmail });
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
    this.socketService.emit(GameServerEvent.SubmitVerification, { verificationCode: this.verificationCode });
    this.verificationCode = '';
  }

}
