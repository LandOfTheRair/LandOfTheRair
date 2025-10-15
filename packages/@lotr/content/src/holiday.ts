import type { Holiday } from '@lotr/interfaces';
import { coreHolidayDescs } from './core';

let holidayHash: Partial<
  Record<
    Holiday,
    { name: string; text: string; duration: string; month: number }
  >
> = {};

export function holidaysLoadForGame() {
  holidayHash = coreHolidayDescs();
}

export function isHoliday(hol: Holiday): boolean {
  if (!holidayHash || !holidayHash[hol]) return false;
  return new Date().getMonth() === holidayHash[hol].month;
}

export function isAnyHoliday(): boolean {
  return Object.keys(holidayHash)
    .map((hol) => isHoliday(hol as Holiday))
    .some(Boolean);
}

export function currentHoliday(): Holiday {
  let holiday = '';

  // we do this in case we have sub-holidays, ie, new years is the last week of christmas (for example)
  Object.keys(holidayHash).forEach((checkHoliday) => {
    if (!isHoliday(checkHoliday as Holiday)) return;
    holiday = checkHoliday;
  });

  return holiday as Holiday;
}
