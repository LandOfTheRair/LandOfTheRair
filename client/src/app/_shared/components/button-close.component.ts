import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-button-close',
  template: `
    <button mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [`
  :host {
    background-color: #8b0000;
  }
  `]
})
export class ButtonCloseComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
