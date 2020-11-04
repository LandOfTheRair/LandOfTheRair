
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { GameAction, IMacro, IMacroBar, IMacroContainer } from '../interfaces';
import { GameState } from './game.state';

export class CreateCustomMacro {
  static type = GameAction.CreateCustomMacro;
  constructor(public macro: IMacro) {}
}

export class DeleteCustomMacro {
  static type = GameAction.DeleteCustomMacro;
  constructor(public macro: IMacro) {}
}

export class SetMacroBars {
  static type = GameAction.SetMacroBar;
  constructor(public macroBars: IMacroBar[]) {}
}

const defaultMacros: () => IMacroContainer = () => {
  return {
    customMacros: {},
    characterMacros: {}
  };
};

@State<IMacroContainer>({
  name: 'macros',
  defaults: defaultMacros()
})
@Injectable()
export class MacrosState {

  @Selector()
  static customMacros(state: IMacroContainer) {
    return state.customMacros;
  }

  @Selector()
  static characterMacros(state: IMacroContainer) {
    return state.characterMacros;
  }

  constructor(private store: Store) {}

  @Action(CreateCustomMacro)
  createCustomMacro(ctx: StateContext<IMacroContainer>, { macro }: CreateCustomMacro) {
    const state = ctx.getState();

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

  @Action(SetMacroBars)
  setMacroBars(ctx: StateContext<IMacroContainer>, { macroBars }: SetMacroBars) {
    const state = ctx.getState();

    const curPlayer = this.store.selectSnapshot(GameState.player);

    const characterMacros = { ...state.characterMacros };
    const accountMacros = [...characterMacros[curPlayer.username]];
    accountMacros[curPlayer.charSlot] = macroBars;

    ctx.patchState({ characterMacros });
  }

}
