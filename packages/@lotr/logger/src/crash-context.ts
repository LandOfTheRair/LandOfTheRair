import { ICharacter } from '@lotr/interfaces';
import { consoleDebug } from './logger';

let shouldLogCrashContext = false;
let crashContext = [];

export function setShouldLogCrashContext(value: boolean) {
  shouldLogCrashContext = value;
}

export function logCrashContextEntry(char: ICharacter, entry: string): void {
  const message = `${char.map}:${char.x},${char.y}|${entry}`;

  crashContext.push(message);
  if (crashContext.length > 300) crashContext.shift();

  if (shouldLogCrashContext) {
    consoleDebug('CrashContext', message);
  }
}

export function currentCrashContext(): string[] {
  return crashContext;
}
