
import { ElementRef } from '@angular/core';

export class DomHelper {

    public static matches(element: any, selectorName: string): boolean {

        const proto: any = Element.prototype;

        const func =
            proto.matches ||
            proto.matchesSelector ||
            proto.mozMatchesSelector ||
            proto.msMatchesSelector ||
            proto.oMatchesSelector ||
            proto.webkitMatchesSelector;

        return func.call(element, selectorName);
    }

    public static addClass(elementRef: ElementRef | any, className: string) {

        const e = this.getElementWithValidClassList(elementRef);

        if (e) {
            e.classList.add(className);
        }
    }

    public static removeClass(elementRef: ElementRef | any, className: string) {

        const e = this.getElementWithValidClassList(elementRef);

        if (e) {
            e.classList.remove(className);
        }
    }

    private static getElementWithValidClassList(elementRef: ElementRef) {

        const e = elementRef instanceof ElementRef ? elementRef.nativeElement : elementRef;

        if (e.classList !== undefined && e.classList !== null) {
            return e;
        }

        return null;
    }
}
