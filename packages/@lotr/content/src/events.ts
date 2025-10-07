import { coreEvents } from './core';
import { logErrorWithContext } from './errors';

export function eventGet(name: string) {
  const allEvents = coreEvents();
  const ret = allEvents[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Event:${name}`,
      new Error(`Event ${name} does not exist.`),
    );
  }

  return ret;
}
