import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { IAccount, ICharacterCreateInfo } from '../models';
import { Observable } from 'rxjs';
import { SettingsState, AccountState, LobbyState } from '../stores';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  @Select(AccountState.loggedIn) loggedIn$: Observable<boolean>;
  @Select(AccountState.account) account$: Observable<IAccount>;
  @Select(LobbyState.charCreateData) charCreateData$: Observable<ICharacterCreateInfo>;
  @Select(SettingsState.accounts) accounts$: Observable<IAccount[]>;
  @Select(SettingsState.charSlot) charSlot$: Observable<{ slot: number }>;

  constructor() { }
}
