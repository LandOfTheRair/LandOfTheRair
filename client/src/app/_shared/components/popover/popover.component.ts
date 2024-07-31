/* eslint-disable @angular-eslint/directive-selector */
/* eslint-disable @angular-eslint/component-selector */
// https://github.com/joejordanbrown/popover

/* eslint-disable @angular-eslint/no-input-rename */
import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE } from '@angular/cdk/keycodes';
import {
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  Overlay,
  OverlayConfig,
  OverlayRef,
  ScrollStrategy,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';

export type MdePopoverPositionX = 'before' | 'after';

export type MdePopoverPositionY = 'above' | 'below';

export type MdePopoverTriggerEvent = 'click' | 'hover' | 'none';

export type MdePopoverScrollStrategy =
  | 'noop'
  | 'close'
  | 'block'
  | 'reposition';

export interface MdePopoverPanel {
  positionX: MdePopoverPositionX;
  positionY: MdePopoverPositionY;
  containerPositioning: boolean;
  overlapTrigger: boolean;
  triggerEvent: MdePopoverTriggerEvent;
  scrollStrategy: MdePopoverScrollStrategy;
  enterDelay: number;
  leaveDelay: number;
  targetOffsetX: number;
  targetOffsetY: number;
  arrowOffsetX: number;
  arrowWidth: number;
  arrowColor: string;
  closeOnClick: boolean;
  closeDisabled: boolean;
  setCurrentStyles: () => void;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void>;
  zone: NgZone;
  setPositionClasses: (x: MdePopoverPositionX, y: MdePopoverPositionY) => void;
  _emitCloseEvent: () => void;
}

export interface MdePopoverConfig {
  positionX: MdePopoverPositionX;
  positionY: MdePopoverPositionY;
  overlapTrigger: boolean;
  triggerEvent: MdePopoverTriggerEvent;
  triggerDelay: number;
  targetOffsetX: number;
  targetOffsetY: number;
  arrowOffsetX: number;
  arrowWidth: number;
  arrowColor: string;
  closeOnClick: boolean;
}

export interface MdeTarget {
  _elementRef: ElementRef;
}

export const transformPopover: AnimationTriggerMetadata = trigger(
  'transformPopover',
  [
    state(
      'enter',
      style({
        opacity: 1,
        transform: `scale(1)`,
      }),
    ),
    transition('void => *', [
      style({
        opacity: 0,
        transform: `scale(0)`,
      }),
      animate(`200ms cubic-bezier(0.25, 0.8, 0.25, 1)`),
    ]),
    transition('* => void', [
      animate('50ms 100ms linear', style({ opacity: 0 })),
    ]),
  ],
);

/**
 * Throws an exception for the case when popover trigger doesn't have a valid mde-popover instance
 */
export function throwMdePopoverMissingError() {
  throw Error(`mde-popover-trigger: must pass in an mde-popover instance.

    Example:
      <mde-popover #popover="mdePopover"></mde-popover>
      <button [mdePopoverTriggerFor]="popover"></button>`);
}

/**
 * Throws an exception for the case when popover's mdePopoverPositionX value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 */
export function throwMdePopoverInvalidPositionX() {
  throw Error(`mdePopoverPositionX value must be either 'before' or after'.
      Example: <mde-popover mdePopoverPositionX="before" #popover="mdePopover"></mde-popover>`);
}

/**
 * Throws an exception for the case when popover's mdePopoverPositionY value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 */
export function throwMdePopoverInvalidPositionY() {
  throw Error(`mdePopoverPositionY value must be either 'above' or below'.
      Example: <mde-popover mdePopoverPositionY="above" #popover="mdePopover"></mde-popover>`);
}

@Component({
  selector: 'mde-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [transformPopover],
  exportAs: 'mdePopover',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MdePopover implements MdePopoverPanel, OnDestroy {
  @HostBinding('attr.role') role = 'dialog';

  /** Settings for popover, view setters and getters for more detail */
  private _positionX: MdePopoverPositionX = 'after';
  private _positionY: MdePopoverPositionY = 'below';
  private _triggerEvent: MdePopoverTriggerEvent = 'hover';
  private _scrollStrategy: MdePopoverScrollStrategy = 'reposition';
  private _enterDelay = 200;
  private _leaveDelay = 200;
  private _overlapTrigger = true;
  private _disableAnimation = false;
  private _targetOffsetX = 0;
  private _targetOffsetY = 0;
  private _arrowOffsetX = 20;
  private _arrowWidth = 8;
  private _arrowColor = 'rgba(0, 0, 0, 0.12)';
  private _closeOnClick = true;
  private _focusTrapEnabled = true;
  private _focusTrapAutoCaptureEnabled = true;

  /** Config object to be passed into the popover's ngClass */
  _classList: { [key: string]: boolean } = {};

  // TODO: Write comment description
  /** */
  public containerPositioning = false;

  /** Closing disabled on popover */
  public closeDisabled = false;

  /** Config object to be passed into the popover's arrow ngStyle */
  public popoverPanelStyles: {};

  /** Config object to be passed into the popover's arrow ngStyle */
  public popoverArrowStyles: {};

  /** Config object to be passed into the popover's content ngStyle */
  public popoverContentStyles: {};

  /** Emits the current animation state whenever it changes. */
  _onAnimationStateChange = new EventEmitter<AnimationEvent>();

  /** Position of the popover in the X axis. */
  @Input('mdePopoverPositionX')
  get positionX() {
    return this._positionX;
  }
  set positionX(value: MdePopoverPositionX) {
    if (value !== 'before' && value !== 'after') {
      throwMdePopoverInvalidPositionX();
    }
    this._positionX = value;
    this.setPositionClasses();
  }

  /** Position of the popover in the Y axis. */
  @Input('mdePopoverPositionY')
  get positionY() {
    return this._positionY;
  }
  set positionY(value: MdePopoverPositionY) {
    if (value !== 'above' && value !== 'below') {
      throwMdePopoverInvalidPositionY();
    }
    this._positionY = value;
    this.setPositionClasses();
  }

  /** Popover trigger event */
  @Input('mdePopoverTriggerOn')
  get triggerEvent(): MdePopoverTriggerEvent {
    return this._triggerEvent;
  }
  set triggerEvent(value: MdePopoverTriggerEvent) {
    this._triggerEvent = value;
  }

  /** Popover scroll strategy */
  @Input('mdePopoverScrollStrategy')
  get scrollStrategy(): MdePopoverScrollStrategy {
    return this._scrollStrategy;
  }
  set scrollStrategy(value: MdePopoverScrollStrategy) {
    this._scrollStrategy = value;
  }

  /** Popover enter delay */
  @Input('mdePopoverEnterDelay')
  get enterDelay(): number {
    return this._enterDelay;
  }
  set enterDelay(value: number) {
    this._enterDelay = value;
  }

  /** Popover leave delay */
  @Input('mdePopoverLeaveDelay')
  get leaveDelay(): number {
    return this._leaveDelay;
  }
  set leaveDelay(value: number) {
    this._leaveDelay = value;
  }

  /** Popover overlap trigger */
  @Input('mdePopoverOverlapTrigger')
  get overlapTrigger(): boolean {
    return this._overlapTrigger;
  }
  set overlapTrigger(value: boolean) {
    this._overlapTrigger = value;
  }

  /** Popover target offset x */
  @Input('mdePopoverOffsetX')
  get targetOffsetX(): number {
    return this._targetOffsetX;
  }
  set targetOffsetX(value: number) {
    this._targetOffsetX = value;
  }

  /** Popover target offset y */
  @Input('mdePopoverOffsetY')
  get targetOffsetY(): number {
    return this._targetOffsetY;
  }
  set targetOffsetY(value: number) {
    this._targetOffsetY = value;
  }

  /** Popover arrow offset x */
  @Input('mdePopoverArrowOffsetX')
  get arrowOffsetX(): number {
    return this._arrowOffsetX;
  }
  set arrowOffsetX(value: number) {
    this._arrowOffsetX = value;
  }

  /** Popover arrow width */
  @Input('mdePopoverArrowWidth')
  get arrowWidth(): number {
    return this._arrowWidth;
  }
  set arrowWidth(value: number) {
    this._arrowWidth = value;
  }

  /** Popover arrow color */
  @Input('mdePopoverArrowColor')
  get arrowColor(): string {
    return this._arrowColor;
  }
  set arrowColor(value: string) {
    this._arrowColor = value;
  }

  /**
   * Popover container close on click
   * default: true
   */
  @Input('mdePopoverCloseOnClick')
  get closeOnClick(): boolean {
    return this._closeOnClick;
  }
  set closeOnClick(value: boolean) {
    this._closeOnClick = coerceBooleanProperty(value);
  }

  /**
   * Disable animations of popover and all child elements
   * default: false
   */
  @Input('mdePopoverDisableAnimation')
  get disableAnimation(): boolean {
    return this._disableAnimation;
  }
  set disableAnimation(value: boolean) {
    this._disableAnimation = coerceBooleanProperty(value);
  }

  /**
   * Popover focus trap using cdkTrapFocus
   * default: true
   */
  @Input('mdeFocusTrapEnabled')
  get focusTrapEnabled(): boolean {
    return this._focusTrapEnabled;
  }
  set focusTrapEnabled(value: boolean) {
    this._focusTrapEnabled = coerceBooleanProperty(value);
  }

  /**
   * Popover focus trap auto capture using cdkTrapFocusAutoCapture
   * default: true
   */
  @Input('mdeFocusTrapAutoCaptureEnabled')
  get focusTrapAutoCaptureEnabled(): boolean {
    return this._focusTrapAutoCaptureEnabled;
  }
  set focusTrapAutoCaptureEnabled(value: boolean) {
    this._focusTrapAutoCaptureEnabled = coerceBooleanProperty(value);
  }

  /**
   * This method takes classes set on the host md-popover element and applies them on the
   * popover template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing popover from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set panelClass(classes: string) {
    if (classes && classes.length) {
      this._classList = classes
        .split(' ')
        .reduce((obj: any, className: string) => {
          obj[className] = true;
          return obj;
        }, {});

      this._elementRef.nativeElement.className = '';
      this.setPositionClasses();
    }
  }

  /**
   * This method takes classes set on the host md-popover element and applies them on the
   * popover template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing popover from outside the component.
   * @deprecated Use `panelClass` instead.
   */
  @Input()
  get classList(): string {
    return this.panelClass;
  }
  set classList(classes: string) {
    this.panelClass = classes;
  }

  /** Event emitted when the popover is closed. */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<void>();

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  private _elementRef = inject(ElementRef);
  public zone = inject(NgZone);

  constructor() {
    this.setPositionClasses();
  }

  ngOnDestroy() {
    this._emitCloseEvent();
    this.close.complete();
  }

  /** Handle a keyboard event from the popover, delegating to the appropriate action. */
  _handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case ESCAPE:
        this._emitCloseEvent();
        return;
    }
  }

  /**
   * This emits a close event to which the trigger is subscribed. When emitted, the
   * trigger will close the popover.
   */
  _emitCloseEvent(): void {
    this.close.emit();
  }

  /** Close popover on click if closeOnClick is true */
  onClick() {
    if (this.closeOnClick) {
      this._emitCloseEvent();
    }
  }

  /**
   * TODO: Refactor when @angular/cdk includes feature I mentioned on github see link below.
   * https://github.com/angular/material2/pull/5493#issuecomment-313085323
   */
  /** Disables close of popover when leaving trigger element and mouse over the popover */
  onMouseOver() {
    if (this.triggerEvent === 'hover') {
      this.closeDisabled = true;
    }
  }
  /** Enables close of popover when mouse leaving popover element */
  onMouseLeave() {
    if (this.triggerEvent === 'hover') {
      this.closeDisabled = false;
      this._emitCloseEvent();
    }
  }

  // TODO: Refactor how styles are set and updated on the component, use best practices.
  // TODO: If arrow left and right positioning is requested, see if flex direction can be used to work with order.
  /** Sets the current styles for the popover to allow for dynamically changing settings */
  setCurrentStyles() {
    // TODO: See if arrow position can be calculated automatically and allow override.
    // TODO: See if flex order is a better alternative to position arrow top or bottom.
    this.popoverArrowStyles = {
      right:
        this.positionX === 'before'
          ? this.arrowOffsetX - this.arrowWidth + 'px'
          : '',
      left:
        this.positionX === 'after'
          ? this.arrowOffsetX - this.arrowWidth + 'px'
          : '',
      'border-top':
        this.positionY === 'below'
          ? this.arrowWidth + 'px solid ' + this.arrowColor
          : '0px solid transparent',
      'border-right':
        'undefined' === undefined
          ? this.arrowWidth + 'px solid ' + this.arrowColor
          : this.arrowWidth + 'px solid transparent',
      'border-bottom':
        this.positionY === 'above'
          ? this.arrowWidth + 'px solid ' + this.arrowColor
          : this.arrowWidth + 'px solid transparent',
      'border-left':
        'undefined' === undefined
          ? this.arrowWidth + 'px solid ' + this.arrowColor
          : this.arrowWidth + 'px solid transparent',
    };

    // TODO: Remove if flex order is added.
    this.popoverContentStyles = {
      'padding-top':
        this.overlapTrigger === true ? '0px' : this.arrowWidth + 'px',
      'padding-bottom':
        this.overlapTrigger === true ? '0px' : this.arrowWidth + 'px',
      'margin-top':
        this.overlapTrigger === false &&
        this.positionY === 'below' &&
        this.containerPositioning === false
          ? -(this.arrowWidth * 2) + 'px'
          : '0px',
    };
  }

  /**
   * It's necessary to set position-based classes to ensure the popover panel animation
   * folds out from the correct direction.
   */
  setPositionClasses(posX = this.positionX, posY = this.positionY): void {
    this._classList['mde-popover-before'] = posX === 'before';
    this._classList['mde-popover-after'] = posX === 'after';
    this._classList['mde-popover-above'] = posY === 'above';
    this._classList['mde-popover-below'] = posY === 'below';
  }
}

@Directive({
  selector: '[mdePopoverTriggerFor]',
  exportAs: 'mdePopoverTrigger',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MdePopoverTrigger implements AfterViewInit, OnDestroy {
  @HostBinding('attr.aria-haspopup') ariaHaspopup = true;

  popoverOpened = new Subject<void>();
  popoverClosed = new Subject<void>();

  private _portal: TemplatePortal<any>;
  private _overlayRef: OverlayRef | null = null;
  private _popoverOpen = false;
  private _halt = false;
  private _backdropSubscription: Subscription;
  private _positionSubscription: Subscription;
  private _detachmentsSubscription: Subscription;

  private _mouseoverTimer: any;

  // tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the popover is opened via the keyboard
  private _openedByMouse = false;

  private _onDestroy = new Subject<void>();

  /** References the popover instance that the trigger is associated with. */
  @Input('mdePopoverTriggerFor') popover: MdePopoverPanel;

  /** References the popover target instance that the trigger is associated with. */
  @Input('mdePopoverTargetAt') targetElement: MdeTarget;

  /** Position of the popover in the X axis */
  @Input('mdePopoverPositionX') positionX: MdePopoverPositionX;

  /** Position of the popover in the Y axis */
  @Input('mdePopoverPositionY') positionY: MdePopoverPositionY;

  /** Popover trigger event */
  @Input('mdePopoverTriggerOn') triggerEvent: MdePopoverTriggerEvent;

  /** Popover delay */
  @Input('mdePopoverEnterDelay') enterDelay: number;

  /** Popover delay */
  @Input('mdePopoverLeaveDelay') leaveDelay: number;

  /** Popover overlap trigger */
  @Input('mdePopoverOverlapTrigger') overlapTrigger: boolean;

  /** Popover target offset x */
  @Input('mdePopoverOffsetX') targetOffsetX: number;

  /** Popover target offset y */
  @Input('mdePopoverOffsetY') targetOffsetY: number;

  /** Popover arrow offset x */
  @Input('mdePopoverArrowOffsetX') arrowOffsetX: number;

  /** Popover arrow width */
  @Input('mdePopoverArrowWidth') arrowWidth: number;

  /** Popover arrow color */
  @Input('mdePopoverArrowColor') arrowColor: string;

  /** Popover container close on click */
  @Input('mdePopoverCloseOnClick') closeOnClick: boolean;

  /** Popover backdrop close on click */
  @Input('mdePopoverBackdropCloseOnClick') backdropCloseOnClick = true;

  /** Event emitted when the associated popover is opened. */
  @Output() opened = new EventEmitter<void>();

  /** Event emitted when the associated popover is closed. */
  @Output() closed = new EventEmitter<void>();

  constructor(
    private _overlay: Overlay,
    public _elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef,
    @Optional() private _dir: Directionality,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this._checkPopover();
    this._setCurrentConfig();
    this.popover.close.subscribe(() => this.closePopover());
  }

  ngOnDestroy() {
    this.destroyPopover();
  }

  private _setCurrentConfig() {
    if (this.positionX === 'before' || this.positionX === 'after') {
      this.popover.positionX = this.positionX;
    }

    if (this.positionY === 'above' || this.positionY === 'below') {
      this.popover.positionY = this.positionY;
    }

    if (this.triggerEvent) {
      this.popover.triggerEvent = this.triggerEvent;
    }

    if (this.enterDelay) {
      this.popover.enterDelay = this.enterDelay;
    }

    if (this.leaveDelay) {
      this.popover.leaveDelay = this.leaveDelay;
    }

    if (this.overlapTrigger === true || this.overlapTrigger === false) {
      this.popover.overlapTrigger = this.overlapTrigger;
    }

    if (this.targetOffsetX) {
      this.popover.targetOffsetX = this.targetOffsetX;
    }

    if (this.targetOffsetY) {
      this.popover.targetOffsetY = this.targetOffsetY;
    }

    if (this.arrowOffsetX) {
      this.popover.arrowOffsetX = this.arrowOffsetX;
    }

    if (this.arrowWidth) {
      this.popover.arrowWidth = this.arrowWidth;
    }

    if (this.arrowColor) {
      this.popover.arrowColor = this.arrowColor;
    }

    if (this.closeOnClick === true || this.closeOnClick === false) {
      this.popover.closeOnClick = this.closeOnClick;
    }

    this.popover.setCurrentStyles();
  }

  /** Whether the popover is open. */
  get popoverOpen(): boolean {
    return this._popoverOpen;
  }

  @HostListener('click', ['$event'])
  onClick(): void {
    if (this.popover.triggerEvent === 'click') {
      this.togglePopover();
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(): void {
    this._halt = false;
    if (this.popover.triggerEvent === 'hover') {
      this._mouseoverTimer = setTimeout(() => {
        this.openPopover();
      }, this.popover.enterDelay);
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(): void {
    if (this.popover.triggerEvent === 'hover') {
      if (this._mouseoverTimer) {
        clearTimeout(this._mouseoverTimer);
        this._mouseoverTimer = null;
      }
      if (this._popoverOpen) {
        setTimeout(() => {
          if (!this.popover.closeDisabled) {
            this.closePopover();
          }
        }, this.popover.leaveDelay);
      } else {
        this._halt = true;
      }
    }
  }

  /** Toggles the popover between the open and closed states. */
  togglePopover(): void {
    return this._popoverOpen ? this.closePopover() : this.openPopover();
  }

  /** Opens the popover. */
  openPopover(): void {
    if (!this._popoverOpen && !this._halt) {
      this._createOverlay().attach(this._portal);

      this._subscribeToBackdrop();
      this._subscribeToDetachments();

      this._initPopover();
    }
  }

  /** Closes the popover. */
  closePopover(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._resetPopover();
    }
  }

  /** Removes the popover from the DOM. */
  destroyPopover(): void {
    if (this._mouseoverTimer) {
      clearTimeout(this._mouseoverTimer);
      this._mouseoverTimer = null;
    }
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
      this._cleanUpSubscriptions();
    }

    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /** Focuses the popover trigger. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  /** The text direction of the containing app. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /**
   * This method ensures that the popover closes when the overlay backdrop is clicked.
   * We do not use first() here because doing so would not catch clicks from within
   * the popover, and it would fail to unsubscribe properly. Instead, we unsubscribe
   * explicitly when the popover is closed or destroyed.
   */
  private _subscribeToBackdrop(): void {
    if (this._overlayRef) {
      /** Only subscribe to backdrop if trigger event is click */
      if (this.triggerEvent === 'click' && this.backdropCloseOnClick === true) {
        this._overlayRef
          .backdropClick()
          .pipe(takeUntil(this.popoverClosed), takeUntil(this._onDestroy))
          .subscribe(() => {
            this.popover._emitCloseEvent();
          });
      }
    }
  }

  private _subscribeToDetachments(): void {
    if (this._overlayRef) {
      this._overlayRef
        .detachments()
        .pipe(takeUntil(this.popoverClosed), takeUntil(this._onDestroy))
        .subscribe(() => {
          this._setPopoverClosed();
        });
    }
  }

  /**
   * This method sets the popover state to open and focuses the first item if
   * the popover was opened via the keyboard.
   */
  private _initPopover(): void {
    this._setPopoverOpened();
  }

  /**
   * This method resets the popover when it's closed, most importantly restoring
   * focus to the popover trigger if the popover was opened via the keyboard.
   */
  private _resetPopover(): void {
    this._setPopoverClosed();

    // Focus only needs to be reset to the host element if the popover was opened
    // by the keyboard and manually shifted to the first popover item.
    if (!this._openedByMouse) {
      this.focus();
    }
    this._openedByMouse = false;
  }

  /** set state rather than toggle to support triggers sharing a popover */
  private _setPopoverOpened(): void {
    if (!this._popoverOpen) {
      this._popoverOpen = true;

      this.popoverOpened.next();
      this.opened.emit();
    }
  }

  /** set state rather than toggle to support triggers sharing a popover */
  private _setPopoverClosed(): void {
    if (this._popoverOpen) {
      this._popoverOpen = false;

      this.popoverClosed.next();
      this.closed.emit();
    }
  }

  /**
   *  This method checks that a valid instance of MdPopover has been passed into
   *  mdPopoverTriggerFor. If not, an exception is thrown.
   */
  private _checkPopover() {
    if (!this.popover) {
      throwMdePopoverMissingError();
    }
  }

  /**
   *  This method creates the overlay from the provided popover's template and saves its
   *  OverlayRef so that it can be attached to the DOM when openPopover is called.
   */
  private _createOverlay(): OverlayRef {
    if (!this._overlayRef) {
      this._portal = new TemplatePortal(
        this.popover.templateRef,
        this._viewContainerRef,
      );
      const config = this._getOverlayConfig();
      this._subscribeToPositions(
        config.positionStrategy as FlexibleConnectedPositionStrategy,
      );
      this._overlayRef = this._overlay.create(config);
    }

    return this._overlayRef;
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayConfig.
   * @returns OverlayConfig
   */
  private _getOverlayConfig(): OverlayConfig {
    const overlayState = new OverlayConfig();
    overlayState.positionStrategy = this._getPosition();

    /** Display overlay backdrop if trigger event is click */
    if (this.triggerEvent === 'click') {
      overlayState.hasBackdrop = true;
      overlayState.backdropClass = 'cdk-overlay-transparent-backdrop';
    }

    overlayState.direction = this.dir;
    overlayState.scrollStrategy = this._getOverlayScrollStrategy(
      this.popover.scrollStrategy,
    );

    return overlayState;
  }

  /**
   * This method returns the scroll strategy used by the cdk/overlay.
   */
  private _getOverlayScrollStrategy(
    strategy: MdePopoverScrollStrategy,
  ): ScrollStrategy {
    switch (strategy) {
      case 'noop':
        return this._overlay.scrollStrategies.noop();
      case 'close':
        return this._overlay.scrollStrategies.close();
      case 'block':
        return this._overlay.scrollStrategies.block();
      case 'reposition':
      default:
        return this._overlay.scrollStrategies.reposition();
    }
  }

  /**
   * Listens to changes in the position of the overlay and sets the correct classes
   * on the popover based on the new position. This ensures the animation origin is always
   * correct, even if a fallback position is used for the overlay.
   */
  private _subscribeToPositions(
    position: FlexibleConnectedPositionStrategy,
  ): void {
    this._positionSubscription = position.positionChanges.subscribe(
      (change) => {
        const posisionX: MdePopoverPositionX =
          change.connectionPair.overlayX === 'start' ? 'after' : 'before';
        let posisionY: MdePopoverPositionY =
          change.connectionPair.overlayY === 'top' ? 'below' : 'above';

        if (!this.popover.overlapTrigger) {
          posisionY = posisionY === 'below' ? 'above' : 'below';
        }

        // required for ChangeDetectionStrategy.OnPush
        this._changeDetectorRef.markForCheck();

        this.popover.zone.run(() => {
          this.popover.positionX = posisionX;
          this.popover.positionY = posisionY;
          this.popover.setCurrentStyles();

          this.popover.setPositionClasses(posisionX, posisionY);
        });
      },
    );
  }

  /**
   * This method builds the position strategy for the overlay, so the popover is properly connected
   * to the trigger.
   * @returns ConnectedPositionStrategy
   */
  private _getPosition(): FlexibleConnectedPositionStrategy {
    const [originX, originFallbackX]: HorizontalConnectionPos[] =
      this.popover.positionX === 'before' ? ['end', 'start'] : ['start', 'end'];

    const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
      this.popover.positionY === 'above'
        ? ['bottom', 'top']
        : ['top', 'bottom'];

    // let originY = overlayY;
    // let fallbackOriginY = overlayFallbackY;

    let originY = overlayY;
    let originFallbackY = overlayFallbackY;

    const overlayX = originX;
    const overlayFallbackX = originFallbackX;

    // let [originY, originFallbackY] = [overlayY, overlayFallbackY];
    // let [overlayX, overlayFallbackX] = [originX, originFallbackX];

    /** Reverse overlayY and fallbackOverlayY when overlapTrigger is false */
    if (!this.popover.overlapTrigger) {
      originY = overlayY === 'top' ? 'bottom' : 'top';
      originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
    }

    let offsetX = 0;
    let offsetY = 0;

    if (
      this.popover.targetOffsetX &&
      !isNaN(Number(this.popover.targetOffsetX))
    ) {
      offsetX = Number(this.popover.targetOffsetX);
      // offsetX = -16;
    }

    if (
      this.popover.targetOffsetY &&
      !isNaN(Number(this.popover.targetOffsetY))
    ) {
      offsetY = Number(this.popover.targetOffsetY);
      // offsetY = -10;
    }

    /**
     * For overriding position element, when mdePopoverTargetAt has a valid element reference.
     * Useful for sticking popover to parent element and offsetting arrow to trigger element.
     * If undefined defaults to the trigger element reference.
     */
    let element = this._elementRef;
    if (typeof this.targetElement !== 'undefined') {
      this.popover.containerPositioning = true;
      element = this.targetElement._elementRef;
    }

    return this._overlay
      .position()
      .flexibleConnectedTo(element)
      .withLockedPosition(true)
      .withPositions([
        {
          originX,
          originY,
          overlayX,
          overlayY,
          offsetY,
        },
        {
          originX: originFallbackX,
          originY,
          overlayX: overlayFallbackX,
          overlayY,
          offsetY,
        },
        {
          originX,
          originY: originFallbackY,
          overlayX,
          overlayY: overlayFallbackY,
          offsetY: -offsetY,
        },
        {
          originX: originFallbackX,
          originY: originFallbackY,
          overlayX: overlayFallbackX,
          overlayY: overlayFallbackY,
          offsetY: -offsetY,
        },
      ])
      .withDefaultOffsetX(offsetX)
      .withDefaultOffsetY(offsetY);
  }

  private _cleanUpSubscriptions(): void {
    if (this._backdropSubscription) {
      this._backdropSubscription.unsubscribe();
    }
    if (this._positionSubscription) {
      this._positionSubscription.unsubscribe();
    }
    if (this._detachmentsSubscription) {
      this._detachmentsSubscription.unsubscribe();
    }
  }

  @HostListener('mousedown', ['$event']) _handleMousedown(
    event: MouseEvent,
  ): void {
    if (event && !isFakeMousedownFromScreenReader(event)) {
      this._openedByMouse = true;
    }
  }
}

@Directive({
  selector: 'mde-popover-target, [mdePopoverTarget]',
  exportAs: 'mdePopoverTarget',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MdePopoverTarget {
  constructor(public _elementRef: ElementRef) {}
}
