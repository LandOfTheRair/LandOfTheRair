
import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { BaseService } from '../../../interfaces';

@Injectable()
export class DiceRollerHelper extends BaseService {

  public init() {}

  // dice functions
  XInY(myDesiredRollMax: number, myDesiredCap: number): boolean {
    return random(1, myDesiredCap) <= myDesiredRollMax;
  }

  XInOneHundred(myDesiredRollMax: number): boolean {
    return this.XInY(myDesiredRollMax, 100);
  }

  OneInX(x: number): boolean {
    return random(1, x) === 1;
  }

  uniformRoll(x: number, y: number): number {
    return random(x * y) + x;
  }

}
