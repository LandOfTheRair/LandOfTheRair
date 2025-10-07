import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function traitGet(name: string, context: string) {
  const allTraits = getContentKey('traits');
  const ret = allTraits[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Trait:${name}`,
      new Error(`Trait ${name} does not exist (ctx: ${context}).`),
    );
  }

  return ret;
}
