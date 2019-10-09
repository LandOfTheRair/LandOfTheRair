
import { CensorSensor } from 'censor-sensor';
import { Singleton } from 'typescript-ioc';

const censorSensor = new CensorSensor();
censorSensor.disableTier(2);
censorSensor.disableTier(3);
censorSensor.disableTier(4);

@Singleton
export class ProfanityHelper {

  public hasProfanity(check: string): boolean {
    return censorSensor.isProfane(check);
  }

  public cleanMessage(msg: string): string {
    return censorSensor.cleanProfanity(msg);
  }

}
