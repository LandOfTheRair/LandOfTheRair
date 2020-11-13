import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'goldify'
})
export class GoldifyPipe implements PipeTransform {
  transform(num: number): string {
    if (num < 1_000_000) {
      return formatNumber(num, 'en');
    } else {
      return (num / 1_000_000).toFixed(3) + ' m';
    }
  }
}
