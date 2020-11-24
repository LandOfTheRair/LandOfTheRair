import { Color } from '@angular-material-components/color-picker';
import { NgxMatColorPickerComponent, stringInputToObject } from '@angular-material-components/color-picker';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Select, Selector, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import * as allMacros from '../../../../assets/content/_output/macros.json';
import { macroNames } from '../../../../assets/generated/macicons.json';
import { IGame, IMacro, IMacroBar, IMacroContainer } from '../../../../interfaces';
import { CreateCustomMacro, DeleteCustomMacro, GameState, MacrosState, SetActiveMacroBars, SetMacroBars } from '../../../../stores';

const defaultMacro = () => ({
  name: '',
  tooltipDesc: '',
  macro: '',
  icon: 'uncertainty',
  color: '#000000',
  mode: 'autoActivate',
  modifiers: { shift: false, ctrl: false, alt: false }
});

@AutoUnsubscribe()
@Component({
  selector: 'app-macroeditor',
  templateUrl: './macroeditor.component.html',
  styleUrls: ['./macroeditor.component.scss']
})
export class MacroEditorComponent implements OnInit, OnDestroy {

  private readonly ICONS_PER_PAGE = 36;
  private readonly MACROS_PER_PAGE = 8;

  @ViewChild('fgPick', { static: true }) fgPicker: NgxMatColorPickerComponent;
  @ViewChild('bgPick', { static: true }) bgPicker: NgxMatColorPickerComponent;

  @Select(MacroEditorComponent.currentPlayerMacros) currentPlayerMacros$: Observable<any>;
  @Select(MacrosState.customMacros) customMacros$: Observable<Record<string, IMacro>>;

  public currentTab = 0;

  public macroBarSub: Subscription;
  public macroSub: Subscription;
  public fgSub: Subscription;
  public bgSub: Subscription;

  // macro stuff
  public allMacros: Record<string, IMacro> = {};
  public macros: IMacro[] = [];
  public showEdit: Record<string, boolean> = {};

  public showMacroEditor = false;
  public isEditing = false;
  public currentIconPage = 0;
  public currentIconsInPage: string[] = [];

  public fgColor = new Color(0, 0, 0);
  public bgColor = new Color(204, 204, 204);

  public get allMacroNameIcons(): string[] {
    return macroNames;
  }

  public currentlyEditingMacro: IMacro = defaultMacro();

  // macro group stuff
  public activeMacroBars: string[] = [];
  public macroBars: IMacroBar[] = [];
  public readonly macroArray = Array(10).fill(null).map((x, i) => i);
  public currentMacroPage = 1;
  public currentMacrosInPage: IMacro[] = [];

  @Selector([GameState, MacrosState])
  static currentPlayerMacros(
    gameState: IGame, macroState: IMacroContainer
  ) {
    const player = gameState.player;
    if (!player) return null;

    return {
      activeMacroBars: macroState.activeMacroBars?.[player.username]?.[player.charSlot],
      macroBars: macroState.characterMacros?.[player.username]?.[player.charSlot]
    };
  }

  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<MacroEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.macroSub = this.customMacros$.subscribe(macs => {
      const defaultMacros = Object.values(allMacros).filter(mac => (mac as any).isDefault);
      const customMacros = Object.values(macs);

      this.allMacros = Object.assign({}, allMacros, macs);
      this.macros = defaultMacros.concat(customMacros);
    });

    this.macroBarSub = this.currentPlayerMacros$.subscribe(bars => {
      if (!bars) return;

      this.activeMacroBars = cloneDeep(bars.activeMacroBars);
      this.macroBars = cloneDeep(Object.values(bars.macroBars));
    });

    this.fgSub = this.fgPicker._selectedChanged.subscribe(c => this.currentlyEditingMacro.color = c.toHexString());
    this.bgSub = this.bgPicker._selectedChanged.subscribe(c => this.currentlyEditingMacro.bgColor = c.toHexString());

