import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICharacterCreateInfo } from '../../../../models';

@Component({
  selector: 'app-char-create',
  templateUrl: './char-create.component.html',
  styleUrls: ['./char-create.component.scss']
})
export class CharCreateComponent implements OnInit {

  public overwriteChecked: boolean;

  public character = {
    name: '',
    gender: '',
    allegiance: '',
    baseclass: '',
  };

  public stats = {
    str: 10,
    dex: 10,
    agi: 10,
    int: 10,
    wis: 10,
    wil: 10,
    con: 10,
    cha: 10,
    luk: 10,
    hp: 100,
    gold: 500
  };

  public descs = {
    baseclass: '',
    allegiance: ''
  };

  public statMods = {
    baseclass: [],
    allegiance: []
  };

  public icons = {
    Mage: 'abstract-024',
    Thief: 'abstract-005',
    Healer: 'abstract-041',
    Warrior: 'abstract-053',
    Undecided: 'uncertainty'
  };

  public get allStats() {
    return [
      'str', 'dex', 'agi',
      'int', 'wis', 'wil',
      'con', 'cha', 'luk',
      'hp',
      'gold'
    ];
  }

  public get charCreateData(): ICharacterCreateInfo {
    return this.data.charCreateData;
  }

  public get canCreateCharacter(): boolean {
    return this.character.name
        && this.character.allegiance
        && this.character.gender
        && this.character.baseclass
        && (this.data.needsOverwrite ? this.overwriteChecked : true);
  }

  public get invalidName() {
    const name = this.character.name;
    return !name || name.length < 2 || name.length > 20;
  }

  constructor(
    public dialogRef: MatDialogRef<CharCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {

  }

  validateName() {
    let name = this.character.name;
    name = name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
    name = name.replace(/[^a-zA-Z]/g, '');
    name = name.slice(0, 19);

    this.character.name = name;
  }

  create() {
    this.dialogRef.close(this.character);
  }

  close() {
    this.dialogRef.close();
  }

  public chooseAllegiance(allegiance) {
    const prevStatMods = this.statMods.allegiance;

    this.character.allegiance = allegiance.name;
    this.statMods.allegiance = allegiance.statMods;
    this.descs.allegiance = allegiance.description.split('\n').join('<br><br>');

    if (prevStatMods) {
      prevStatMods.forEach(({ name, value }) => {
        this.stats[name] -= value;
      });
    }

    allegiance.statMods.forEach(({ name, value }) => {
      this.stats[name] += value;
    });
  }

  public chooseBaseClass(baseclass) {
    const prevStatMods = this.statMods.baseclass;

    this.character.baseclass = baseclass.name;
    this.statMods.baseclass = baseclass.statMods;
    this.descs.baseclass = baseclass.description.split('\n').join('<br><br>');

    if (prevStatMods) {
      prevStatMods.forEach(({ name, value }) => {
        this.stats[name] -= value;
      });
    }

    baseclass.statMods.forEach(({ name, value }) => {
      this.stats[name] += value;
    });
  }

}
