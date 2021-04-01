
import { Injectable } from 'injection-js';
import { random, sum } from 'lodash';
import { ICharacter, Stat } from '../../../interfaces';
import { BaseService } from '../../../models/BaseService';

@Injectable()
export class DiceRollerHelper extends BaseService {

  public init() {}

  // an X in Y chance - eg, a 5 in 100
  XInY(myDesiredRollMax: number, myDesiredCap: number): boolean {
    return random(0, myDesiredCap) < myDesiredRollMax;
  }

  // X in one hundred, eg, 1 in 100
  XInOneHundred(myDesiredRollMax: number): boolean {
    if (myDesiredRollMax <= 0) return false;
    return this.XInY(myDesiredRollMax, 100);
  }

  // a one in X chance, eg, 1 in 5
  OneInX(x: number): boolean {
    if (x <= 0) return false;
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

  // a one-to-luk roll, which will be used for anything rolling luk
  OneToStat(char: ICharacter, stat: Stat): number {
    return random(1, this.game.characterHelper.getStat(char, stat));
  }

  OneToLUK(char: ICharacter): number {
    return this.OneToStat(char, Stat.LUK);
  }

}
