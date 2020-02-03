import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { ChatMode, IAccount, ICharacterCreateInfo, IMapData, IPlayer } from '../models';
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
  @Select(GameState.player) currentPlayer$: Observable<IPlayer>;
  @Select(GameState.map) currentMap$: Observable<IMapData>;

  @Select(AccountState.loggedIn) loggedIn$: Observable<boolean>;
  @Select(AccountState.account) account$: Observable<IAccount>;

  @Select(LobbyState.charCreateData) charCreateData$: Observable<ICharacterCreateInfo>;

  @Select(SettingsState.accounts) accounts$: Observable<IAccount[]>;
  @Select(SettingsState.charSlot) charSlot$: Observable<{ slot: number }>;
  @Select(SettingsState.chatMode) chatMode$: Observable<ChatMode>;
  @Select(SettingsState.currentCommand) currentCommand$: Observable<string>;
  @Select(SettingsState.currentLogMode) logMode$: Observable<string>;

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
