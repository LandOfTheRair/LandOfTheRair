import { Action, Selector, State, StateContext, Store } from '@ngxs/store';

import { inject, Injectable } from '@angular/core';
import {
  Currency,
  IGame,
  IGroundItem,
  ISimpleItem,
  ItemClass,
} from '@lotr/interfaces';
import { applyPatch } from 'fast-json-patch';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import {
  HideBankWindow,
  HideLockerWindow,
  HideMarketWindow,
  HideTradeskillWindow,
  HideTrainerWindow,
  HideVendorWindow,
  Login,
  OpenBankWindow,
  OpenLockerWindow,
  OpenMarketWindow,
  OpenTradeskillWindow,
  OpenTrainerWindow,
  OpenVendorWindow,
  PatchGameStateForPlayer,
  PatchPlayer,
  PatchPlayerPosition,
  PlayerReady,
  PlayGame,
  QuitGame,
  SetCurrentItemTooltip,
  SetCurrentTarget,
  SetMap,
  SetPlayer,
  ShowWindow,
  UpdateGuildAuditLog,
  UpdateGuildInfo,
  UpdateParty,
  ViewCharacterEquipment,
} from './actions';

const setPlayerForDiscord = (player) =>
  ((window as any).discordGlobalCharacter = player);

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
    npcCanRevive: false,
    npcGuildTeleport: false,
  },
  vendorInfo: {
    npcUUID: '',
    npcName: '',
    npcSprite: 0,
    npcVendorCurrency: Currency.Gold,
    npcVendorItems: [],
    npcVendorDailyItems: [],
  },
  bankInfo: {
    npcUUID: '',
    npcName: '',
    npcSprite: 0,
    npcBank: '',
    npcBranch: '',
  },
  marketInfo: {
    npcUUID: '',
    npcName: '',
    npcSprite: 0,
  },
  mapInfo: {
    players: {},
    npcs: {},
    ground: {},
    openDoors: {},
  },
  lockerInfo: {
    lockerName: '',
    showLockers: [],
    playerLockers: {},
    accountLockers: {},
  },
  partyInfo: {
    party: null,
    partyMembers: null,
  },
  tradeskillInfo: {
    tradeskill: null,
  },
  guildInfo: {
    guild: null,
    auditLog: [],
  },
  inspectingCharacter: null,
});

@State<IGame>({
  name: 'game',
  defaults: defaultGame(),
})
@Injectable()
export class GameState {
  static box = new Subject<{
    side: 'left' | 'right';
    color: string;
    text: string;
  }>();

  @Selector()
  static player(state: IGame) {
    return state.player;
  }

  @Selector()
  static currentTarget(state: IGame) {
    return (
      state.mapInfo.players[state.currentTarget] ||
      state.mapInfo.npcs[state.currentTarget]
    );
  }

  @Selector()
  static itemTooltip(state: IGame) {
    return state.itemTooltip;
  }

  @Selector()
  static guild(state: IGame) {
    return state.guildInfo.guild;
  }

  @Selector()
  static guildAuditLog(state: IGame) {
    return state.guildInfo.auditLog;
  }

  @Selector()
  static allCharacters(state: IGame) {
    return [
      ...Object.values(state.mapInfo.players),
      ...Object.values(state.mapInfo.npcs),
    ];
  }

  @Selector()
  static currentGround(
    state: IGame,
  ): Partial<Record<ItemClass, IGroundItem[]>> {
    if (!state.player) return {};

    return state.mapInfo.ground[state.player.x]?.[state.player.y] ?? {};
  }

