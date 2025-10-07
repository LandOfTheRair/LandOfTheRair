import type { IRecipe } from '@lotr/interfaces';
import { getContentKey } from './allcontent';
import { logErrorWithContext } from './errors';

export function recipeGet(name: string) {
  const allRecipes = getContentKey('allRecipes');
  const ret = allRecipes[name];
  if (!ret) {
    logErrorWithContext(
      `Content:Recipe:${name}`,
      new Error(`Recipe ${name} does not exist.`),
    );
  }

  return ret;
}

export function recipeGetForTradeskill(tradeskill: string): IRecipe[] {
  const ret = getContentKey('tradeskillRecipes')[tradeskill];
  if (!ret || ret.length === 0) {
    logErrorWithContext(
      `Content:TradeskillRecipes:${tradeskill}`,
      new Error(`Recipe tradeskill ${tradeskill} does not exist.`),
    );
  }

  return ret;
}
