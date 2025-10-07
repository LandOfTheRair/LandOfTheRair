import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function spellGetAll() {
  return getContentKey('spells');
}

export function spellGet(name: string, context: string) {
  const allSpells = spellGetAll();
  const ret = allSpells[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Spell:${name}`,
      new Error(`Spell ${name} does not exist (ctx: ${context}).`),
    );
  }

  return ret;
}
