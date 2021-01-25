import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UpdateWindowPosition } from '../../../stores';
import { OptionsService } from '../../services/options.service';

@Directive({
  selector: '[appDraggableWindow]'
})
export class DraggableDirective implements OnInit {
  private topStart = 0;
  private leftStart = 0;
  private isDragAllowed = true;
  private md = false;
  private handle: HTMLElement = null;

  private updates = new Subject();

  @Input('appDraggableWindow')
  set allowDrag(value: boolean) {
    this.isDragAllowed = value;
  }

  @Input()
  set windowHandle(handle: HTMLElement) {
    this.handle = handle;

    if (this.isDragAllowed) {
      this.handle.className += ' cursor-draggable';
    } else {
      this.handle.className = this.handle.className.replace(' cursor-draggable', '');
    }
  }

  @Input()
  public windowName: string;

  @Input()
  public set windowLocation(data) {
    if (!data) return;

    const { x, y } = data;
    this.setElementCoords(y, x);
  }

  constructor(
    private optionsService: OptionsService,
    public store: Store,
    public element: ElementRef
  ) {}

  ngOnInit() {
    // css changes
    if (this.isDragAllowed) {
      this.handle.style.position = 'relative';
      this.handle.className += ' cursor-draggable';
    }

    this.updates.pipe(debounceTime(500))
      .subscribe(({ top, left }: any) => this.dispatchElementCoordinates(top, left));
  }

  private dispatchElementCoordinates(top, left) {
    this.store.dispatch(new UpdateWindowPosition(this.windowName, { x: left, y: top }, true));
  }

  private saveCoordinates(top, left) {
    if (!this.windowName) return;

    this.updates.next({ top, left });
  }

  private setElementCoords(top, left) {
    this.saveCoordinates(top, left);
    this.element.nativeElement.style.top = `${top}px`;
    this.element.nativeElement.style.left = `${left}px`;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // prevents right click drag
    if (event.button === 2 || (this.handle !== undefined && event.target !== this.handle)) return;

    this.md = true;
    this.topStart = event.clientY - this.element.nativeElement.style.top.replace('px', '');
    this.leftStart = event.clientX - this.element.nativeElement.style.left.replace('px', '');
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp() {
    this.md = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.optionsService.lockWindows) return;

    if (this.md && this.isDragAllowed) {
      event.preventDefault();
      event.stopPropagation();
      this.setElementCoords(event.clientY - this.topStart, event.clientX - this.leftStart);
    }
  }

  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave() {
    this.md = false;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event) {
    this.md = true;
    this.topStart = event.changedTouches[0].clientY - this.element.nativeElement.style.top.replace('px', '');
    this.leftStart = event.changedTouches[0].clientX - this.element.nativeElement.style.left.replace('px', '');
    event.stopPropagation();
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd() {
    this.md = false;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event) {
    if (this.md && this.isDragAllowed) {
      this.setElementCoords(event.changedTouches[0].clientY - this.topStart, event.changedTouches[0].clientX - this.leftStart);
    }
    event.stopPropagation();
  }

}
