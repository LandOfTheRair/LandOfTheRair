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
import { ModalService } from '../services/modal.service';
import { APIService } from '../services/api.service';
import { AssetService } from '../services/asset.service';

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
  public isConnected = false;

  public errorMessage: string;

  public get canLogin() {
    return this.isConnected && this.newAccount.username && this.newAccount.password;
  }

  public get canRegister() {
    return this.isConnected && this.newAccount.username && this.newAccount.password && this.newAccount.email && this.agreedToTerms;
  }

  constructor(
    public announcementService: AnnouncementService,
    public gameService: GameService,
    public socketService: SocketService,
    public optionsService: OptionsService,
    public api: APIService,
    private assetService: AssetService,
    private modalService: ModalService,
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

    this.loadURLAccount();
    this.tryAutoconnect();

    this.socketService.wsConnected$.subscribe((is) => {
      this.isConnected = is;
      if (!is) return;

      this.tryAutoconnect();
    });
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks('Login');
  }

  private loadURLAccount() {
    if (!this.api.overrideAPIURL) return;
    const user = this.api.overrideAPIUser;

    if (!user.username || !user.password) return;

    this.store.dispatch(new AddAccount(user.username, user.password, true));
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
    this.api.setAPIError('');

    this.http.post(this.api.finalHTTPURL + '/auth/password-check', this.newAccount)
      .subscribe(() => {

        this.socketService.emit(GameServerEvent.Login, this.newAccount);
      }, (err) => {
        this.errorMessage = err?.error?.error ?? err?.message ?? 'Absolutely unknown error.';
        this.isActing = false;

        // swallow the API error in this case because we know the error
        this.api.setAPIError('');
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

    this.http.post(this.api.finalHTTPURL + '/auth/register-check', this.newAccount)
      .subscribe(() => {
        this.socketService.emit(GameServerEvent.Register, this.newAccount);
      }, (err) => {
        this.errorMessage = err?.error?.error ?? err?.message ?? 'Absolutely unknown error.';
        this.isActing = false;

        // swallow the API error in this case because we know the error
        this.api.setAPIError('');
      });

  }

  public forgotPW() {
    this.modalService.input(
      'Forgot Password',
      `Enter the email associated with your account and a temporary password will be mailed to it.
      Please be sure to check your spam folder if you did not recieve it, as it is usually sent right away.`
    )
    .subscribe(d => {
      if (!d) return;

      this.socketService.emit(GameServerEvent.ForgotPassword, { email: d });
    });
  }

  private setAccount(accountData: any) {
    this.isActing = false;
    this.store.dispatch(new AddAccount(this.newAccount.username, this.newAccount.password, this.newAccount.autologin));
    this.store.dispatch(new SetActiveWindow('lobby'));
    this.store.dispatch(new Login(accountData));
    if (this.optionsService.autoJoin) {
      this.lastCharSlot$.pipe(take(1)).subscribe(slot => {
        if (slot === -1 || !accountData?.account?.players?.[slot]) return;

        let hasLoaded = false;
        const interval = setInterval(() => {
          if (hasLoaded) return;
          if (!this.assetService.assetsLoaded) return;

          this.socketService.emit(GameServerEvent.PlayCharacter, { charSlot: slot });
          this.store.dispatch(new SetActiveWindow('map'));

          hasLoaded = true;
          clearInterval(interval);
        }, 1000);
      });
    }
  }

  private setErrorMessage(error: string) {
    this.isActing = false;
    this.errorMessage = error;
  }

}
