
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IChatUser, ILobbyContainer, SubscriptionTier } from '../interfaces';
import { AccountEnterGame, AccountLeaveGame, AddMessage, AddUser,
  Login, RemoveUser, SetCharacterCreateInformation, SetMOTD, SetUsers } from './actions';

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
@Injectable()
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
      if (user1?.tier > user2?.tier) return -1;
      if (user1?.tier < user2?.tier) return 1;

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
  addMessage(ctx: StateContext<ILobbyContainer>, { from, message, timestamp, source }: AddMessage) {
    const state = ctx.getState();

    const messages = [...state.messages, { from, message, timestamp, source }];
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

    const users = [...state.users];
    const firstInst = users.findIndex(x => x.username === username);
    users.splice(firstInst, 1);

    ctx.patchState({ users: this.sortUsers(users) });
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

  @Action(AccountEnterGame)
  accountEnterGame(ctx: StateContext<ILobbyContainer>, { username }: AccountEnterGame) {
    const state = ctx.getState();

    const users = [...state.users];
    const userIndex = users.findIndex(x => x.username === username);
    const user = { ...users[userIndex] };
    user.inGame = true;
    users[userIndex] = user;

    ctx.patchState({ users });
  }

  @Action(AccountLeaveGame)
  accountLeaveGame(ctx: StateContext<ILobbyContainer>, { username }: AccountLeaveGame) {
    const state = ctx.getState();

    const users = [...state.users];
    const userIndex = users.findIndex(x => x.username === username);
    const user = { ...users[userIndex] };
    user.inGame = false;
    users[userIndex] = user;

    ctx.patchState({ users });
  }

}
