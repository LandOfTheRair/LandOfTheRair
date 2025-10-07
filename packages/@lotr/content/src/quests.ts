import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function questGet(name: string) {
  const allQuests = getContentKey('quests');
  const ret = allQuests[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Quest:${name}`,
      new Error(`Quest ${name} does not exist.`),
    );
  }

  return ret;
}
