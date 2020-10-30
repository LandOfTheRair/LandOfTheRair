import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GameAction, IGame, IPlayer } from '../interfaces';

import { Injectable } from '@angular/core';
import { applyPatch } from 'fast-json-patch';


export class PlayGame {
  static type = GameAction.GamePlay;
  constructor() {}
}

export class QuitGame {
  static type = GameAction.GameQuit;
  constructor() {}
}

export class SetMap {
  static type = GameAction.GameSetMap;
  constructor(public map: any) {}
}

export class SetPlayer {
  static type = GameAction.GameSetPlayer;
  constructor(public player: IPlayer) {}
}

export class PatchPlayer {
  static type = GameAction.GamePatchPlayer;
  constructor(public player: Partial<IPlayer>, public patches: any[]) {}
}

export class PatchGameStateForPlayer {
  static type = GameAction.GamePatchPlayerState;
  constructor(public statePatches: any[]) {}
}

const defaultGame: () => IGame = () => {
  return {
    inGame: false,
    player: null,
    map: null,
    npcs: {},
    players: {},
    ground: {}
  };
};

@State<IGame>({
  name: 'game',
  defaults: defaultGame()
})
@Injectable()
export class GameState {

  @Selector()
  static player(state: IGame) {
    return state.player;
  }

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

  @Action(SetMap)
  setMap(ctx: StateContext<IGame>, { map }: SetMap) {
    const state = ctx.getState();
    const copyState = { ...state };
    copyState.map = map;

    ctx.patchState(copyState);
  }

  @Action(SetPlayer)
  setPlayer(ctx: StateContext<IGame>, { player }: SetPlayer) {
    const state = ctx.getState();
    const copyState = { ...state };
    copyState.player = player;

    ctx.patchState(copyState);
  }

  @Action(PatchPlayer)
  patchPlayer(ctx: StateContext<IGame>, { player, patches }: PatchPlayer) {
    const state = ctx.getState();
    const copyState = { ...state };

    // can't get patches if we're not in game
    if (!copyState.player) return;

    if (player) {
      copyState.player = Object.assign({}, copyState.player, player);
    }

    if (patches) {
      copyState.player = applyPatch({ ...copyState.player }, patches).newDocument;
    }

    ctx.patchState(copyState);
  }

  @Action(PatchGameStateForPlayer)
  patchPlayerState(ctx: StateContext<IGame>, { statePatches }: PatchGameStateForPlayer) {
    const state = ctx.getState();
    const copyState = { ...state };

    // can't get patches if we're not in game
    if (!copyState.player || !statePatches) return;

    if (statePatches) {
      console.log(statePatches);
      // copyState.player = applyPatch({ ...copyState.player }, patches).newDocument;
    }

    ctx.patchState(copyState);
  }
}
