
/* eslint-disable */

import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { DomHelper } from './dom-helper';
import { NgDragDropService } from './dragdrop.service';

@Directive({
    selector: '[draggable]'
})
export class DraggableDirective implements OnInit, OnDestroy {
    @Input() dragData;

    @Input() dragHandle: string;

    @Input() dragEffect = 'move';

    @Input() dragScope: string | Array<string> = 'default';

    @Input() dragHandleClass = 'drag-handle';

    @Input() dragClass = 'drag-border';

    @Input() dragTransitClass = 'drag-transit';

    @Input() set dragImage(value: string) {
        this._dragImage = value;
        this.dragImageElement = new Image();
        this.dragImageElement.src = this.dragImage;
    }

    get dragImage() {
        return this._dragImage;
    }

    @HostBinding('draggable')
    @Input() set dragEnabled(value: boolean) {
        this._dragEnabled = value;
        this.applyDragHandleClass();
    }

    get dragEnabled() {
        return this._dragEnabled;
    }

    @Output() onDragStart: EventEmitter<any> = new EventEmitter();

    @Output() onDrag: EventEmitter<any> = new EventEmitter();

    @Output() onDragEnd: EventEmitter<any> = new EventEmitter();

    mouseDownElement: any;

    _dragEnabled = true;

    _dragImage: string;

    dragImageElement: HTMLImageElement;

    unbindDragListener: () => void;

    constructor(protected el: ElementRef, private renderer: Renderer2,
                private ng2DragDropService: NgDragDropService, private zone: NgZone) {
    }

    ngOnInit() {
        this.applyDragHandleClass();
    }

    ngOnDestroy() {
        this.unbindDragListeners();
    }

    @HostListener('dragstart', ['$event'])
    dragStart(e) {
        if (this.allowDrag()) {

            // This is a kludgy approach to apply CSS to the drag helper element when an image is being dragged.
            DomHelper.addClass(this.el, this.dragTransitClass);
            setTimeout(() => {
                DomHelper.addClass(this.el, this.dragClass);
                DomHelper.removeClass(this.el, this.dragTransitClass);
            }, 10);

            this.ng2DragDropService.dragData = this.dragData;
            this.ng2DragDropService.scope = this.dragScope;

            // Firefox requires setData() to be called otherwise the drag does not work.
            // We don't use setData() to transfer data anymore so this is just a dummy call.
            if (e.dataTransfer != null) {
                e.dataTransfer.setData('text', '');
            }

            // Set dragImage
            if (this.dragImage) {
                e.dataTransfer.setDragImage(this.dragImageElement, 0, 0);
            }

            e.stopPropagation();
            this.onDragStart.emit(e);
            this.ng2DragDropService.onDragStart.next(null);

            this.zone.runOutsideAngular(() => {
                this.unbindDragListener = this.renderer.listen(this.el.nativeElement, 'drag', (dragEvent) => {
                    this.drag(dragEvent);
                });
            });
        } else {
            e.preventDefault();
        }
    }

    drag(e) {
        this.onDrag.emit(e);
    }

    @HostListener('dragend', ['$event'])
    dragEnd(e) {
        this.unbindDragListeners();
        DomHelper.removeClass(this.el, this.dragClass);
        this.ng2DragDropService.onDragEnd.next(null);
        this.onDragEnd.emit(e);
        e.stopPropagation();
        e.preventDefault();
    }

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    mousedown(e) {
        this.mouseDownElement = e.target;
    }

    private allowDrag() {
        if (this.dragHandle) {
            return DomHelper.matches(this.mouseDownElement, this.dragHandle) && this.dragEnabled;
        } else {
            return this.dragEnabled;
        }
    }

    private applyDragHandleClass() {
        const dragElement = this.getDragHandleElement();

        if (!dragElement) {
            return;
        }

        if (this.dragEnabled) {
            DomHelper.addClass(dragElement, this.dragHandleClass);
        } else {
            DomHelper.removeClass(this.el, this.dragHandleClass);
        }
    }

    private getDragHandleElement() {
        let dragElement = this.el;
        if (this.dragHandle) {
            dragElement = this.el.nativeElement.querySelector(this.dragHandle);
        }

        return dragElement;
    }

    unbindDragListeners() {
        if (this.unbindDragListener) {
            this.unbindDragListener();
        }
    }
}
