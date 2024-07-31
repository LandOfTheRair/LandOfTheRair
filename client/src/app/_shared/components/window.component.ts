import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { select, Store } from '@ngxs/store';
import {
  HideWindow,
  SetActiveWindow,
  SetDefaultWindowPosition,
  SettingsState,
  UpdateWindowPosition,
} from '../../../stores';

@Component({
  selector: 'app-window',
  template: `
    @let windowProps = currentWindowProps();
    <div>
      <div
        class="window"
        [class.active]="alwaysOnTop() || activeWindow() === windowName()"
        [class.hidden]="willNotHide() ? false : windowProps.hidden"
        [class.minimized]="minimized()"
        [class.always-on-top]="alwaysOnTop()"
        [style.top]="windowProps.y + 'px'"
        [style.left]="windowProps.x + 'px'"
        [style.width]="width()"
        [style.height]="height()"
        [appDraggableWindow]="canDrag()"
        [windowHandle]="windowDrag"
        [windowName]="windowName()"
        (mousedown)="makeActive()"
      >
        <mat-toolbar class="window-header">
          <span #windowDrag class="window-drag">
            <ng-template [ngTemplateOutlet]="head()"></ng-template>
          </span>
          @if (canMinimize()) {
          <app-button-minimize (click)="minimizeWindow()"></app-button-minimize>
          }

          <!-- -->
          @if (canHide()) {
          <app-button-close (click)="hideWindow()"></app-button-close>
          }
        </mat-toolbar>
        @if (!windowProps.hidden) {
        <div
          class="window-body"
          [class.hidden]="minimized()"
          [class.can-scroll]="canScroll()"
        >
          <ng-template [ngTemplateOutlet]="body()"></ng-template>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowComponent implements OnInit {
  private store = inject(Store);

  public activeWindow = select(SettingsState.activeWindow);
  public getWindowProps = select(SettingsState.window);

  public currentWindowProps = computed(() =>
    this.getWindowProps()(this.windowName()),
  );

  public hide = output();
  public minimize = output<boolean>();

  public windowName = input.required<string>();
  public canHide = input<boolean>(false);
  public canMinimize = input<boolean>(false);
  public canScroll = input<boolean>(false);
  public willNotHide = input<boolean>(false);
  public initialHide = input<boolean>(false);
  public alwaysOnTop = input<boolean>(false);

  public head = input<TemplateRef<any>>();
  public body = input<TemplateRef<any>>();

  public defaultX = input<number>();
  public defaultY = input<number>();
  public defaultWidth = input<number | string>();
  public defaultHeight = input<number | string>();

  public canDrag = input<boolean>(true);

  public minimized = signal<boolean>(false);

  public width = computed(() => {
    if (!this.defaultWidth()) return 'auto';
    return this.defaultWidth() + 'px';
  });

  public height = computed(() => {
    if (!this.defaultHeight()) return 'auto';
    return this.defaultHeight() + 'px';
  });

  ngOnInit() {
    const opts: any = {
      x: this.defaultX(),
      y: this.defaultY(),
      hidden: this.initialHide(),
    };
    if (this.defaultWidth()) opts.width = this.defaultWidth();
    if (this.defaultHeight()) opts.height = this.defaultHeight();

    this.store.dispatch(
      new SetDefaultWindowPosition(this.windowName(), {
        x: this.defaultX(),
        y: this.defaultY(),
      }),
    );
    this.store.dispatch(new UpdateWindowPosition(this.windowName(), opts));
  }

  minimizeWindow() {
    this.minimized.set(!this.minimized());
    this.minimize.emit(this.minimized());
  }

  hideWindow() {
    this.hide.emit();
    this.store.dispatch(new HideWindow(this.windowName()));
  }

  async makeActive() {
    this.store.dispatch(new SetActiveWindow(this.windowName()));
  }
}
