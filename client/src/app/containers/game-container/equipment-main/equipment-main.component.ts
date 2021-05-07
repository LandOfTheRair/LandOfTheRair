import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { sortBy } from 'lodash';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { Allegiance, calculateSkillLevelFromXP, getStatDescription,
  IPlayer, ISimpleItem, ItemClass, ItemSlot, Skill, Stat } from '../../../../interfaces';
import { GameState, SetCharacterView, SettingsState } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

import * as skillDescs from '../../../../assets/content/_output/skilldescs.json';

@AutoUnsubscribe()
@Component({
  selector: 'app-equipment-main',
  templateUrl: './equipment-main.component.html',
  styleUrls: ['./equipment-main.component.scss']
})
export class EquipmentMainComponent implements OnInit, OnDestroy {

  @Select(SettingsState.currentCharView) charView$: Observable<string>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  public charViewSub;
  public playerSub;

  public charView: string;
  public player: IPlayer;

  public readonly slots = [
    {
      template: 'coin',
      scope: 'coin',
      dropScope: 'Sack'
    },
    {
      slot: 'ear',
      name: 'Earring',
      dropScope: 'Equipment'
    },
    {
      slot: 'head',
      name: 'Helm',
      dropScope: 'Equipment'
    },
    {
      slot: 'neck',
      name: 'Amulet',
      dropScope: 'Equipment'
    },
    {},

    {
      slot: 'waist',
      name: 'Sash',
      dropScope: 'Equipment'
    },
    {},
    {},
    {},
    {
      slot: 'wrists',
      name: 'Bracers',
      dropScope: 'Equipment'
    },

    {
      slot: 'ring1',
      name: 'Ring',
      scope: 'ring',
      dropScope: 'Equipment'
    },
    {
      template: 'hand',
      name: 'Right Hand',
      slot: 'rightHand',
      scope: 'right',
      dropScope: 'Right',
      hand: 'Right'
    },
    {},
    {
      template: 'hand',
      name: 'Left Hand',
      slot: 'leftHand',
      scope: 'left',
      dropScope: 'Left',
      hand: 'Left'
    },
    {
      slot: 'ring2',
      name: 'Ring',
      scope: 'ring',
      dropScope: 'Equipment'
    },

    {
      slot: 'hands',
      name: 'Gloves',
      dropScope: 'Equipment'
    },
    {},
    {},
    {},
    {
      slot: 'feet',
      name: 'Boots',
      dropScope: 'Equipment'
    },

    {
      slot: 'potion',
      name: 'Potion',
      dropScope: 'Equipment'
    },
    {
      slot: 'armor',
      scope: ['armor', 'robe'],
      name: 'Armor',
      dropScope: 'Equipment'
    },
    {
      slot: 'robe1',
      name: 'Robe',
      scope: 'robe',
      dropScope: 'Equipment'
    },
    {
    slot: 'robe2',
      name: 'Robe',
      scope: 'robe',
      dropScope: 'Equipment'
    },
    {
      slot: 'ammo',
      name: 'Ammo',
      dropScope: 'Equipment'
    },

  ];

  public readonly stats = [
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

  public readonly skills = [
    { skill: Skill.Sword,       tooltip: 'Proficiency with one-handed swords' },
    { skill: Skill.TwoHanded,   tooltip: 'Proficiency with two-handed weapons' },
    { skill: Skill.Shortsword,  tooltip: 'Proficiency with shortswords' },
    { skill: Skill.Staff,       tooltip: 'Proficiency with staves' },
    { skill: Skill.Polearm,     tooltip: 'Proficiency with halberds' },
    { skill: Skill.Axe,         tooltip: 'Proficiency with axes' },
    { skill: Skill.Dagger,      tooltip: 'Proficiency with daggers' },
    { skill: Skill.Mace,        tooltip: 'Proficiency with maces' },
    { skill: Skill.Martial,     tooltip: 'Proficiency with martial attacks (fists)' },
    { skill: Skill.Ranged,      tooltip: 'Proficiency with ranged attacks (bows, shortbows, crossbows)' },
    { skill: Skill.Throwing,    tooltip: 'Proficiency with thrown attacks' },
    { skill: Skill.Thievery,    tooltip: 'Proficiency with thievery' },
    { skill: Skill.Wand,        tooltip: 'Proficiency with wands & totems' },
    { skill: Skill.Conjuration, tooltip: 'Proficiency with conjuration magic' },
    { skill: Skill.Restoration, tooltip: 'Proficiency with restoration magic' },
  ];

  public readonly allegiances = [
    Allegiance.Adventurers,
    Allegiance.Pirates,
    Allegiance.Royalty,
    Allegiance.Townsfolk,
    Allegiance.Underground,
    Allegiance.Wilderness
  ];

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService,
    public assetService: AssetService
  ) { }

  ngOnInit() {
    this.playerSub = this.player$.subscribe(p => {
      this.player = p;
    });

    this.charViewSub = this.charView$.subscribe(c => {
      this.charView = c;
    });
  }

  ngOnDestroy() {
  }

  createContext(slot: any, player: IPlayer) {
    return { slot, player };
  }

  changeView(newView: 'Equipment'|'Stats'|'Skills'|'Reputation') {
    this.store.dispatch(new SetCharacterView(newView));
  }

  statText(stat: Stat, statValue: number): string {
    return getStatDescription(stat, statValue);
  }

  sortedSkills(playerSkills: Partial<Record<Skill, number>>): Array<any> {
    return sortBy(this.skills, s => -playerSkills[s.skill]);
  }

  skillLevel(skillValue: number): number {
    return calculateSkillLevelFromXP(skillValue);
  }

  skillText(skill: Skill, skillValue: number): string {
    return this.getSkillDescription(skill, this.skillLevel(skillValue));
  }

  canShowValue(slot: ItemSlot, item: ISimpleItem): boolean {
    if (!item) return false;
    return this.assetService.getItem(item.name)?.itemClass === ItemClass.Coin;
  }

  hostilityForAllegiance(repValue: number) {
    if (repValue < -100) return 'Hostile';
    if (repValue > 100)  return 'Friendly';
    return 'Neutral';
  }

  private getSkillDescription(skill: Skill, skillLevel: number): string {
    return skillDescs[skill][Math.min(skillDescs[skill].length - 1, skillLevel)];
  }

}
