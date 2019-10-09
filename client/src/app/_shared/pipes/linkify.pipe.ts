import { Pipe, PipeTransform } from '@angular/core';
import linkify from 'linkifyjs/string';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {
  transform(message: string): string {
    if (!message) return '';
    return linkify(message);
  }
}
