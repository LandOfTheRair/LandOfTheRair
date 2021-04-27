import { Action, Selector, State, StateContext, Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { applyPatch } from 'fast-json-patch';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { Currency, IGame } from '../interfaces';
import { HideBankWindow, HideLockerWindow, HideTrainerWindow, HideVendorWindow, Login, OpenBankWindow, OpenLockerWindow, OpenTrainerWindow,
  OpenVendorWindow, PatchGameStateForPlayer, PatchPlayer, PatchPlayerPosition, PlayerReady, PlayGame,
  QuitGame, SetCurrentItemTooltip, SetCurrentTarget, SetMap, SetPlayer, ShowWindow, UpdateParty, ViewCharacterEquipment } from './actions';

const setPlayerForDiscord = player => (window as any).discordGlobalCharacter = player;

const defaultGame: () => IGame = () => ({
    inGame: false,
    currentTarget: '',
    itemTooltip: { tooltip: '', upgrades: [] },
    player: null,
    map: null,
    currentHoliday: null,
    trainerInfo: {
      npcUUID: '',
      npcName: '',
      npcSprite: 0,
      npcMaxSkill: 0,
      npcMaxLevel: 0,
      npcCanRevive: false
    },
    vendorInfo: {
      npcUUID: '',
      npcName: '',
      npcSprite: 0,
      npcVendorCurrency: Currency.Gold,
      npcVendorItems: [],
      npcVendorDailyItems: []
    },
    bankInfo: {
      npcUUID: '',
      npcName: '',
      npcSprite: 0,
      npcBank: '',
      npcBranch: ''
    },
    mapInfo: {
      players: {},
      npcs: {},
      ground: {},
      openDoors: {}
    },
    lockerInfo: {
      lockerName: '',
      showLockers: [],
      playerLockers: {},
      accountLockers: {}
    },
    partyInfo: {
      party: null,
      partyMembers: null
    },
    inspectingCharacter: null
  });

@State<IGame>({
  name: 'game',
  defaults: defaultGame()
})
@Injectable()
export class GameState {

  static box = new Subject<{ side: 'left'|'right'; color: string; text: string }>();

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
  static currentBankWindow(state: IGame) {
    return state.bankInfo;
  }

  @Selector()
  static currentLockerWindow(state: IGame) {
    return state.lockerInfo;
  }

  @Selector()
  static currentBGM(state: IGame) {
    if (!state.player) return '';
    if (state.player.combatTicks > 0) return 'combat';
    return state.player.bgmSetting || 'wilderness';
  }

  @Selector()
  static inspectingCharacter(state: IGame) {
    return state.inspectingCharacter;
  }

  @Selector()
  static currentHoliday(state: IGame) {
    return state.currentHoliday;
  }

  @Selector()
  static party(state: IGame) {
    return state.partyInfo;
  }

  constructor(private store: Store) {}

  @Action(Login)
  login(ctx: StateContext<IGame>, { info }: Login) {
    ctx.patchState({ currentHoliday: info.currentHoliday });
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
    ctx.patchState({ map });
  }

  @Action(SetPlayer)
  setPlayer(ctx: StateContext<IGame>, { player }: SetPlayer) {
    const state = ctx.getState();
    const hasPlayer = !!state.player;

    setPlayerForDiscord(player);

    ctx.patchState({ player });

    if (!hasPlayer) this.store.dispatch(new PlayerReady());
  }

  @Action(SetCurrentTarget)
  setCurrentTarget(ctx: StateContext<IGame>, { target }: SetCurrentTarget) {
    ctx.patchState({ currentTarget: target });
  }

  @Action(SetCurrentItemTooltip)
  setItemTooltip(ctx: StateContext<IGame>, { tooltip, upgrades }: SetCurrentItemTooltip) {
    ctx.patchState({ itemTooltip: { tooltip, upgrades } });
  }

  @Action(PatchPlayer)
  patchPlayer(ctx: StateContext<IGame>, { player, patches }: PatchPlayer) {
    const state = ctx.getState();
    const copyState = { ...state };

    // can't get patches if we're not in game
    if (!copyState.player) return;

    if (player) {
      copyState.player = Object.assign({}, copyState.player, player);
      setPlayerForDiscord(copyState.player);
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


        const blacklistedEffects = ['Swimming'];
        if (patch.op === 'add'
        && patch.path.includes('/effect')
        && patch.value.effectName
        && !blacklistedEffects.includes(patch.value.effectName)) {
          GameState.box.next({ side: 'left', color: 'blue', text: `+${patch.value.effectName}` });
        }
      });

      try {
        copyState.player = applyPatch(cloneDeep(copyState.player), patches).newDocument;
      } catch {}
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

  @Action(PatchPlayerPosition)
  patchPlayerPosition(ctx: StateContext<IGame>, { x, y }: PatchPlayerPosition) {
    const state = ctx.getState();
    const copyState = { ...state };

    if (!copyState.player) return;

    copyState.player = { ...copyState.player };
    copyState.player.x = x;
    copyState.player.y = y;

    setPlayerForDiscord(copyState.player);

    ctx.patchState({ player: copyState.player });
  }

  @Action(OpenTrainerWindow)
  openTrainerWindow(ctx: StateContext<IGame>, { npcUUID, npcName, npcSprite, npcMaxLevel, npcMaxSkill, npcCanRevive }: OpenTrainerWindow) {
    ctx.patchState({
      trainerInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcMaxLevel,
        npcMaxSkill,
        npcCanRevive
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

  @Action(OpenBankWindow)
  openBankWindow(ctx: StateContext<IGame>, {
    npcUUID, npcName, npcSprite, npcBank, npcBranch
  }: OpenBankWindow) {
    ctx.patchState({
      bankInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcBank,
        npcBranch
      }
    });

    this.store.dispatch(new ShowWindow('bank'));
  }

  @Action(HideBankWindow)
  hideBankWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ bankInfo: null });
  }

  @Action(ViewCharacterEquipment)
  viewCharacterEquipment(ctx: StateContext<IGame>, { character }: ViewCharacterEquipment) {
    ctx.patchState({ inspectingCharacter: character });

    this.store.dispatch(new ShowWindow('equipmentViewTarget'));
  }

  @Action(OpenLockerWindow)
  openLockerWindow(ctx: StateContext<IGame>, { lockerName, showLockers, playerLockers, accountLockers }: OpenLockerWindow) {
    ctx.patchState({
      lockerInfo: {
        lockerName,
        showLockers,
        playerLockers,
        accountLockers
      }
    });

    this.store.dispatch(new ShowWindow('locker'));
  }

  @Action(HideLockerWindow)
  hideLockerWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ lockerInfo: null });
  }

  @Action(UpdateParty)
  updateParty(ctx: StateContext<IGame>, { party, partyMembers }: UpdateParty) {
    ctx.patchState({ partyInfo: { party, partyMembers } });
  }
}
