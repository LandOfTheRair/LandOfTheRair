
import { Injectable } from '@angular/core';
import { ImmutableContext } from '@ngxs-labs/immer-adapter';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';

import { cloneDeep } from 'lodash';

import * as macros from '../assets/content/_output/macros.json';

import { BaseClass, IMacroBar, IMacroContainer } from '../interfaces';
import { CreateCustomMacro, DeleteCustomMacro, ImportMacros, LearnMacro,
  PlayerReady, SetActiveMacro, SetActiveMacroBars, SetDefaultMacros, SetMacroBars } from './actions';
import { GameState } from './game.state';


const defaultMacros: () => IMacroContainer = () => ({
    activeMacroBars: {},
    activeMacros: {},
    customMacros: {},
    learnedMacros: {},
    characterMacros: {}
  });

@State<IMacroContainer>({
  name: 'macros',
  defaults: defaultMacros()
})
@Injectable()
export class MacrosState {

  @Selector()
  static allMacros(state: IMacroContainer) {
    return Object.assign({}, state.customMacros, macros);
  }

  @Selector()
  static activeMacros(state: IMacroContainer) {
    return state.activeMacros;
  }

  @Selector()
  static customMacros(state: IMacroContainer) {
    return state.customMacros;
  }

  @Selector()
  static characterMacros(state: IMacroContainer) {
    return state.characterMacros;
  }

  @Selector()
  static learnedMacros(state: IMacroContainer) {
    return state.learnedMacros;
  }

  constructor(private store: Store) {}

  @Action(CreateCustomMacro)
  createCustomMacro(ctx: StateContext<IMacroContainer>, { macro }: CreateCustomMacro) {
    const state = ctx.getState();
    const curPlayer = this.store.selectSnapshot(GameState.player);

    macro.createdCharSlot = curPlayer.charSlot;

    const copyMacros = { ... state.customMacros };
    copyMacros[macro.name] = macro;

    ctx.patchState({ customMacros: copyMacros });
  }

  @Action(DeleteCustomMacro)
  deleteCustomMacro(ctx: StateContext<IMacroContainer>, { macro }: DeleteCustomMacro) {
    const state = ctx.getState();

    const copyMacros = { ... state.customMacros };
    delete copyMacros[macro.name];

    ctx.patchState({ customMacros: copyMacros });
  }

  @Action(SetActiveMacro)
  @ImmutableContext()
  setActiveMacro({ setState }: StateContext<IMacroContainer>, { macroName }: SetActiveMacro) {
    const curPlayer = this.store.selectSnapshot(GameState.player);

    setState((state: IMacroContainer) => {
      state.activeMacros ??= {};
      state.activeMacros[curPlayer.username] ??= {};
      state.activeMacros[curPlayer.username][curPlayer.charSlot] = macroName;

      return state;
    });
  }

  @Action(LearnMacro)
  @ImmutableContext()
  learnMacro({ setState }: StateContext<IMacroContainer>, { macro }: LearnMacro) {
    const curPlayer = this.store.selectSnapshot(GameState.player);

    setState((state: IMacroContainer) => {
      state.learnedMacros ??= {};
      state.learnedMacros[curPlayer.username] ??= {};
      state.learnedMacros[curPlayer.username][curPlayer.charSlot] ??= {};
      state.learnedMacros[curPlayer.username][curPlayer.charSlot][macro.name] = macro;

      return state;
    });
  }

  @Action(SetActiveMacroBars)
  @ImmutableContext()
  setActiveMacroBars({ setState }: StateContext<IMacroContainer>, { macroBarNames }: SetActiveMacroBars) {
    const curPlayer = this.store.selectSnapshot(GameState.player);

    setState((state: IMacroContainer) => {
      state.activeMacroBars ??= {};
      state.activeMacroBars[curPlayer.username] ??= {};
      state.activeMacroBars[curPlayer.username][curPlayer.charSlot] = macroBarNames;

      return state;
    });
  }

  @Action(SetMacroBars)
  @ImmutableContext()
  setMacroBars({ setState }: StateContext<IMacroContainer>, { macroBars }: SetMacroBars) {
    const curPlayer = this.store.selectSnapshot(GameState.player);

    setState((state: IMacroContainer) => {
      state.characterMacros ??= {};
      state.characterMacros[curPlayer.username] ??= {};
      state.characterMacros[curPlayer.username][curPlayer.charSlot] = {};

      macroBars.forEach(bar => state.characterMacros[curPlayer.username][curPlayer.charSlot][bar.name] = bar);

      return state;
    });
  }

  @Action(ImportMacros)
  @ImmutableContext()
  importMacros({ setState }: StateContext<IMacroContainer>, { macroBars, macros: importCustomMacros }: ImportMacros) {
    const curPlayer = this.store.selectSnapshot(GameState.player);

    setState((state: IMacroContainer) => {
      Object.assign(state.customMacros, importCustomMacros);

      state.characterMacros ??= {};
      state.characterMacros[curPlayer.username] ??= {};
      state.characterMacros[curPlayer.username][curPlayer.charSlot] = {};

      macroBars.forEach(bar => state.characterMacros[curPlayer.username][curPlayer.charSlot][bar.name] = bar);

      return state;
    });
  }

  @Action(PlayerReady)
  playGame(ctx: StateContext<IMacroContainer>) {
    const state = ctx.getState();

    const curPlayer = this.store.selectSnapshot(GameState.player);
    if (curPlayer) {

      // if we have no macros, make the default setup
      const macroBars = state.characterMacros?.[curPlayer.username]?.[curPlayer.charSlot];
      if (Object.keys(macroBars || {}).length === 0 || !macroBars.default) {

        const additionalMacros: Record<BaseClass, string[]> = {
          [BaseClass.Thief]: ['Hide', 'Steal'],
          [BaseClass.Mage]: ['MagicMissile'],
          [BaseClass.Healer]: ['Afflict'],
          [BaseClass.Warrior]: ['Cleave'],
          [BaseClass.Traveller]: []
        };

        const learns = additionalMacros[curPlayer.baseClass] || [];

        const learnedSpells = learns.map(spell => {
          const baseObj = cloneDeep(Object.values(macros).find(macro => macro.name === spell));
          if (!baseObj || baseObj.isDefault) return null;

          baseObj.isDefault = true;
          return baseObj;
        }).filter(Boolean);

        this.store.dispatch(new SetDefaultMacros(learnedSpells.map(x => x.name)));

        learnedSpells.forEach(spell => {
          this.store.dispatch(new LearnMacro(spell));
        });
      }
    }
  }

  @Action(SetDefaultMacros)
  setDefaultMacros(ctx: StateContext<IMacroContainer>, { additionalMacros }: SetDefaultMacros) {
    const defaultMacroBar: IMacroBar = {
      macros: ['Attack', 'Search', 'Drink', 'Stairs', 'Climb', 'Restore'],
      name: 'default'
    };

    defaultMacroBar.macros.push(...additionalMacros);

    this.store.dispatch(new SetMacroBars([defaultMacroBar]))
      .subscribe(() => {
        this.store.dispatch(new SetActiveMacroBars(['default']))
        .subscribe(() => {
          this.store.dispatch(new SetActiveMacro('Attack'));
        });
      });
  }

}
