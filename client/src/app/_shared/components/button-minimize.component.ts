import { Component } from '@angular/core';

@Component({
  selector: 'app-button-minimize',
  template: `
    <button mat-icon-button>
      <mat-icon>minimize</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        background-color: #a17f1a;
      }
    `,
  ],
})
export class ButtonMinimizeComponent {
  constructor() {}
}
