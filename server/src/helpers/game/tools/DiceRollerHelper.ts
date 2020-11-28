
import { Injectable } from 'injection-js';
import { random, sum } from 'lodash';

import { BaseService } from '../../../interfaces';

@Injectable()
export class DiceRollerHelper extends BaseService {

  public init() {}

  // an X in Y chance - eg, a 5 in 100
  XInY(myDesiredRollMax: number, myDesiredCap: number): boolean {
    return random(0, myDesiredCap) < myDesiredRollMax;
  }

  // X in one hundred, eg, 1 in 100
  XInOneHundred(myDesiredRollMax: number): boolean {
    return this.XInY(myDesiredRollMax, 100);
  }

  // a one in X chance, eg, 1 in 5
  OneInX(x: number): boolean {
    return random(1, x) === 1;
  }

  // a somewhat uniform roll between x and y
  uniformRoll(x: number, y: number): number {
    return random(x * y) + x;
  }

  // "dice roll" - close enough - roll dice and sum the values
  diceRoll(rolls: number, sides: number, minimumMult = 0): number {
    return sum(Array(rolls).fill(0).map(() => random(Math.floor(sides * minimumMult), sides)));
  }

}
