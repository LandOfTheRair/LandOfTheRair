import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Currency, IGame } from '../interfaces';

import { Injectable } from '@angular/core';
import { applyPatch } from 'fast-json-patch';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { HideTrainerWindow, HideVendorWindow, OpenTrainerWindow,
  OpenVendorWindow, PatchGameStateForPlayer, PatchPlayer, PlayerReady, PlayGame,
  QuitGame, SetCurrentItemTooltip, SetCurrentTarget, SetMap, SetPlayer, ShowWindow } from './actions';

const defaultGame: () => IGame = () => {
  return {
    inGame: false,
    currentTarget: '',
    itemTooltip: '',
    player: null,
    map: null,
    trainerInfo: {
      npcUUID: '',
      npcName: '',
      npcSprite: 0,
      npcMaxSkill: 0,
      npcMaxLevel: 0
    },
    vendorInfo: {
      npcUUID: '',
      npcName: '',
      npcSprite: 0,
      npcVendorCurrency: Currency.Gold,
      npcVendorItems: [],
      npcVendorDailyItems: []
    },
    mapInfo: {
      players: {},
      npcs: {},
      ground: {},
      openDoors: {}
    }
  };
};

@State<IGame>({
  name: 'game',
  defaults: defaultGame()
})
@Injectable()
export class GameState {

  static box = new Subject<{ side: 'left'|'right', color: string, text: string }>();

  @Selector()
  static player(state: IGame) {
    return state.player;
  }

  @Selector()
  static currentTarget(state: IGame) {
    return state.mapInfo.players[state.currentTarget] || state.mapInfo.npcs[state.currentTarget];
  }

  @Selector()
  static itemTooltip(state: IGame) {
    return state.itemTooltip;
  }

  @Selector()
  static allCharacters(state: IGame) {
    return [
      ...Object.values(state.mapInfo.players),
      ...Object.values(state.mapInfo.npcs)
    ];
  }

  @Selector()
  static currentGround(state: IGame) {
    return state.mapInfo.ground[state.player.x][state.player.y];
  }

  @Selector()
  static currentPosition(state: IGame) {
    return { x: state.player.x, y: state.player.y };
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
    return state.mapInfo.npcs;
  }

  @Selector()
  static players(state: IGame) {
    return state.mapInfo.players;
  }

  @Selector()
  static openDoors(state: IGame) {
    return state.mapInfo.openDoors;
  }

  @Selector()
  static ground(state: IGame) {
    return state.mapInfo.ground;
  }

  @Selector()
  static currentTrainerWindow(state: IGame) {
    return state.trainerInfo;
  }

  @Selector()
  static currentVendorWindow(state: IGame) {
    return state.vendorInfo;
  }

  @Selector()
  static currentBGM(state: IGame) {
    if (!state.player) return '';
    if (state.player.combatTicks > 0) return 'combat';
    return state.player.bgmSetting || 'wilderness';
  }

  constructor(private store: Store) {}

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
    ctx.patchState({ map });
  }

  @Action(SetPlayer)
  setPlayer(ctx: StateContext<IGame>, { player }: SetPlayer) {
    const state = ctx.getState();
    const hasPlayer = !!state.player;

    ctx.patchState({ player });

    if (!hasPlayer) this.store.dispatch(new PlayerReady());
  }

  @Action(SetCurrentTarget)
  setCurrentTarget(ctx: StateContext<IGame>, { target }: SetCurrentTarget) {
    ctx.patchState({ currentTarget: target });
  }

  @Action(SetCurrentItemTooltip)
  setItemTooltip(ctx: StateContext<IGame>, { tooltip }: SetCurrentItemTooltip) {
    ctx.patchState({ itemTooltip: tooltip });
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
      patches.forEach(patch => {
        if (patch.path === '/hp/current') {
          const hpDiff = patch.value - copyState.player.hp.current;
          if (hpDiff === 0) return;
          GameState.box.next({ side: 'right', color: hpDiff > 0 ? 'blue' : 'red', text: `${hpDiff > 0 ? '+' : ''}${hpDiff} HP` });
        }

        if (patch.path === '/exp') {
          const xpDiff = patch.value - copyState.player.exp;
          if (xpDiff === 0) return;
          GameState.box.next({ side: 'left', color: 'green', text: `${xpDiff > 0 ? '+' : ''}${xpDiff} XP` });
        }

        if (patch.path === '/axp') {
          const xpDiff = patch.value - copyState.player.axp;
          if (xpDiff === 0) return;
          GameState.box.next({ side: 'left', color: 'yellow', text: `${xpDiff > 0 ? '+' : ''}${xpDiff} AXP` });
        }


        if (patch.op === 'add' && patch.path.includes('/effect') && patch.value.effectName) {
          GameState.box.next({ side: 'left', color: 'blue', text: `+${patch.value.effectName}` });
        }
      });

      copyState.player = applyPatch(cloneDeep(copyState.player), patches).newDocument;
    }

    ctx.patchState(copyState);
  }

  @Action(PatchGameStateForPlayer)
  patchPlayerState(ctx: StateContext<IGame>, { statePatches }: PatchGameStateForPlayer) {
    const state = ctx.getState();
    const copyState = { ...state };

    // can't get patches if we're not in game
    if (!copyState.player || !statePatches) return;

    ctx.patchState({ mapInfo: applyPatch(cloneDeep(copyState.mapInfo), statePatches).newDocument });
  }

  @Action(OpenTrainerWindow)
  openTrainerWindow(ctx: StateContext<IGame>, { npcUUID, npcName, npcSprite, npcMaxLevel, npcMaxSkill }: OpenTrainerWindow) {
    ctx.patchState({
      trainerInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcMaxLevel,
        npcMaxSkill
      }
    });

    this.store.dispatch(new ShowWindow('trainer'));
  }

  @Action(HideTrainerWindow)
  hideTrainerWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ trainerInfo: null });
  }

  @Action(OpenVendorWindow)
  openVendorWindow(ctx: StateContext<IGame>, {
    npcUUID, npcName, npcSprite, npcVendorCurrency, npcVendorDailyItems, npcVendorItems
  }: OpenVendorWindow) {
    ctx.patchState({
      vendorInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcVendorCurrency,
        npcVendorItems,
        npcVendorDailyItems
      }
    });

    this.store.dispatch(new ShowWindow('vendor'));
  }

  @Action(HideVendorWindow)
  hideVendorWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ vendorInfo: null });
  }
}
