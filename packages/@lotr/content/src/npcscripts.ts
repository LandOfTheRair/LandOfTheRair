import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function npcScriptGet(name: string) {
  const allScripts = getContentKey('npcScripts');
  const ret = allScripts[name];
  if (!ret) {
    logErrorWithContext(
      `Content:NPCScript:${name}`,
      new Error(`NPC Script ${name} does not exist.`),
    );
  }

  return ret;
}
