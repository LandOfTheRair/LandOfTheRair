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

  private addMacro(spell: IMacro): void {

    let foundBarWithSlot = null;
    Object.values(this.data.macroBars).forEach(bar => {
      if(bar.macros.filter(Boolean).length >= 10) return;

      foundBarWithSlot = bar;
    });

    if(!foundBarWithSlot) {
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
