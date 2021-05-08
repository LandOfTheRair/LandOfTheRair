
import { Component, Input } from '@angular/core';

import { Skill } from '../../../interfaces';

const skillData = {
  [Skill.Sword]       : { icon: 'katana',         tooltip: 'Proficiency with one-handed swords' },
  [Skill.TwoHanded]   : { icon: 'relic-blade',    tooltip: 'Proficiency with two-handed weapons' },
  [Skill.Shortsword]  : { icon: 'gladius',        tooltip: 'Proficiency with shortswords' },
  [Skill.Staff]       : { icon: 'bo',             tooltip: 'Proficiency with staves' },
  [Skill.Polearm]     : { icon: 'sharp-halberd',  tooltip: 'Proficiency with halberds' },
  [Skill.Axe]         : { icon: 'battered-axe',   tooltip: 'Proficiency with axes' },
  [Skill.Dagger]      : { icon: 'plain-dagger',   tooltip: 'Proficiency with daggers' },
  [Skill.Mace]        : { icon: 'flanged-mace',   tooltip: 'Proficiency with maces' },
  [Skill.Martial]     : { icon: 'black-belt',     tooltip: 'Proficiency with martial attacks (fists)' },
  [Skill.Ranged]      : { icon: 'high-shot',      tooltip: 'Proficiency with ranged attacks (bows, shortbows, crossbows)' },
  [Skill.Throwing]    : { icon: 'thrown-spear',   tooltip: 'Proficiency with thrown attacks' },
  [Skill.Thievery]    : { icon: 'two-shadows',    tooltip: 'Proficiency with thievery' },
  [Skill.Wand]        : { icon: 'orb-wand',       tooltip: 'Proficiency with wands & totems' },
  [Skill.Conjuration] : { icon: 'enlightenment',  tooltip: 'Proficiency with conjuration magic' },
  [Skill.Restoration] : { icon: 'ankh',           tooltip: 'Proficiency with restoration magic' },
};

@Component({
  selector: 'app-skill-icon',
  template: `
    <app-icon [size]="size" [name]="icon" [matTooltipDisabled]="!showTooltip" [matTooltip]="tooltip" [round]="round"></app-icon>
  `,
  styles: [`
  `]
})
export class SkillIconComponent {

  @Input() public skill: Skill;
  @Input() public round: boolean;
  @Input() public size = 'small';
  @Input() public showTooltip = true;

  public get icon() {
    return skillData[this.skill]?.icon;
  }

  public get tooltip() {
    return skillData[this.skill]?.tooltip;
  }

}
