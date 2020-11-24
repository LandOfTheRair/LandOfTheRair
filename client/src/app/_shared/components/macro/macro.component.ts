import { Component, Input } from '@angular/core';
import { IMacro } from '../../../../interfaces';

@Component({
  selector: 'app-macro',
  templateUrl: './macro.component.html',
  styleUrls: ['./macro.component.scss']
})
export class MacroComponent {

  @Input() public size = 'normal';
  @Input() public macroRef: IMacro;
  @Input() public isActive: boolean;
  @Input() public disableEffects = false;
  @Input() public showTooltip = true;

  constructor() { }

  get background() {
    return this.macroRef?.bgColor ?? '#ccc';
  }

  get foreground() {
    return this.macroRef?.color ?? '';
  }

  get iconName() {
    return this.macroRef?.icon ?? '';
  }

  get macroName() {
    return this.macroRef?.name ?? '';
  }

  get macroTooltip() {
    return this.macroRef?.tooltipDesc ?? '';
  }
}
