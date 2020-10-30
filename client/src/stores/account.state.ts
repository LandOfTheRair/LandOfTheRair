
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GameAction, IAccount, ICharacter, IChatUser } from '../interfaces';

export class Login {
  static type = GameAction.Login;
  constructor(public info: { motd: string, onlineUsers: IChatUser[], account: IAccount }) {}
}

export class Logout {
  static type = GameAction.Logout;
  constructor(public manualDisconnect?: boolean, public kick?: boolean) {}
}

export class SetCharacterSlotInformation {
  static type = GameAction.SetCharacterSlotInformation;
  constructor(public characterInfo: ICharacter, public slot: number) {}
}

const defaultAccount: () => IAccount = () => {
  return {
    username: '',
    email: '',
    players: [],

    isGameMaster: false,
    isTester: false,
    isSubscribed: false,

    subscriptionEndsTimestamp: -1,
    trialEndsTimestamp: -1
  };
};

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

    info.account.players = info.account.players.reduce((prev, cur) => {
      prev[cur.charSlot] = cur;
      return prev;
    }, []);

    if (info.account.players.length < 4) info.account.players.length = 4;

    ctx.setState(Object.assign({}, ctx.getState(), info.account));
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

    ctx.patchState({ players });
  }

}
