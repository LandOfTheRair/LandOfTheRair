
import { CensorSensor } from 'censor-sensor';
import { Injectable } from 'injection-js';

import { BaseService } from '../../interfaces';

@Injectable()
export class ProfanityHelper extends BaseService {

  private censorSensor: CensorSensor;

  public async init() {
    this.censorSensor = new CensorSensor();
    this.censorSensor.disableTier(2);
    this.censorSensor.disableTier(3);
    this.censorSensor.disableTier(4);
  }

  public hasProfanity(check: string): boolean {
    return this.censorSensor.isProfane(check);
  }

  public cleanMessage(msg: string): string {
    return this.censorSensor.cleanProfanity(msg);
  }

}
