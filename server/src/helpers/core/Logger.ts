
import { Injectable } from 'injection-js';
import Rollbar from 'rollbar';

import Winston from 'winston';
import 'winston-syslog';

import { BaseService } from '../../models/BaseService';

@Injectable()
export class Logger extends BaseService {

  private rollbar: Rollbar;
  private winston: Winston.Logger;

  public async init() {
    if (process.env.ROLLBAR_TOKEN) {
      this.rollbar = new Rollbar({
        accessToken: process.env.ROLLBAR_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true
      });
    }

    if (process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
      const papertrail = new (Winston.transports as any).Syslog({
        host: process.env.PAPERTRAIL_HOST,
        port: +process.env.PAPERTRAIL_PORT,
        protocol: 'tls4',
        localhost: require('os').hostname(),
        eol: '\n',
      });

      this.winston = Winston.createLogger({
        format: Winston.format.simple(),
        levels: Winston.config.syslog.levels,
        transports: [papertrail],
        exitOnError: (err) => err.code !== 'EPIPE'
      });
    }
  }

  private _logWithTs(type: 'info'|'warn'|'error', tag, ...args) {

    // eslint-disable-next-line no-console
    console[type](new Date().toISOString(), `[${tag}]`, ...args);

    try {
      this.winston?.[type]?.(`[${tag}] ${args}`);

    // who logs the logger?
    } catch {}
  }

  public log(tag: string, args) {
    this._logWithTs('info', tag, args);
  }

  public warn(tag: string, args) {
    this._logWithTs('warn', tag, args);
  }

  public error(tag: string, args) {
    this._logWithTs('error', tag, args);
    this.rollbar?.error(tag, args, { context: this.game.crashContext.getCurrentContext() });
  }

}
