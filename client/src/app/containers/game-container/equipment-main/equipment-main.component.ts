import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { sortBy } from 'lodash';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { calculateSkillLevelFromXP, getSkillDescription, getStatDescription,
  IPlayer, ISimpleItem, ItemClass, ItemSlot, Skill, Stat } from '../../../../interfaces';
import { GameState, SetCharacterView, SettingsState } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-equipment-main',
  templateUrl: './equipment-main.component.html',
  styleUrls: ['./equipment-main.component.scss']
})
export class EquipmentMainComponent implements OnInit, OnDestroy {

  @Select(SettingsState.currentCharView) charView$: Observable<string>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  public readonly slots = [
    {
      template: 'coin',
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
    { skill: Skill.Sword,       icon: 'katana',         tooltip: 'Proficiency with one-handed swords' },
    { skill: Skill.TwoHanded,   icon: 'relic-blade',    tooltip: 'Proficiency with two-handed weapons' },
    { skill: Skill.Shortsword,  icon: 'gladius',        tooltip: 'Proficiency with shortswords' },
    { skill: Skill.Staff,       icon: 'bo',             tooltip: 'Proficiency with staves' },
    { skill: Skill.Polearm,     icon: 'sharp-halberd',  tooltip: 'Proficiency with halberds' },
    { skill: Skill.Axe,         icon: 'battered-axe',   tooltip: 'Proficiency with axes' },
    { skill: Skill.Dagger,      icon: 'plain-dagger',   tooltip: 'Proficiency with daggers' },
    { skill: Skill.Mace,        icon: 'flanged-mace',   tooltip: 'Proficiency with maces' },
    { skill: Skill.Martial,     icon: 'black-belt',     tooltip: 'Proficiency with martial attacks (fists)' },
    { skill: Skill.Ranged,      icon: 'high-shot',      tooltip: 'Proficiency with ranged attacks (bows, shortbows, crossbows)' },
    { skill: Skill.Throwing,    icon: 'thrown-spear',   tooltip: 'Proficiency with thrown attacks' },
    { skill: Skill.Thievery,    icon: 'two-shadows',    tooltip: 'Proficiency with thievery' },
    { skill: Skill.Wand,        icon: 'orb-wand',       tooltip: 'Proficiency with wands & totems' },
    { skill: Skill.Conjuration, icon: 'ankh',           tooltip: 'Proficiency with conjuration magic' },
    { skill: Skill.Restoration, icon: 'enlightenment',  tooltip: 'Proficiency with restoration magic' },
  ];

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService,
    public assetService: AssetService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  createContext(slot: any, player: IPlayer) {
    return { slot, player };
  }

  changeView(newView: 'Equipment'|'Stats'|'Skills') {
    this.store.dispatch(new SetCharacterView(newView));
  }

  statText(stat: Stat, statValue: number): string {
    return getStatDescription(stat, statValue);
  }

  sortedSkills(playerSkills: Record<Skill, number>): Array<any> {
    return sortBy(this.skills, s => -playerSkills[s.skill]);
  }

  skillLevel(skillValue: number): number {
    return calculateSkillLevelFromXP(skillValue);
  }

  skillText(skill: Skill, skillValue: number): string {
    return getSkillDescription(skill, this.skillLevel(skillValue));
  }

  canShowValue(slot: ItemSlot, item: ISimpleItem): boolean {
    if (!item) return false;
    return this.assetService.getItem(item.name).itemClass === ItemClass.Coin;
  }

}
