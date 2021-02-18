import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HideWindow, SetActiveWindow, SetDefaultWindowPosition, SettingsState, UpdateWindowPosition } from '../../../stores';

@Component({
  selector: 'app-window',
  template: `
  <div *ngIf="(window$ | async) as windowProps">
    <div class="window"
        [class.active]="alwaysOnTop || (activeWindow$ | async) === windowName"
        [class.hidden]="willNotHide ? false : windowProps.hidden"
        [class.minimized]="minimized"
        [class.always-on-top]="alwaysOnTop"

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
        <span #windowDrag class="window-drag">
          <ng-template [ngTemplateOutlet]="head"></ng-template>
        </span>

        <app-button-minimize *ngIf="canMinimize" (click)="minimizeWindow()"></app-button-minimize>
        <app-button-close *ngIf="canHide" (click)="hideWindow()"></app-button-close>
      </mat-toolbar>

      <div class="window-body" [class.hidden]="minimized" [class.can-scroll]="canScroll" *ngIf="!windowProps.hidden">
        <ng-template [ngTemplateOutlet]="body"></ng-template>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .window {
    position: absolute;
    z-index: 1000;
  }

  .window-drag {
    z-index: 1002;
  }

  .window.active {
    z-index: 1001;
  }

  .window.always-on-top {
    z-index: 1002 !important;
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

  .window-body.can-scroll {
    overflow-y: auto;
  }
  `]
})
export class WindowComponent implements OnInit {

  @Output() public hide = new EventEmitter();
  @Output() public minimize = new EventEmitter();

  @Input() public windowName = '';
  @Input() public canHide = false;
  @Input() public canMinimize = false;
  @Input() public willNotHide = false;
  @Input() public initialHide = false;
  @Input() public canScroll = false;
  @Input() public alwaysOnTop = false;

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
    const opts: any = { x: this.defaultX, y: this.defaultY, hidden: this.initialHide };
    if (this.defaultWidth) opts.width = this.defaultWidth;
    if (this.defaultHeight) opts.height = this.defaultHeight;

    this.store.dispatch(new SetDefaultWindowPosition(this.windowName, { x: this.defaultX, y: this.defaultY }));
    this.store.dispatch(new UpdateWindowPosition(this.windowName, opts));
    this.window$ = this.store.select(SettingsState.window).pipe(map(x => x(this.windowName)));
  }

  minimizeWindow() {
    this.minimized = !this.minimized;
    this.minimize.next(this.minimized);
  }

  hideWindow() {
    this.hide.next();
    this.store.dispatch(new HideWindow(this.windowName));
  }

  async makeActive() {
    this.store.dispatch(new SetActiveWindow(this.windowName));
  }

}
