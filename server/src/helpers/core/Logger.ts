
import { Singleton } from 'typescript-ioc';

@Singleton
export class Logger {

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
