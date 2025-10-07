import { consoleError } from '@lotr/logger';

export function logErrorWithContext(tag: string, error: Error) {
  if (tag.includes('Migrate')) return;
  consoleError(tag, error);
}
