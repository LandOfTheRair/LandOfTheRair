import { BaseClass } from './building-blocks';

export interface IRecipe {
  recipeType: string;
  item: string;
  name: string;
  category: string;
  requireLearn?: boolean;
  requireClass?: BaseClass[];
  skillGained: number;
  maxSkillForGains: number;
  xpGained: number;
  ingredients: string[];
  requiredSkill: number;
  transferOwner?: boolean;
}
