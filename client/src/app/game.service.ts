import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { IAccount, ICharacterCreateInfo } from '../models';
import { AccountState, GameState, LobbyState, SettingsState } from '../stores';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private playGame: Subject<boolean> = new Subject();
  public get playGame$() {
    return this.playGame.asObservable();
  }

  private quitGame: Subject<void> = new Subject();
  public get quitGame$() {
    return this.quitGame.asObservable();
  }

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  @Select(GameState.map) currentMap$: Observable<any>;
  @Select(AccountState.loggedIn) loggedIn$: Observable<boolean>;
  @Select(AccountState.account) account$: Observable<IAccount>;
  @Select(LobbyState.charCreateData) charCreateData$: Observable<ICharacterCreateInfo>;
  @Select(SettingsState.accounts) accounts$: Observable<IAccount[]>;
  @Select(SettingsState.charSlot) charSlot$: Observable<{ slot: number }>;

  init() {
    this.inGame$.subscribe(val => {
      if (val) {
        this.playGame.next(true);
        return;
      }

      this.playGame.next(false);
      this.quitGame.next();
    });
  }
}
