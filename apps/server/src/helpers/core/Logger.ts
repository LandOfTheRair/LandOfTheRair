import { Injectable } from 'injection-js';

import { BaseService } from '../../models/BaseService';

import { initializeRollbar, initializeWinston } from '@lotr/logger';

@Injectable()
export class LoggerInitializer extends BaseService {
  public async init() {
    if (process.env.ROLLBAR_TOKEN) {
      initializeRollbar(process.env.ROLLBAR_TOKEN);
    }

    initializeWinston();
  }
}
