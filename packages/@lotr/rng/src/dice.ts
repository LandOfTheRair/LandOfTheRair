import { getStat } from '@lotr/characters';
import { ICharacter, Stat } from '@lotr/interfaces';
import { random } from 'lodash';

// an X in Y chance - eg, a 5 in 100
export function rollInY(
  myDesiredRollMax: number,
  myDesiredCap: number,
): boolean {
  return random(0, myDesiredCap) < myDesiredRollMax;
}

// X in one hundred, eg, 1 in 100
export function rollInOneHundred(myDesiredRollMax: number): boolean {
  if (myDesiredRollMax <= 0) return false;
  return rollInY(myDesiredRollMax, 100);
}

// a one in X chance, eg, 1 in 5
export function oneInX(x: number): boolean {
  if (x <= 0) return false;
  return random(1, x) === 1;
}

// a somewhat uniform roll between x and y
export function uniformRoll(x: number, y: number): number {
  return random(x * y) + x;
}

// "dice roll" - close enough - roll dice and sum the values
export function diceRoll(
  rolls: number,
  sides: number,
  minSidesDivisor = 2,
): number {
  const min = sides / minSidesDivisor;
  const max = sides;

  return rolls * (min + Math.floor(Math.random() * (max - min + 1)));
}

// a one-to-luk roll, which will be used for anything rolling luk
export function oneToStat(char: ICharacter, stat: Stat): number {
  return random(1, getStat(char, stat));
}

export function oneToLUK(char: ICharacter): number {
  return oneToStat(char, Stat.LUK);
}
