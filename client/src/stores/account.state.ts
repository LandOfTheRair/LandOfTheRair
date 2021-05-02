
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { IAccount, SilverPurchase, SubscriptionTier } from '../interfaces';
import { Login, Logout, SetCharacterSlotInformation, SetAccount } from './actions';

const defaultAccount: () => IAccount = () => ({
    username: '',
    email: '',
    originalEmail: '',
    players: [],

    emailVerified: false,
    isGameMaster: false,
    isTester: false,

    isMuted: false,
    isBanned: false,
    inGame: false,

    discordTag: '',
    alwaysOnline: false,
    eventWatcher: false,

    premium: {
      subscriptionTier: SubscriptionTier.None,
      hasDoneTrial: false,
      silver: 0,
      silverPurchases: {},
      subscriptionEnds: -1
    }
  });

@State<IAccount>({
  name: 'account',
  defaults: defaultAccount()
})
@Injectable()
export class AccountState {

  @Selector()
  static account(state: IAccount) {
    return state;
  }

  @Selector()
  static loggedIn(state: IAccount) {
    return !!state.username;
  }

  @Action(Login)
  login(ctx: StateContext<IAccount>, { info }: Login) {
    window.document.title = `[${info.account.username}] Land of the Rair`;

    const maxPlayers = 4 + (info.account?.premium.silverPurchases?.[SilverPurchase.MoreCharacters] ?? 0);
    if (!info.account.players) info.account.players = [];
    if (info.account.players.length < maxPlayers) info.account.players.length = maxPlayers;

    ctx.setState(Object.assign({}, ctx.getState(), info.account));
  }

  @Action(SetAccount)
  setAccount(ctx: StateContext<IAccount>, { account }: SetAccount) {

    const maxPlayers = 4 + (account?.premium.silverPurchases?.[SilverPurchase.MoreCharacters] ?? 0);

    const state = { ...ctx.getState() };

    state.email = account.email;
    state.emailVerified = account.emailVerified;

    const players = [...state.players];
    if (players.length < maxPlayers) players.length = maxPlayers;

    const premium = { ...state.premium };
    Object.assign(premium, account.premium);

    const perks = { ...premium.silverPurchases };
    Object.assign(perks, account.premium.silverPurchases);

    ctx.setState({ ...state, players, premium: { ...premium, silverPurchases: { ...perks } } });
  }

  @Action(Logout)
  logout(ctx: StateContext<IAccount>, { }: Logout) {
    window.document.title = 'Land of the Rair';
    ctx.setState(defaultAccount());
  }

  @Action(SetCharacterSlotInformation)
  setCharacter(ctx: StateContext<IAccount>, { characterInfo, slot }: SetCharacterSlotInformation) {
    const state = ctx.getState();

    const players = [...state.players];
    players[slot] = characterInfo;

    if (players.length < 4) players.length = 4;

    ctx.patchState({ players });
  }

}
