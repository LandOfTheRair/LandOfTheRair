import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SetActiveWindow, SettingsState, UpdateWindowPosition } from '../../../stores';

// TODO: resize

@Component({
  selector: 'app-window',
  template: `
  <div *ngIf="(window$ | async) as windowProps">
    <div class="window"
        [class.active]="(activeWindow$ | async) === windowName"
        [class.minimized]="minimized"

        [style.top]="windowProps.y + 'px'"
        [style.left]="windowProps.x + 'px'"
        [style.width]="width"
        [style.height]="height"

        [appDraggableWindow]="canDrag"
        [windowHandle]="windowDrag"
        [windowName]="windowName"

        (mousedown)="makeActive()"
    >
      <mat-toolbar class="window-header">
        <span #windowDrag>
          <ng-template [ngTemplateOutlet]="head"></ng-template>
        </span>

        <app-button-minimize *ngIf="canMinimize" (click)="minimizeWindow()"></app-button-minimize>
        <app-button-close *ngIf="canHide" (click)="hideWindow()"></app-button-close>
      </mat-toolbar>

      <div class="window-body" [class.hidden]="minimized">
        <ng-template [ngTemplateOutlet]="body"></ng-template>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .window {
    position: absolute;
  }

  .window.active {
    z-index: 1000;
  }

  .window.minimized {
    max-height: 32px;
  }

  .window-header {
    display: flex;
  }

  .window-header span {
    flex: 1;
  }
  `]
})
export class WindowComponent implements OnInit {

  @Output() public hide = new EventEmitter();
  @Output() public minimize = new EventEmitter();

  @Input() public windowName = '';
  @Input() public canHide = false;
  @Input() public canMinimize = false;

  @Input() public head: TemplateRef<any>;
  @Input() public body: TemplateRef<any>;

  @Input() public defaultX: number;
  @Input() public defaultY: number;
  @Input() public defaultWidth: number|string;
  @Input() public defaultHeight: number|string;

  @Input() public canDrag = true;

  @Select(SettingsState.activeWindow) public activeWindow$: Observable<string>;

  public window$: Observable<any>;
  public minimized: boolean;

  public get width() {
    if (!this.defaultWidth) return 'auto';
    return this.defaultWidth + 'px';
  }

  public get height() {
    if (!this.defaultHeight) return 'auto';
    return this.defaultHeight + 'px';
  }

  constructor(private store: Store) { }

  ngOnInit() {
    const opts: any = { x: this.defaultX, y: this.defaultY };
    if (this.defaultWidth) opts.width = this.defaultWidth;
    if (this.defaultHeight) opts.height = this.defaultHeight;

    this.store.dispatch(new UpdateWindowPosition(this.windowName, opts));
    this.window$ = this.store.select(SettingsState.window).pipe(map(x => x(this.windowName)));
  }

  minimizeWindow() {
    this.minimized = !this.minimized;
    this.minimize.next(this.minimized);
  }

  hideWindow() {
    this.hide.next();
  }

  async makeActive() {
    this.store.dispatch(new SetActiveWindow(this.windowName));
  }

}
