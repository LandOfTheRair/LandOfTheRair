
export interface IRecipe {
  recipeType: string;
  item: string;
  skillGained: number;
  maxSkillForGains: number;
  xpGained: number;
  ingredients: string[];
  requiredSkill: number;
}
