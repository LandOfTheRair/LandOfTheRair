import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function achievementAll() {
  return getContentKey('achievements');
}

export function achievementGet(name: string) {
  const allAchievements = achievementAll();
  const ret = allAchievements[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Achievement:${name}`,
      new Error(`Achievement ${name} does not exist.`),
    );
  }

  return ret;
}

export function achievementExists(name: string): boolean {
  return !!achievementAll()[name];
}
