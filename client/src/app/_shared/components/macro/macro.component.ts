import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-macro',
  templateUrl: './macro.component.html',
  styleUrls: ['./macro.component.scss']
})
export class MacroComponent {

  @Input()
  public size = 'normal';

  @Input()
  public macroRef: string;

  @Input()
  public isActive: boolean;

  @Input()
  public disableEffects = false;

  constructor() { }

  get background() {
    return '#ccc';
    // if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '#ccc';
    // return this.macroService.allMacros[this.macroRef].background || '#ccc';
  }

  get foreground() {
    return '';
    // if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    // return this.macroService.allMacros[this.macroRef].foreground;
  }

  get iconName() {
    return '';
    // if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    // return this.macroService.allMacros[this.macroRef].icon;
  }

  get macroName() {
    return '';
    // if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    // return startCase(this.macroService.allMacros[this.macroRef].name);
  }

  get macroTooltip() {
    return '';
    // if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    // return this.macroService.allMacros[this.macroRef].tooltipDesc;
  }
}
