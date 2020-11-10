import { Component, OnDestroy, OnInit } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { GameServerEvent, GameServerResponse, IAccountSettings } from '../../interfaces';
import { AddAccount, Login, RemoveAccount, SetActiveWindow, SettingsState } from '../../stores';
import { AnnouncementService } from '../services/announcement.service';
import { GameService } from '../services/game.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @Select(SettingsState.wasKicked) public wasKicked$: Observable<boolean>;
  @Select(SettingsState.autologin) public autologin$: Observable<string>;

  public isActing: boolean;
  public isRegistering: boolean;
  public newAccount: IAccountSettings | any = { };
  public agreedToTerms: boolean;

  public errorMessage: string;

  public get canLogin() {
    return this.newAccount.username && this.newAccount.password;
  }

  public get canRegister() {
    return this.newAccount.username && this.newAccount.password && this.newAccount.email && this.agreedToTerms;
  }

  constructor(
    public announcementService: AnnouncementService,
    public gameService: GameService,
    public socketService: SocketService,
    private store: Store
  ) { }

  ngOnInit() {
    this.newAccount = { username: '', password: '', email: '', autologin: false };
    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.Error,
      (data) => this.setErrorMessage(data.error)
    );

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.Login,
      (data) => this.setAccount(data)
    );

    this.autologin$.pipe(take(1)).subscribe(acc => {
      if (!acc) return;

      this.newAccount = Object.assign({}, acc);
      this.login();
    });
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks(this.constructor.name);
  }

  public registerMode() {
    this.isRegistering = !this.isRegistering;
  }

  public login() {
    if (this.isActing) return;
    this.isActing = true;
    this.errorMessage = '';

    this.socketService.emit(GameServerEvent.Login, this.newAccount);
  }

  public addToLogin(account) {
    this.newAccount.username = account.username;
    this.newAccount.password = account.password;
  }

  public removeFromList(account) {
    this.store.dispatch(new RemoveAccount(account.username));
  }

  public register() {
    if (this.isActing) return;
    this.isActing = true;
    this.errorMessage = '';

    this.socketService.emit(GameServerEvent.Register, this.newAccount);
  }

  private setAccount(accountData: any) {
    this.isActing = false;

    this.store.dispatch(new AddAccount(this.newAccount.username, this.newAccount.password, this.newAccount.autologin));
    this.store.dispatch(new SetActiveWindow('lobby'));
    this.store.dispatch(new Login(accountData));
  }

  private setErrorMessage(error: string) {
    this.isActing = false;
    this.errorMessage = error;
  }

}
