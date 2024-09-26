import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { combineLatest, fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { UpdateWindowPosition } from '../../../stores';
import { OptionsService } from '../../services/options.service';

@Directive({
  selector: '[appDraggableWindow]',
})
export class DraggableDirective implements OnInit, OnDestroy {
  private optionsService = inject(OptionsService);
  public store = inject(Store);
  public element = inject(ElementRef);

  private destroy$ = new Subject<void>();

  public isDragAllowed = input<boolean>(true, { alias: 'appDraggableWindow' });
  public windowHandle = input<HTMLElement>();
  public windowName = input<string>();
  public windowLocation = input<Position>();

  constructor() {
    effect(() => {
      const handle = this.windowHandle();

      if (this.isDragAllowed()) {
        handle.style.position = 'relative';
        handle.className += ' cursor-draggable';
      } else {
        handle.className = handle.className.replace(' cursor-draggable', '');
      }
    });

    effect(() => {
      const windowLoc = this.windowLocation();
      if (!windowLoc) return;

      this.setNativeCoords(windowLoc);
    });
  }

  ngOnInit(): void {
    const mouseToMoveData = (mouse: MouseEvent) =>
      ({
        event: mouse,
        x: mouse.clientX,
        y: mouse.clientY,
        target: mouse.target,
        button: mouse.button,
      } as PositionEvent);

    const touchToMoveData = (touch: TouchEvent) =>
      ({
        event: touch,
        x: touch.changedTouches[0].clientX,
        y: touch.changedTouches[0].clientY,
        target: touch.target,
        button: 1,
      } as PositionEvent);

    const nativeElement = this.element.nativeElement;

    const mousedown$ = fromEvent<MouseEvent>(nativeElement, 'mousedown').pipe(
      map(mouseToMoveData),
    );
    const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
      map(mouseToMoveData),
    );
    const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
      map(mouseToMoveData),
    );
    const mouseleave$ = fromEvent<MouseEvent>(document.body, 'mouseleave').pipe(
      map(mouseToMoveData),
    );

    const touchstart$ = fromEvent<TouchEvent>(nativeElement, 'touchstart').pipe(
      map(touchToMoveData),
    );
    const touchmove$ = fromEvent<TouchEvent>(document, 'touchmove').pipe(
      map(touchToMoveData),
    );
    const touchend$ = fromEvent<TouchEvent>(nativeElement, 'touchend').pipe(
      map(touchToMoveData),
    );

    const arrow$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter((arr) =>
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(arr.code),
      ),
    );

    const startmove$ = merge(mousedown$, touchstart$);
    const movemove$ = merge(mousemove$, touchmove$);
    const endmove$ = merge(mouseup$, touchend$, mouseleave$);

    combineLatest({ start: startmove$, arrow: arrow$ })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ start, arrow }) => {
        if (this.optionsService.lockWindows) return;
        if (!this.isDragAllowed()) return;
        if (
          start.button === 2 ||
          (this.windowHandle() !== undefined &&
            start.target !== this.windowHandle())
        ) {
          return;
        }

        if (arrow) {
          const mod = { x: 0, y: 0 };
          switch (arrow.code) {
            case 'ArrowUp': {
              mod.y = -1;
              break;
            }
            case 'ArrowDown': {
              mod.y = 1;
              break;
            }
            case 'ArrowLeft': {
              mod.x = -1;
              break;
            }
            case 'ArrowRight': {
              mod.x = 1;
              break;
            }
          }

          const position = this.getNativeCoords();
          position.x = +position.x + mod.x;
          position.y = +position.y + mod.y;

          this.store.dispatch(
            new UpdateWindowPosition(this.windowName(), position, true),
          );
        }

        start.event.preventDefault();
        start.event.stopPropagation();

        const windowCoords = this.getNativeCoords();
        const startCoord = this.diff(windowCoords, start);

        endmove$.pipe(takeUntil(this.destroy$)).subscribe((endmove) => {
          endmove.event.preventDefault();
          endmove.event.stopPropagation();
        });

        const pospipe$ = movemove$.pipe(
          takeUntil(endmove$),
          takeUntil(this.destroy$),
          map((moveMove) => {
            moveMove.event.preventDefault();
            moveMove.event.stopPropagation();
            return this.clampWindow(this.diff(startCoord, moveMove));
          }),
        );

        pospipe$.subscribe((position) => {
          this.setNativeCoords(position);
        });

        pospipe$.pipe(debounceTime(200)).subscribe((position) => {
          this.store.dispatch(
            new UpdateWindowPosition(this.windowName(), position, true),
          );
        });
      });
  }

  private clampWindow(pos: Position) {
    const native = this.element.nativeElement as any;
    const maxWidth = window.innerWidth - native.offsetWidth;
    const maxHeight = window.innerHeight - native.offsetHeight;
    if (pos.x < 0) pos.x = 0;
    if (pos.y < 0) pos.y = 0;
    if (pos.x > maxWidth) pos.x = maxWidth;
    if (pos.y > maxHeight) pos.y = maxHeight;
    return pos;
  }

  private diff(end: Position, start: Position) {
    return { x: start.x - end.x, y: start.y - end.y };
  }

  private setNativeCoords(pos: Position): void {
    this.element.nativeElement.style.left = `${pos.x}px`;
    this.element.nativeElement.style.top = `${pos.y}px`;
  }

  private getNativeCoords(): Position {
    return {
      x: this.element.nativeElement.style.left.replace('px', ''),
      y: this.element.nativeElement.style.top.replace('px', ''),
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

interface Position {
  x: number;
  y: number;
}

interface PositionEvent extends Position {
  event: any;
  target: EventTarget;
  button: number;
}
