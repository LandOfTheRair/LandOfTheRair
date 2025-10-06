
import { Injectable } from 'injection-js';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class UserInputHelper extends BaseService {

  public init() {}

  // make sure numbers are cleaned up appropriately because js lets you do some dumb shit
  public cleanNumber(num: number|string, defaultValue = 0, opts: { round?: boolean; floor?: boolean; abs?: boolean } = {}): number {

    num = +num;
    if (isNaN(num)) return defaultValue;
    if (!isFinite(num)) return defaultValue;

    if (opts.round) num = Math.round(num);
    if (opts.floor) num = Math.floor(num);
    if (opts.abs)   num = Math.abs(num);

    return num;
  }

}
