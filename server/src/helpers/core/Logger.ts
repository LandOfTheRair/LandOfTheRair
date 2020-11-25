
import { Injectable } from 'injection-js';
import Rollbar from 'rollbar';

import { BaseService } from '../../interfaces';

@Injectable()
export class Logger extends BaseService {

  private rollbar: Rollbar;

  public async init() {
    if (process.env.ROLLBAR_TOKEN) {
      this.rollbar = new Rollbar({
        accessToken: process.env.ROLLBAR_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true
      });
    }
  }

  private _logWithTs(type: 'log'|'error', tag, ...args) {
    console[type](new Date().toISOString(), `[${tag}]`, ...args);
  }

  public log(tag: string, args) {
    this._logWithTs('log', tag, args);
  }

  public error(tag: string, args) {
    this._logWithTs('error', tag, args);
    this.rollbar.error(tag, args);
  }

}
