import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { GameServerEvent, GameServerResponse, IAccountSettings } from '../../interfaces';
import { AddAccount, Login, RemoveAccount, SetActiveWindow, SettingsState } from '../../stores';
import { AnnouncementService } from '../services/announcement.service';
import { OptionsService } from '../services/options.service';
import { GameService } from '../services/game.service';
import { SocketService } from '../services/socket.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @Select(SettingsState.wasKicked) public wasKicked$: Observable<boolean>;
  @Select(SettingsState.autologin) public autologin$: Observable<string>;
  @Select(SettingsState.lastCharSlot) public lastCharSlot$: Observable<number>;

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
    public optionsService: OptionsService,
    private store: Store,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.newAccount = { username: '', password: '', email: '', autologin: false };
    this.socketService.registerComponentCallback(
      'Login', GameServerResponse.Error,
      (data) => this.setErrorMessage(data.error)
    );

    this.socketService.registerComponentCallback(
      'Login', GameServerResponse.Login,
      (data) => this.setAccount(data)
    );

    this.tryAutoconnect();

    this.socketService.wsConnected$.subscribe((is) => {
      if (!is) return;

      this.tryAutoconnect();
    });
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks('Login');
  }

  private tryAutoconnect() {
    this.autologin$.pipe(take(1)).subscribe(acc => {
      if (!acc) return;

      this.newAccount = Object.assign({}, acc);
      this.login();
    });
  }

  public registerMode() {
    this.isRegistering = !this.isRegistering;
  }

  public login() {
    if (this.isActing) return;
    this.isActing = true;
    this.errorMessage = '';

    console.log('login try');

    this.http.post(environment.server.http + '/auth/password-check', this.newAccount)
      .subscribe(() => {

        this.socketService.emit(GameServerEvent.Login, this.newAccount);
      }, (err) => {
        this.errorMessage = err.error.error;
        this.isActing = false;
      });
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
    if (this.optionsService.autoJoin) {
      this.lastCharSlot$.pipe(take(1)).subscribe(slot => {
        if (slot === -1 || !accountData?.account?.players?.[slot]) return;

        setTimeout(() => {
          this.socketService.emit(GameServerEvent.PlayCharacter, { charSlot: slot });
          this.store.dispatch(new SetActiveWindow('map'));
        }, 0);
      });
    }
  }

  private setErrorMessage(error: string) {
    this.isActing = false;
    this.errorMessage = error;
  }

}
