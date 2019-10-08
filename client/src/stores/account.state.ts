
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IAccount, ICharacter, IChatUser } from '../models';

export class Login {
  static type = '[Account] Log in';
  constructor(public info: { email: string, motd: string, onlineUsers: IChatUser[], players: ICharacter[], username: string }) {}
}

export class Logout {
  static type = '[Account] Log out';
  constructor(public manualDisconnect?: boolean) {}
}

export class SetCharacterSlotInformation {
  static type = '[Account] Set Charslot Info';
  constructor(public characterInfo: ICharacter, public slot: number) {}
}

const defaultAccount: () => IAccount = () => {
  return {
    username: '',
    email: '',
    players: []
  };
};

@State<IAccount>({
  name: 'account',
  defaults: defaultAccount()
})
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
    window.document.title = `[${info.username}] Land of the Rair`;
    if (info.players.length < 4) info.players.length = 4;

    ctx.setState(Object.assign({}, ctx.getState(), { email: info.email, players: info.players, username: info.username }));
  }

  @Action(Logout)
  logout(ctx: StateContext<IAccount>, { }: Logout) {
    window.document.title = 'Land of the Rair';
    ctx.setState(defaultAccount());
  }

  @Action(SetCharacterSlotInformation)
  setCharacter(ctx: StateContext<IAccount>, { characterInfo, slot }: SetCharacterSlotInformation) {
    const state = ctx.getState();

    const players = state.players;
    players[slot] = characterInfo;

    ctx.patchState({ players });
  }

}
