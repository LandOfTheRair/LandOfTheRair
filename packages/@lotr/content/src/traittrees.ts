import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function traitTreeGet(name: string) {
  const allTraitTrees = getContentKey('traitTrees');
  const ret = allTraitTrees[name];
  if (!ret) {
    logErrorWithContext(
      `Content:TraitTree:${name}`,
      new Error(`Trait Tree ${name} does not exist.`),
    );
  }

  return ret;
}
