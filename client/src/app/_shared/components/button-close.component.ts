import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-button-close',
  template: `
    <button mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        background-color: #8b0000;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonCloseComponent {}
