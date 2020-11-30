import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';

import { cloneDeep } from 'lodash';

import { IMacro, IMacroBar } from '../../../../interfaces';
import { SetMacroBars } from '../../../../stores';

interface INewSpells {
  newSpells: IMacro[];
  macroBars: IMacroBar[];
}

@Component({
  selector: 'app-newspells',
  templateUrl: './newspells.component.html',
  styleUrls: ['./newspells.component.scss']
})
export class NewSpellsComponent implements OnInit {

  public macroBarsByName: Record<string, string> = {};

  public get macroBarsAddable(): IMacroBar[] {
    return Object.values(this.data.macroBars).filter(x => this.isMacroBarFree(x));
  }

  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<NewSpellsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: INewSpells
  ) { }

  ngOnInit() {
    this.data.macroBars = cloneDeep(this.data.macroBars);
  }

  addToBar(spell: IMacro) {
    this.addMacro(spell);

    this.store.dispatch(new SetMacroBars(Object.values(cloneDeep(this.data.macroBars))));

    this.data.newSpells = this.data.newSpells.filter(x => x.name !== spell.name);
    if(this.data.newSpells.length === 0) {
      this.dialogRef.close();
    }
  }

  dontAddToBar(spell: IMacro) {
    this.data.newSpells = this.data.newSpells.filter(x => x.name !== spell.name);

    if(this.data.newSpells.length === 0) {
      this.dialogRef.close();
    }
  }

  yesToAll() {
    this.data.newSpells.forEach(spell => {
      this.addMacro(spell);
    });

    this.store.dispatch(new SetMacroBars(Object.values(cloneDeep(this.data.macroBars))));
  }

  noToAll() {
    this.data.newSpells.forEach(spell => {
      this.dontAddToBar(spell);
    });
  }

  private isMacroBarFree(bar: IMacroBar): boolean {
    if(!bar) return false;
    return bar.macros.filter(Boolean).length < 10;
  }

  private addMacro(spell: IMacro): void {

    let foundBarWithSlot = null;

    // first, if it's set to something, we try to add it to that bar
    const tryBarFirst = this.macroBarsByName[spell.name] === '__NEW' ? null : this.data.macroBars[this.macroBarsByName[spell.name]];
    if(this.isMacroBarFree(tryBarFirst)) foundBarWithSlot = tryBarFirst;

    // next, if it isn't set, or that bar is full, we try to find a new one
    Object.values(this.data.macroBars).forEach(bar => {
      if(this.macroBarsByName[spell.name] === '__NEW' || foundBarWithSlot || !this.isMacroBarFree(bar)) return;

      foundBarWithSlot = bar;
    });

    // finally, if it is supposed to be a new bar, or we didn't find one above, we make a new bar
    if(!foundBarWithSlot || this.macroBarsByName[spell.name] === '__NEW') {
      let i = 1;
      let newName = '';

      do {
        newName = `skills (${i})`

      } while(i++ && this.data.macroBars[newName]);
      foundBarWithSlot = { name: newName, macros: [] };
      this.data.macroBars[newName] = foundBarWithSlot;
    }

    foundBarWithSlot.macros = [...foundBarWithSlot.macros, spell.name];

    this.data.macroBars[foundBarWithSlot.name] = foundBarWithSlot;
  }

}
