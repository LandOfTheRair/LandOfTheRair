import { Action, Selector, State, StateContext } from '@ngxs/store';

import { GameAction, IGame } from '../models';

export class PlayGame {
  static type = GameAction.GamePlay;
  constructor() {}
}

export class QuitGame {
  static type = GameAction.GameQuit;
  constructor() {}
}

const defaultGame: () => IGame = () => {
  return {
    inGame: false,
    map: {},
    npcs: []
  };
};

@State<IGame>({
  name: 'game',
  defaults: defaultGame()
})
export class GameState {

  @Selector()
  static inGame(state: IGame) {
    return state.inGame;
  }

  @Selector()
  static map(state: IGame) {
    return state.map;
  }

  @Selector()
  static npcs(state: IGame) {
    return state.npcs;
  }

  @Action(PlayGame)
  playGame(ctx: StateContext<IGame>) {
    const baseState = defaultGame();
    baseState.inGame = true;

    ctx.patchState(baseState);
  }

  @Action(QuitGame)
  quitGame(ctx: StateContext<IGame>) {
    const baseState = defaultGame();

    ctx.patchState(baseState);
  }
}
