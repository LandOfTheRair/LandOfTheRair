import { CensorSensor } from 'censor-sensor';

const censorSensor = new CensorSensor();
censorSensor.disableTier(2);
censorSensor.disableTier(3);
censorSensor.disableTier(4);

export function hasProfanity(check: string): boolean {
  return censorSensor.isProfane(check);
}

export function truncateMessage(message: string): string {
  return message.substring(0, 200);
}

export function cleanMessage(msg: string): string {
  return censorSensor.cleanProfanity(msg).trim();
}

// make sure numbers are cleaned up appropriately because js lets you do some dumb shit
export function cleanNumber(
  num: number | string,
  defaultValue = 0,
  opts: { round?: boolean; floor?: boolean; abs?: boolean } = {},
): number {
  num = +num;
  if (isNaN(num)) return defaultValue;
  if (!isFinite(num)) return defaultValue;

  if (opts.round) num = Math.round(num);
  if (opts.floor) num = Math.floor(num);
  if (opts.abs) num = Math.abs(num);

  return num;
}
