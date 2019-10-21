import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IAccount, ICharacterCreateInfo } from '../models';
import { AccountState, LobbyState, SettingsState, GameState } from '../stores';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  @Select(GameState.inGame) inGame$: Observable<boolean>;
  @Select(AccountState.loggedIn) loggedIn$: Observable<boolean>;
  @Select(AccountState.account) account$: Observable<IAccount>;
  @Select(LobbyState.charCreateData) charCreateData$: Observable<ICharacterCreateInfo>;
  @Select(SettingsState.accounts) accounts$: Observable<IAccount[]>;
  @Select(SettingsState.charSlot) charSlot$: Observable<{ slot: number }>;
}
