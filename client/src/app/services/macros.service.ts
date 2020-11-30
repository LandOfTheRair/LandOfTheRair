import { Injectable } from '@angular/core';
import { Select, Selector, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { combineLatest, interval, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ICharacter, IGame, IMacro, IMacroContainer, IPlayer } from '../../interfaces';
import { GameState, LearnMacro, MacrosState, SetActiveMacro, SetCurrentCommand, SettingsState } from '../../stores';
import { GameService } from './game.service';

import * as allMacros from '../../assets/content/_output/macros.json';
import { ModalService } from './modal.service';
import { OptionsService } from './options.service';
@Injectable({
  providedIn: 'root'
})
export class MacrosService {

  @Select(GameState.player) private player$: Observable<IPlayer>;
  @Select(GameState.inGame) private inGame$: Observable<boolean>;
  @Select(GameState.currentTarget) private currentTarget$: Observable<ICharacter>;
  @Select(SettingsState.activeWindow) private activeWindow$: Observable<string>;
  @Select(MacrosState.customMacros) private customMacros$: Observable<Record<string, IMacro>>;
  @Select(MacrosService.currentPlayerActiveMacro) private activeMacro$: Observable<IMacro>;
  @Select(MacrosService.currentPlayerMacros) private currentMacros$: Observable<any>;

  private macroMap: Record<string, IMacro> = {};

  private activeWindow: string;

  private macroIgnoreWindows = {
    lobby: true, bank: true,
    shop: true, marketboard: true, party: true,
    commandLine: true, journal: true
  };

  private get allMacrosHash(): Record<string, IMacro> {
    return (allMacros as any).default || allMacros;
  }

  @Selector([GameState, MacrosState])
  static currentPlayerMacros(gameState: IGame, macroState: IMacroContainer) {
    const player = gameState.player;
    if (!player) return null;

    return {
      activeMacro: macroState.activeMacros?.[player.username]?.[player.charSlot],
      activeMacroBars: macroState.activeMacroBars?.[player.username]?.[player.charSlot],
      learnedMacros: macroState.learnedMacros?.[player.username]?.[player.charSlot] ?? {},
      macroBars: macroState.characterMacros?.[player.username]?.[player.charSlot]
    };
  }

  @Selector([GameState, MacrosState, MacrosState.allMacros])
  static currentPlayerActiveMacro(gameState: IGame, macroState: IMacroContainer, allPossibleMacros) {
    const player = gameState.player;
    if (!player) return null;

    return allPossibleMacros[macroState.activeMacros?.[player.username]?.[player.charSlot]];
  }

  constructor(
    private store: Store,
    private modalService: ModalService,
    private optionsService: OptionsService,
    private gameService: GameService
  ) {}

  public init() {
    this.activeWindow$.subscribe(w => this.activeWindow = w);
    this.customMacros$.subscribe(c => this.parseMacroMap(c));

    this.watchForNewMacroAlerts();
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

  private parseMacroMap(macroMap: Record<string, IMacro>) {
    this.macroMap = {};

    const defaultMacros = Object.values(allMacros).filter(mac => (mac as any).isDefault);

    const allCheckableMacros = Object.values(macroMap).concat(defaultMacros);

    allCheckableMacros.forEach(macro => {
      if (!macro.key) return;
      this.macroMap[this.buildMacroString(macro)] = macro;
    });
  }

  private shouldCancelMacroEarly(macro: string) {
    return !(macro === 'CTRL+A' || macro === 'CTRL+C' || macro === 'CTRL+V');
  }

  private shouldIgnoreMacro() {
    if (document.getElementsByTagName('mat-dialog-container').length > 0) return true;

    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return true;

    if (this.macroIgnoreWindows[this.activeWindow]) return true;

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

      this.store.dispatch(new SetCurrentCommand(`#${macro.macro}`));
    };

    document.addEventListener('keydown', macroListener);
  }

  private autoAttackLoop() {
    setInterval(() => {
      combineLatest([this.inGame$, this.player$, this.activeMacro$, this.currentTarget$])
        .pipe(first())
        .subscribe(([inGame, player, macro, target]) => {
          if (!inGame
          || !macro
          || !target
          || !this.optionsService.autoAttack
          || macro.ignoreAutoattackOption
          || player.spellChannel
          || this.gameService.hostilityLevelFor(player, target) !== 'hostile'
          || (macro?.for && player.spellCooldowns?.[macro.for] > Date.now())) return;

          this.gameService.sendCommandString(macro.macro, target.uuid);
        });
    }, 1000);
  }

  private watchForNewMacroAlerts() {
    combineLatest([this.player$, this.currentMacros$])
      .subscribe(([player, currentMacros]) => {
        if(!player || !currentMacros) return;

        const newSpells = Object.keys(player.learnedSpells || {})
          .map(spell => {
            const baseObj = cloneDeep(Object.values(this.allMacrosHash).find(macro => macro.name.toLowerCase() === spell));
            baseObj.isDefault = true;
            return baseObj;
          })
          .filter(spell => spell && !currentMacros.learnedMacros[spell.name]);

        if(newSpells.length === 0) return;

        this.modalService.newSpells(newSpells, currentMacros.macroBars);

        newSpells.forEach(spell => {
          this.store.dispatch(new LearnMacro(spell));
        });
      });
  }

}
