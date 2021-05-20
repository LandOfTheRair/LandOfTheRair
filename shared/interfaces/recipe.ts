import { BaseClass, Tradeskill } from './building-blocks';

export interface IRecipe {
  recipeType: Tradeskill;
  item: string;
  name: string;
  category: string;
  requireSkill: number;
  requireLearn?: boolean;
  requireClass?: BaseClass[];
  skillGained: number;
  maxSkillForGains: number;
  xpGained: number;
  ingredients?: string[];
  ozIngredients?: Array<{ filter: string; display: string; ounces: number }>;
  transferOwnerFrom?: string;
}