    this.setMacroGroupPage(0);
  }

  ngOnDestroy() {}

  selectTab($event) {
    this.currentTab = $event.index;
  }

  updateKey($event) {
    $event.preventDefault();
    $event.stopPropagation();

    const { key, shiftKey, altKey, ctrlKey } = $event;
    if (!key || ['Shift', 'Control', 'Alt'].includes(key)) return;

    this.currentlyEditingMacro.key = key.toUpperCase();
    this.currentlyEditingMacro.modifiers.shift = shiftKey;
    this.currentlyEditingMacro.modifiers.ctrl = ctrlKey;
    this.currentlyEditingMacro.modifiers.alt = altKey;
  }

  private resetColors(fgColor = '#000000', bgColor = '#cccccc') {
    const fgRGB = stringInputToObject(fgColor);
    const bgRGB = stringInputToObject(bgColor);

    this.fgColor.r = fgRGB.r;
    this.fgColor.g = fgRGB.g;
    this.fgColor.b = fgRGB.b;

    this.bgColor.r = bgRGB.r;
    this.bgColor.g = bgRGB.g;
    this.bgColor.b = bgRGB.b;
  }

  // macro state changes
  create() {
    this.resetColors();
    this.currentlyEditingMacro = defaultMacro();
    this.setPage(this.findPage(this.currentlyEditingMacro.icon));
    this.showMacroEditor = true;
    this.isEditing = false;
  }

  save() {
    this.store.dispatch(new CreateCustomMacro(this.currentlyEditingMacro));
    this.showMacroEditor = false;
    this.isEditing = false;
  }

  edit(macro: IMacro) {
    this.currentlyEditingMacro = macro;
    this.resetColors(macro.color, macro.bgColor);
    this.setPage(this.findPage(this.currentlyEditingMacro.icon));
    this.showMacroEditor = true;
    this.isEditing = true;
  }

  copy(macro: IMacro) {
    this.currentlyEditingMacro = cloneDeep(macro);
    this.currentlyEditingMacro.name = `${this.currentlyEditingMacro.name} (copy)`;
    this.resetColors(macro.color, macro.bgColor);
    this.setPage(this.findPage(this.currentlyEditingMacro.icon));
    this.showMacroEditor = true;
    this.isEditing = false;
  }

  remove(macro: IMacro) {
    this.store.dispatch(new DeleteCustomMacro(macro));
  }

  // macro button changes
  toggleModifier(mod: string) {
    this.currentlyEditingMacro.modifiers = this.currentlyEditingMacro.modifiers || { shift: false, ctrl: false, alt: false };
    this.currentlyEditingMacro.modifiers[mod] = !this.currentlyEditingMacro.modifiers[mod];
  }

  // page functions
  findPage(iconName: string): number {
    return Math.floor(this.allMacroNameIcons.findIndex(x => x === iconName) / this.ICONS_PER_PAGE);
  }

  setPage(page: number): void {
    if (page < 0) return;

    const pageSize = this.ICONS_PER_PAGE;
    const maxPage = Math.floor(this.allMacroNameIcons.length / pageSize);

    if (page > maxPage) return;

    const pageStart = this.currentIconPage * pageSize;
    const currentIconsInPage = this.allMacroNameIcons.slice(pageStart, pageStart + pageSize);
    if (currentIconsInPage.length === 0) return;

    this.currentIconsInPage = currentIconsInPage;
    this.currentIconPage = page;
  }

  // validation checks
  alreadyAssignedComboOtherKey(): string | null {
    const currentMacroString = this.buildMacroString(this.currentlyEditingMacro);
    if (!currentMacroString) return null;
    const dupe = this.macros.find(m => this.buildMacroString(m) === currentMacroString);

    if (dupe && dupe.name === this.currentlyEditingMacro.name) return null;
    return dupe?.name;
  }

  alreadyAssignedMacroName(): boolean {
    if (this.isEditing) return false;

    return !!this.macros.find(x => x.name === this.currentlyEditingMacro.name);
  }

  private buildMacroString(macro: IMacro): string {
    if (!macro.key) return '';

    const alt = macro.modifiers?.alt;
    const ctrl = macro.modifiers?.ctrl;
    const shift = macro.modifiers?.shift;

    let macroString = '';
    if (alt) macroString = `ALT+`;
    if (ctrl) macroString = `${macroString}CTRL+`;
    if (shift) macroString = `${macroString}SHIFT+`;

    macroString = `${macroString}${macro.key.toUpperCase()}`;

    return macroString;
  }

  // no macro name dupes or key dupes, and there must be a command (duh)
  canSaveCurrentMacro() {
    return this.currentlyEditingMacro.macro
        && !this.alreadyAssignedMacroName()
        && !this.alreadyAssignedComboOtherKey();
  }

  export() {

  }

  import() {

  }

  createMacroGroup() {
    const entered = this.data.modals.text('New Macro Bar', 'What would you like to name this macro bar?');
    entered.subscribe(text => {
      text = text.substring(0, 10).trim();
      if (!text || this.activeMacroBars.includes(text)) return;

      this.macroBars.push({ name: text, macros: [] });

      this.store.dispatch(new SetMacroBars(this.macroBars));
    });
  }

  makeActive(group: string, pos: number) {

    // if it's currently active, un-active it
    if (this.activeMacroBars[pos] === group) {
      this.activeMacroBars[pos] = null;
      return;
    }

    const activeIdx = this.activeMacroBars.findIndex(x => x === group);
    if (activeIdx !== -1) this.activeMacroBars[activeIdx] = null;

    this.activeMacroBars[pos] = group;
    this.store.dispatch(new SetActiveMacroBars(this.activeMacroBars));
  }

  setMacro(group: IMacroBar, macroIdx: number, macro: string | null) {
    if (group.macros[macroIdx] === macro) return;

    group.macros[macroIdx] = macro;

    this.store.dispatch(new SetMacroBars(this.macroBars));
  }

  removeMacroGroup(group: string) {
    this.macroBars = this.macroBars.filter(x => x.name !== group);
    this.activeMacroBars = this.activeMacroBars.filter(x => x !== group);
    if (this.activeMacroBars.length === 0) this.activeMacroBars = ['default'];

    const macroBars = this.macroBars;
    const activeBars = this.activeMacroBars;

    this.store.dispatch(new SetMacroBars(macroBars));
    this.store.dispatch(new SetActiveMacroBars(activeBars));
  }

  setMacroGroupPage(page: number, $event?): void {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    if (page < 0) return;

    const pageSize = this.MACROS_PER_PAGE;
    const maxPage = Math.floor(this.macros.length / pageSize);

    if (page > maxPage) return;


    const pageStart = this.currentMacroPage * pageSize;
    const currentMacrosInPage = this.macros.slice(pageStart, pageStart + pageSize);
    if (currentMacrosInPage.length === 0) return;

    this.currentMacroPage = page;
    this.currentMacrosInPage = currentMacrosInPage;
  }

}
