
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import * as effectIcons from '../../../assets/content/_output/effect-icons.json';

@Component({
  selector: 'app-effect-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-icon [name]="iconName" [color]="color" [bgColor]="bgColor" [matTooltip]="tooltip"></app-icon>
  `
})
export class EffectIconComponent {

  @Input() public effectName = 'undecided';

  public get iconData() {
    return effectIcons[this.effectName];
  }

  public get iconName() {
    return this.iconData?.name ?? 'undefined';
  }

  public get bgColor() {
    return this.iconData?.bgColor ?? '';
  }

  public get color() {
    return this.iconData?.color ?? '#ccc';
  }

  public get tooltip() {
    return this.iconData?.tooltipDesc ?? '';
  }

}
