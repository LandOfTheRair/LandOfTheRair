
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GameAction, ICharacterCreateInfo, IChatUser, ILobbyContainer, SubscriptionTier } from '../models';
import { Login } from './account.state';

export class AddMessage {
  static type = GameAction.ChatAddMessage;
  constructor(public from: string, public message: string, public timestamp: number) {}
}

export class SetMOTD {
  static type = GameAction.ChatSetMOTD;
  constructor(public motd: string) {}
}

export class SetUsers {
  static type = GameAction.ChatSetUserList;
  constructor(public users: IChatUser[]) {}
}

export class AddUser {
  static type = GameAction.ChatAddUser;
  constructor(public user: IChatUser) {}
}

export class RemoveUser {
  static type = GameAction.ChatRemoveUser;
  constructor(public username: string) {}
}

export class SetCharacterCreateInformation {
  static type = GameAction.SetCharacterCreateInformation;
  constructor(public charCreateInfo: ICharacterCreateInfo) {}
}

@State<ILobbyContainer>({
  name: 'chat',
  defaults: {
    messages: [],
    users: [],
    motd: '',
    charCreate: {
      allegiances: [],
      baseStats: [],
      classes: []
    }
  }
})
export class LobbyState {

  @Selector()
  static charCreateData(state: ILobbyContainer) {
    return state.charCreate;
  }

  @Selector()
  static motd(state: ILobbyContainer) {
    return state.motd;
  }

  @Selector()
  static users(state: ILobbyContainer) {
    return state.users;
  }

  @Selector()
  static messages(state: ILobbyContainer) {
    return state.messages;
  }

  private sortUsers(users: IChatUser[]): IChatUser[] {
    return users.sort((user1, user2) => {
      if (user1!.tier > user2!.tier) return -1;
      if (user1!.tier < user2!.tier) return 1;

      if (user1.username > user2.username) return 1;
      if (user1.username < user2.username) return -1;

      return 0;
    });
  }

  private formatUser(user: IChatUser): IChatUser {
    if (user.isSubscribed) user.tier = SubscriptionTier.Normal;
    if (user.isTester) user.tier = SubscriptionTier.Tester;
    if (user.isGameMaster) user.tier = SubscriptionTier.GM;

    return user;
  }

  @Action(AddMessage)
  addMessage(ctx: StateContext<ILobbyContainer>, { from, message, timestamp }: AddMessage) {
    const state = ctx.getState();

    const messages = [...state.messages, { from, message, timestamp }];
    while (messages.length > 300) messages.shift();

    ctx.patchState({ messages });
  }

  @Action(SetMOTD)
  setMOTD(ctx: StateContext<ILobbyContainer>, { motd }: SetMOTD) {
    ctx.patchState({ motd });
  }

  @Action(SetUsers)
  setUsers(ctx: StateContext<ILobbyContainer>, { users }: SetUsers) {
    ctx.patchState({ users: this.sortUsers(users.map(x => this.formatUser(x))) });
  }

  @Action(AddUser)
  addUser(ctx: StateContext<ILobbyContainer>, { user }: AddUser) {
    const state = ctx.getState();

    ctx.patchState({ users: this.sortUsers([this.formatUser(user), ...state.users]) });
  }

  @Action(RemoveUser)
  removeUser(ctx: StateContext<ILobbyContainer>, { username }: RemoveUser) {
    const state = ctx.getState();

    ctx.patchState({ users: this.sortUsers(state.users.filter(x => x.username !== username)) });
  }

  @Action(Login)
  login(ctx: StateContext<ILobbyContainer>, { info }: Login) {
    this.setUsers(ctx, { users: info.onlineUsers });
    this.setMOTD(ctx, { motd: info.motd });
  }

  @Action(SetCharacterCreateInformation)
  setCharCreateInformation(ctx: StateContext<ILobbyContainer>, { charCreateInfo }: SetCharacterCreateInformation) {
    ctx.patchState({ charCreate:  charCreateInfo });
  }

}
