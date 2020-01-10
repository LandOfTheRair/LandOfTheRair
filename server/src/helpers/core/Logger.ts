
import { Injectable } from 'injection-js';

import { BaseService } from '../../interfaces';

@Injectable()
export class Logger extends BaseService {

  public async init() {}

  private _logWithTs(type: 'log'|'error', tag, ...args) {
    console[type](new Date(), `[${tag}]`, ...args);
  }

  public log(tag: string, args) {
    this._logWithTs('log', tag, args);
  }

  public error(tag: string, args) {
    this._logWithTs('error', tag, args);
  }

}
