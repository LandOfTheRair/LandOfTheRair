import { Injectable } from 'injection-js';

import { BaseService } from '../../models/BaseService';

import {
  initializeRollbar,
  initializeWinston,
  setShouldLogCrashContext,
} from '@lotr/logger';

@Injectable()
export class LoggerInitializer extends BaseService {
  public async init() {
    setShouldLogCrashContext(!!process.env.LOG_CRASH_CONTEXT);

    if (process.env.ROLLBAR_TOKEN) {
      initializeRollbar(process.env.ROLLBAR_TOKEN);
    }

    initializeWinston();
  }
}