  @Selector()
  static currentPosition(state: IGame) {
    if (!state.player) {
      return { x: 0, y: 0 };
    }
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
  static currentMarketWindow(state: IGame) {
    return state.marketInfo;
  }

  @Selector()
  static currentLockerWindow(state: IGame) {
    return state.lockerInfo;
  }

  @Selector()
  static currentTradeskillWindow(state: IGame) {
    return state.tradeskillInfo;
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

  private store = inject(Store);

  @Action(Login)
  login(ctx: StateContext<IGame>, { info }: Login) {
    ctx.patchState({ currentHoliday: info.currentHoliday });
  }

  @Action(PlayGame)
  playGame(ctx: StateContext<IGame>) {
    const baseState = defaultGame();
    baseState.inGame = true;

    const state = ctx.getState();
    baseState.currentHoliday = state.currentHoliday;
    baseState.guildInfo = state.guildInfo;

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
  setCurrentTarget(
    ctx: StateContext<IGame>,
    { target, overrideIfOnly }: SetCurrentTarget,
  ) {
    const state = ctx.getState();

    // allow for us to not override the target if someone else dies
    if (!target && overrideIfOnly) {
      if (state.currentTarget === overrideIfOnly) {
        ctx.patchState({ currentTarget: null });
      }

      return;
    }

    ctx.patchState({ currentTarget: target });
  }

  @Action(SetCurrentItemTooltip)
  setItemTooltip(
    ctx: StateContext<IGame>,
    { tooltip, upgrades }: SetCurrentItemTooltip,
  ) {
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
      patches.forEach((patch, i) => {
        if (patch.path === '/hp/current') {
          const hpDiff = patch.value - copyState.player.hp.current;
          if (hpDiff === 0) return;
          GameState.box.next({
            side: 'right',
            color: hpDiff > 0 ? 'blue' : 'red',
            text: `${hpDiff > 0 ? '+' : ''}${hpDiff} HP`,
          });
        }

        if (patch.path === '/exp') {
          const xpDiff = patch.value - copyState.player.exp;
          if (xpDiff === 0) return;
          GameState.box.next({
            side: 'left',
            color: 'green',
            text: `${xpDiff > 0 ? '+' : ''}${xpDiff} XP`,
          });
        }

        if (patch.path === '/axp') {
          const xpDiff = patch.value - copyState.player.axp;
          if (xpDiff === 0) return;
          GameState.box.next({
            side: 'left',
            color: '#aa5c39',
            text: `${xpDiff > 0 ? '+' : ''}${xpDiff} AXP`,
          });
        }

        const blacklistedEffects = ['Swimming'];
        if (
          patch.op === 'add' &&
          patch.path.includes('/effects/_hash') &&
          patch.value.effectName &&
          !blacklistedEffects.includes(patch.value.effectName)
        ) {
          setTimeout(() => {
            GameState.box.next({
              side: 'left',
              color: 'blue',
              text: `+${
                patch.value.effectInfo.tooltipName ?? patch.value.effectName
              }`,
            });
          }, i * 250);
        }
      });

      try {
        copyState.player = applyPatch(
          cloneDeep(copyState.player),
          patches,
        ).newDocument;
      } catch {}
    }

    ctx.patchState(copyState);
  }

  @Action(PatchGameStateForPlayer)
  patchPlayerState(
    ctx: StateContext<IGame>,
    { statePatches }: PatchGameStateForPlayer,
  ) {
    const state = ctx.getState();
    const copyState = { ...state };

    // can't get patches if we're not in game
    if (!copyState.player || !statePatches) return;

    try {
      const newMapInfo = applyPatch(
        cloneDeep(copyState.mapInfo),
        statePatches,
      ).newDocument;

      ctx.patchState({
        mapInfo: newMapInfo,
      });
    } catch (e) {
      console.error({ statePatches });
      console.error('FAILED PATCHES', e);
    }
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
  openTrainerWindow(
    ctx: StateContext<IGame>,
    {
      npcUUID,
      npcName,
      npcSprite,
      npcMaxLevel,
      npcMaxSkill,
      npcCanRevive,
      npcGuildTeleport,
    }: OpenTrainerWindow,
  ) {
    ctx.patchState({
      trainerInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcMaxLevel,
        npcMaxSkill,
        npcCanRevive,
        npcGuildTeleport,
      },
    });

    this.store.dispatch(new ShowWindow('trainer'));
  }

  @Action(HideTrainerWindow)
  hideTrainerWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ trainerInfo: null });
  }

  @Action(OpenVendorWindow)
  openVendorWindow(
    ctx: StateContext<IGame>,
    {
      npcUUID,
      npcName,
      npcSprite,
      npcVendorCurrency,
      npcVendorDailyItems,
      npcVendorItems,
    }: OpenVendorWindow,
  ) {
    ctx.patchState({
      vendorInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcVendorCurrency,
        npcVendorItems: npcVendorItems as unknown as ISimpleItem[],
        npcVendorDailyItems: npcVendorDailyItems as unknown as ISimpleItem[],
      },
    });

    this.store.dispatch(new ShowWindow('vendor'));
  }

  @Action(HideVendorWindow)
  hideVendorWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ vendorInfo: null });
  }

  @Action(OpenBankWindow)
  openBankWindow(
    ctx: StateContext<IGame>,
    { npcUUID, npcName, npcSprite, npcBank, npcBranch }: OpenBankWindow,
  ) {
    ctx.patchState({
      bankInfo: {
        npcName,
        npcUUID,
        npcSprite,
        npcBank,
        npcBranch,
      },
    });

    this.store.dispatch(new ShowWindow('bank'));
  }

  @Action(HideBankWindow)
  hideBankWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ bankInfo: null });
  }

  @Action(OpenMarketWindow)
  openMarketWindow(
    ctx: StateContext<IGame>,
    { npcUUID, npcName, npcSprite }: OpenMarketWindow,
  ) {
    ctx.patchState({
      marketInfo: {
        npcName,
        npcUUID,
        npcSprite,
      },
    });

    this.store.dispatch(new ShowWindow('market'));
  }

  @Action(HideMarketWindow)
  hideMarketWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ marketInfo: null });
  }

  @Action(ViewCharacterEquipment)
  viewCharacterEquipment(
    ctx: StateContext<IGame>,
    { character }: ViewCharacterEquipment,
  ) {
    ctx.patchState({ inspectingCharacter: character });

    this.store.dispatch(new ShowWindow('equipmentViewTarget'));
  }

  @Action(OpenLockerWindow)
  openLockerWindow(
    ctx: StateContext<IGame>,
    {
      lockerName,
      showLockers,
      playerLockers,
      accountLockers,
    }: OpenLockerWindow,
  ) {
    ctx.patchState({
      lockerInfo: {
        lockerName,
        showLockers,
        playerLockers,
        accountLockers,
      },
    });

    this.store.dispatch(new ShowWindow('locker'));
  }

  @Action(HideLockerWindow)
  hideLockerWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ lockerInfo: null });
  }

  @Action(OpenTradeskillWindow)
  openTradeskillWindow(
    ctx: StateContext<IGame>,
    { tradeskill }: OpenTradeskillWindow,
  ) {
    ctx.patchState({
      tradeskillInfo: {
        tradeskill,
      },
    });

    this.store.dispatch(new ShowWindow('tradeskill'));
  }

  @Action(HideTradeskillWindow)
  hideTradeskillWindow(ctx: StateContext<IGame>) {
    ctx.patchState({ tradeskillInfo: null });
  }

  @Action(UpdateParty)
  updateParty(ctx: StateContext<IGame>, { party, partyMembers }: UpdateParty) {
    ctx.patchState({ partyInfo: { party, partyMembers } });
  }

  @Action(UpdateGuildInfo)
  updateGuildInfo(ctx: StateContext<IGame>, { guild }: UpdateGuildInfo) {
    const state = ctx.getState();
    ctx.patchState({ guildInfo: { ...state.guildInfo, guild } });
  }

  @Action(UpdateGuildAuditLog)
  updateGuildAuditLog(
    ctx: StateContext<IGame>,
    { auditLog }: UpdateGuildAuditLog,
  ) {
    const state = ctx.getState();
    ctx.patchState({ guildInfo: { ...state.guildInfo, auditLog } });
  }
}
