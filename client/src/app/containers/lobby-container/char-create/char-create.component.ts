import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICharacterCreateInfo, Stat } from '../../../../interfaces';

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
    weapons: ''
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
    allegiance: '',
    weapon: ''
  };

  public statMods = {
    baseclass: [],
    allegiance: {}
  };

  public icons = {
    Mage: 'abstract-024',
    Thief: 'abstract-005',
    Healer: 'abstract-041',
    Warrior: 'abstract-053',
    Traveller: 'uncertainty'
  };

  public readonly allStats = [
    { stat: Stat.STR, icon: 'biceps',      tooltip: 'STR: Affects how likely you are to hit in combat and how much damage you deal' },
    { stat: Stat.DEX, icon: 'bowman',      tooltip: 'DEX: Affects how likely you are to hit in combat' },
    { stat: Stat.AGI, icon: 'sprint',      tooltip: 'AGI: Affects how likely you are to dodge physical attacks in combat' },
    { stat: Stat.INT, icon: 'smart',       tooltip: 'INT: Affects damage for Conjuration damage and Mage level up MP' },
    { stat: Stat.WIS, icon: 'wisdom',      tooltip: 'WIS: Affects damage and healing for Restoration damage and Healers level up MP' },
    { stat: Stat.WIL, icon: 'aura',        tooltip: 'WIL: Affects your saving throw for magical attacks' },
    { stat: Stat.CON, icon: 'glass-heart', tooltip: 'CON: Affects how likely you are to get stunned in combat and level up HP' },
    { stat: Stat.CHA, icon: 'rose',        tooltip: 'CHA: Affects merchant shop prices' },
    { stat: Stat.LUK, icon: 'clover',      tooltip: 'LUK: Affects random drop chance and crit chance' }
  ];

  public get charCreateData(): ICharacterCreateInfo {
    return this.data.charCreateData;
  }

  public get canCreateCharacter(): boolean {
    return this.character.name
        && this.character.allegiance
        && this.character.gender
        && this.character.baseclass
        && this.character.weapons
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
      Object.keys(prevStatMods).forEach((stat) => {
        this.stats[stat] -= prevStatMods[stat];
      });
    }

    Object.keys(allegiance.statMods).forEach((stat) => {
      this.stats[stat] += allegiance.statMods[stat];
    });
  }

  public chooseBaseClass(baseclass) {
    const prevStatMods = this.statMods.baseclass;

    this.character.baseclass = baseclass.name;
    this.statMods.baseclass = baseclass.statMods;
    this.descs.baseclass = baseclass.description.split('\n').join('<br><br>');

    if (prevStatMods) {
      Object.keys(prevStatMods).forEach((stat) => {
        this.stats[stat] -= prevStatMods[stat];
      });
    }

    Object.keys(baseclass.statMods).forEach((stat) => {
      this.stats[stat] += baseclass.statMods[stat];
    });
  }

  public chooseWeapons(weapons) {
    this.character.weapons = weapons.name;
    this.descs.weapon = weapons.description.split('\n').join('<br><br>');
  }

}
