import { effect, inject, Injectable } from '@angular/core';
import { select, Selector, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';

import * as allMacros from '../../assets/content/_output/macros.json';
import { ICharacter, IGame, IMacro, IMacroContainer } from '../../interfaces';
import {
  GameState,
  LearnMacro,
  MacrosState,
  SetActiveMacro,
  SetCurrentCommand,
  SettingsState,
} from '../../stores';
import { GameService } from './game.service';

import { hostilityLevelFor } from 'client/src/app/_shared/helpers';
import { ModalService } from './modal.service';
import { OptionsService } from './options.service';
@Injectable({
  providedIn: 'root',
})
export class MacrosService {
  private charSlot = select(SettingsState.charSlot);
  private player = select(GameState.player);
  private inGame = select(GameState.inGame);
  private currentTarget = select(GameState.currentTarget);
  private activeWindow = select(SettingsState.activeWindow);
  private customMacros = select(MacrosState.customMacros);
  private activeMacros = select(MacrosService.currentPlayerActiveMacro);
  private currentMacros = select(MacrosService.currentPlayerMacros);

  private macroMap: Record<string, IMacro> = {};

  private macroIgnoreWindows = {
    lobby: true,
    bank: true,
    shop: true,
    marketboard: true,
    party: true,
    commandLine: true,
    journal: true,
  };

  private get allMacrosHash(): Record<string, IMacro> {
    return (allMacros as any).default || allMacros;
  }

  @Selector([GameState, MacrosState])
  static currentPlayerMacros(gameState: IGame, macroState: IMacroContainer) {
    const player = gameState.player;
    if (!player) return null;

    return {
      activeMacro:
        macroState.activeMacros?.[player.username]?.[player.charSlot],
      activeMacroBars:
        macroState.activeMacroBars?.[player.username]?.[player.charSlot],
      learnedMacros:
        macroState.learnedMacros?.[player.username]?.[player.charSlot] ?? {},
      macroBars:
        macroState.characterMacros?.[player.username]?.[player.charSlot],
    };
  }

  @Selector([GameState, MacrosState, MacrosState.allMacros])
  static currentPlayerActiveMacro(
    gameState: IGame,
    macroState: IMacroContainer,
    allPossibleMacros,
  ) {
    const player = gameState.player;
    if (!player) return null;

    return allPossibleMacros[
      macroState.activeMacros?.[player.username]?.[player.charSlot]
    ];
  }

  private store = inject(Store);
  private modalService = inject(ModalService);
  private optionsService = inject(OptionsService);
  private gameService = inject(GameService);

  constructor() {
    effect(() => {
      const macros = this.customMacros();
      const charSlot = this.charSlot();

      this.parseMacroMap(macros, charSlot.slot);
    });

    effect(
      () => {
        const player = this.player();
        const currentMacros = this.currentMacros();

        this.watchForNewMacroAlerts(player, currentMacros);
      },
      { allowSignalWrites: true },
    );
  }

  public init() {
    this.watchForMacros();
    this.autoAttackLoop();
  }

  public getMacroMatching(key: string): IMacro {
    if (!key) return null;
    return this.macroMap[key.toUpperCase()];
  }

  public buildMacroString(macro: IMacro): string {
    if (!macro.key) return '';
    const modifiers: any = macro.modifiers || {};

    let macroString = '';
    if (modifiers.alt) macroString = `ALT+`;
    if (modifiers.ctrl) macroString = `${macroString}CTRL+`;
    if (modifiers.shift) macroString = `${macroString}SHIFT+`;

    macroString = `${macroString}${macro.key.toUpperCase()}`;

    return macroString;
  }

  private parseMacroMap(macroMap: Record<string, IMacro>, charSlot: number) {
    this.macroMap = {};

    const defaultMacros = Object.values(allMacros).filter(
      (mac) => (mac as any).isDefault,
    );

    const allCheckableMacros = Object.values(macroMap)
      .filter((macro) => macro.createdCharSlot === charSlot)
      .concat(defaultMacros);

    allCheckableMacros.forEach((macro) => {
      if (!macro.key) return;
      this.macroMap[this.buildMacroString(macro)] = macro;
    });
  }

  private shouldCancelMacroEarly(macro: string) {
    return !(macro === 'CTRL+A' || macro === 'CTRL+C' || macro === 'CTRL+V');
  }

  private shouldIgnoreMacro() {
    if (document.getElementsByTagName('mat-dialog-container').length > 0) {
      return true;
    }

    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA'
    ) {
      return true;
    }

    if (this.macroIgnoreWindows[this.activeWindow()]) return true;

    return false;
  }

  private watchForMacros() {
    const macroListener = (ev) => {
      if (this.shouldIgnoreMacro() || !ev || !ev.key) return;

      let builtMacro = '';
      if (ev.altKey) builtMacro = 'ALT+';
      if (ev.ctrlKey) builtMacro = `${builtMacro}CTRL+`;
      if (ev.shiftKey) builtMacro = `${builtMacro}SHIFT+`;

      builtMacro = `${builtMacro}${ev.key.toUpperCase()}`;

      // some macros need to be canceled early
      const shouldCancelMacroAlways = this.shouldCancelMacroEarly(builtMacro);
      if (shouldCancelMacroAlways) {
        ev.preventDefault();
        ev.stopPropagation();
      }

      const macro = this.macroMap[builtMacro];

      if (!macro) return;

      // but for convenience, if some are not bound, then we let them leak through and happen here instead
      if (!shouldCancelMacroAlways) {
        ev.preventDefault();
        ev.stopPropagation();
      }

      if (macro.mode === 'lockActivation') {
        this.store.dispatch(new SetActiveMacro(macro.name));
        return;
      }

      if (macro.mode === 'autoActivate') {
        this.gameService.sendCommandString(macro.macro);
        return;
      }

      if (macro.mode === 'autoTarget') {
        const target = this.currentTarget();
        if (target) {
          this.gameService.sendCommandString(macro.macro, target.uuid);
          return;
        }

        this.store.dispatch(new SetCurrentCommand(`#${macro.macro}`));

        return;
      }

      this.store.dispatch(new SetCurrentCommand(`#${macro.macro}`));
    };

    document.addEventListener('keydown', macroListener);
  }

  private autoAttackLoop() {
    setInterval(() => {
      const inGame = this.inGame();
      const player = this.player();
      const macro = this.activeMacros();
      const target = this.currentTarget();

      if (
        !inGame ||
        !macro ||
        !target ||
        !this.optionsService.autoAttack ||
        !target.agro[player.uuid] ||
        macro.ignoreAutoAttack ||
        player.spellChannel ||
        (hostilityLevelFor(player, target as ICharacter) !== 'hostile' &&
          !target.agro[player.uuid] &&
          !player.agro[target.uuid]) ||
        (macro?.for && player.spellCooldowns?.[macro.for] > Date.now())
      ) {
        return;
      }

      this.gameService.sendCommandString(macro.macro, target.uuid);
    }, 1000);
  }

  private watchForNewMacroAlerts(player, currentMacros) {
    if (
      !player ||
      !currentMacros ||
      !currentMacros.macroBars ||
      !currentMacros.activeMacro
    ) {
      return;
    }

    const newSpells = Object.keys(player.learnedSpells || {})
      .map((spell) => {
        const baseObj = cloneDeep(
          Object.values(this.allMacrosHash).find(
            (macro) => (macro.for || macro.name).toLowerCase() === spell,
          ),
        );
        if (!baseObj) return null;

        baseObj.isDefault = true;
        return baseObj;
      })
      .filter((spell) => spell && !currentMacros.learnedMacros[spell.name])
      .filter(
        (spell) =>
          !Object.keys(currentMacros.macroBars || {})
            .map((bar) => currentMacros.macroBars[bar].macros)
            .flat()
            .includes(spell.name),
      );

    if (newSpells.length === 0) return;

    this.modalService.newSpells(newSpells, currentMacros.macroBars);

    newSpells.forEach((spell) => {
      this.store.dispatch(new LearnMacro(spell));
    });
  }
}
