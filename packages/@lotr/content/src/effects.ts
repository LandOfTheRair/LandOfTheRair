import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function effectGet(name: string, context: string) {
  const allEffects = getContentKey('effectData');
  const ret = allEffects[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Effect:${name}`,
      new Error(`Effect ${name} does not exist (ctx: ${context}).`),
    );
  }

  return ret;
}

export function effectExists(name: string) {
  const allEffects = getContentKey('effectData');
  return !!allEffects[name];
}
