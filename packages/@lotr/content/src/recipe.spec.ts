import type { BaseClass, IRecipe, Tradeskill } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recipeGet, recipeGetForTradeskill } from './recipe';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Recipe Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('recipeGet', () => {
    it('should return recipe when it exists', () => {
      const recipes = {
        'iron-sword': {
          name: 'Iron Sword',
          tradeskill: 'Blacksmithing',
          level: 15,
          ingredients: [
            { name: 'iron-ingot', quantity: 3 },
            { name: 'leather-wrap', quantity: 1 },
          ],
          result: {
            name: 'iron-sword',
            quantity: 1,
          },
          experience: 150,
        },
        'health-potion': {
          name: 'Health Potion',
          tradeskill: 'Alchemy',
          level: 5,
          ingredients: [
            { name: 'red-herb', quantity: 2 },
            { name: 'water-vial', quantity: 1 },
          ],
          result: {
            name: 'health-potion',
            quantity: 3,
          },
          experience: 50,
        },
      };

      mockGetContentKey.mockReturnValue(recipes);

      const result = recipeGet('iron-sword');

      expect(mockGetContentKey).toHaveBeenCalledWith('allRecipes');
      expect(result).toEqual(recipes['iron-sword']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent recipe', () => {
      const recipes = {
        'existing-recipe': {
          name: 'Existing Recipe',
          tradeskill: 'Cooking',
        },
      };

      mockGetContentKey.mockReturnValue(recipes);

      const result = recipeGet('nonexistent-recipe');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Recipe:nonexistent-recipe',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Recipe nonexistent-recipe does not exist.',
      );
    });

    it('should handle empty recipes collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = recipeGet('any-recipe');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Recipe:any-recipe',
        expect.any(Error),
      );
    });

    it('should handle complex recipes with multiple ingredients and conditions', () => {
      const complexRecipe = {
        name: 'Masterwork Enchanted Blade',
        tradeskill: 'Enchanted Smithing',
        level: 85,
        category: 'weapons',
        subcategory: 'swords',
        difficulty: 'master',
        ingredients: [
          { name: 'mithril-ingot', quantity: 5, quality: 'perfect' },
          { name: 'dragon-scale', quantity: 2, rarity: 'legendary' },
          { name: 'arcane-crystal', quantity: 1, type: 'fire' },
          { name: 'ancient-rune', quantity: 3, power: 'high' },
        ],
        tools: [
          { name: 'master-forge', required: true },
          { name: 'enchanting-altar', required: true },
          { name: 'precision-hammer', durability: 100 },
        ],
        conditions: {
          timeOfDay: 'midnight',
          moonPhase: 'full',
          location: 'sacred-forge',
          weather: 'clear',
        },
        result: {
          name: 'enchanted-mithril-blade',
          quantity: 1,
          quality: 'legendary',
          enchantments: ['fire-damage', 'mana-burn', 'keen-edge'],
        },
        experience: 5000,
        skillRequirements: {
          Blacksmithing: 80,
          Enchanting: 70,
          'Arcane Knowledge': 60,
        },
        successChance: 0.15,
        criticalSuccess: {
          chance: 0.05,
          bonus: {
            additionalEnchantment: 'dragon-slayer',
            qualityUpgrade: true,
          },
        },
        failure: {
          ingredientLoss: 0.7,
          possibleResults: ['broken-blade-fragment', 'unstable-crystal'],
        },
      };

      const recipes = {
        'masterwork-enchanted-blade': complexRecipe,
      };

      mockGetContentKey.mockReturnValue(recipes);

      const result = recipeGet('masterwork-enchanted-blade');

      expect(result).toEqual(complexRecipe);
      expect((result as any).ingredients).toHaveLength(4);
      expect((result as any).result.enchantments).toContain('fire-damage');
      expect((result as any).skillRequirements['Blacksmithing']).toBe(80);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return exact object reference from content', () => {
      const recipeObject = {
        name: 'Reference Test',
        tradeskill: 'Test',
      };

      const recipes = { 'reference-test': recipeObject };
      mockGetContentKey.mockReturnValue(recipes);

      const result = recipeGet('reference-test');

      expect(result).toBe(recipeObject); // Same reference
    });

    it('should handle recipes with special characters in names', () => {
      const recipes = {
        'recipe-with_special.chars!': {
          name: 'Special Recipe',
          tradeskill: 'Alchemy',
        },
      };

      mockGetContentKey.mockReturnValue(recipes);

      const result = recipeGet('recipe-with_special.chars!');

      expect(result).toEqual(recipes['recipe-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('recipeGetForTradeskill', () => {
    it('should return recipes array when tradeskill exists', () => {
      const tradeskillRecipes = {
        Blacksmithing: [
          {
            name: 'Iron Dagger',
            level: 5,
            ingredients: [{ name: 'iron-ingot', quantity: 1 }],
          },
          {
            name: 'Steel Sword',
            level: 25,
            ingredients: [{ name: 'steel-ingot', quantity: 2 }],
          },
        ],
        Alchemy: [
          {
            name: 'Healing Potion',
            level: 10,
            ingredients: [{ name: 'herb', quantity: 2 }],
          },
        ],
      };

      mockGetContentKey.mockReturnValue(tradeskillRecipes);

      const result = recipeGetForTradeskill('Blacksmithing');

      expect(mockGetContentKey).toHaveBeenCalledWith('tradeskillRecipes');
      expect(result).toEqual(tradeskillRecipes['Blacksmithing']);
      expect(result).toHaveLength(2);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error for nonexistent tradeskill', () => {
      const tradeskillRecipes = {
        Existing: [{ name: 'Test Recipe' }],
      };

      mockGetContentKey.mockReturnValue(tradeskillRecipes);

      const result = recipeGetForTradeskill('NonexistentTradeskill');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:TradeskillRecipes:NonexistentTradeskill',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Recipe tradeskill NonexistentTradeskill does not exist.',
      );
    });

    it('should log error for empty tradeskill recipes', () => {
      const tradeskillRecipes = {
        EmptyTradeskill: [],
      };

      mockGetContentKey.mockReturnValue(tradeskillRecipes);

      const result = recipeGetForTradeskill('EmptyTradeskill');

      expect(result).toEqual([]);
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:TradeskillRecipes:EmptyTradeskill',
        expect.any(Error),
      );
    });

    it('should return recipes for valid tradeskills', () => {
      const cookingRecipes = [
        {
          name: 'Bread',
          level: 1,
          ingredients: [
            { name: 'flour', quantity: 2 },
            { name: 'water', quantity: 1 },
          ],
          cookingTime: 30,
          result: { name: 'fresh-bread', quantity: 1 },
        },
        {
          name: 'Vegetable Stew',
          level: 15,
          ingredients: [
            { name: 'carrot', quantity: 2 },
            { name: 'potato', quantity: 2 },
            { name: 'onion', quantity: 1 },
            { name: 'broth', quantity: 1 },
          ],
          cookingTime: 120,
          result: { name: 'hearty-stew', quantity: 2 },
        },
      ];

      const tradeskillRecipes = {
        Cooking: cookingRecipes,
        Tailoring: [
          {
            name: 'Cloth Tunic',
            level: 8,
            ingredients: [{ name: 'cloth', quantity: 4 }],
          },
        ],
      };

      mockGetContentKey.mockReturnValue(tradeskillRecipes);

      const result = recipeGetForTradeskill('Cooking');

      expect(result).toEqual(cookingRecipes);
      expect(result[0].name).toBe('Bread');
      expect(result[1].ingredients).toHaveLength(4);
    });

    it('should handle complex tradeskill collections', () => {
      const enchantingRecipes = [
        {
          name: 'Minor Fire Enchantment',
          recipeType: 'Enchanting' as Tradeskill,
          item: 'fire-enchantment',
          category: 'weapon-enchantment',
          requireSkill: 20,
          skillGained: 10,
          maxSkillForGains: 100,
          xpGained: 25,
          ingredients: ['fire-essence', 'enchanting-dust'],
          ozIngredients: [
            { filter: 'fire-essence', display: 'Fire Essence', ounces: 1 },
            {
              filter: 'enchanting-dust',
              display: 'Enchanting Dust',
              ounces: 3,
            },
          ],
          potencyScalar: 1.2,
        },
        {
          name: 'Protection Ward',
          recipeType: 'Enchanting' as Tradeskill,
          item: 'protection-ward',
          category: 'armor-enchantment',
          requireSkill: 35,
          skillGained: 15,
          maxSkillForGains: 150,
          xpGained: 40,
          ingredients: ['protection-rune', 'silver-dust', 'blessed-water'],
          requireClass: ['Mage' as BaseClass],
          copySkillToPotency: true,
        },
      ];

      const tradeskillRecipes = {
        Enchanting: enchantingRecipes,
      };

      mockGetContentKey.mockReturnValue(tradeskillRecipes);

      const result = recipeGetForTradeskill('Enchanting');

      expect(result).toEqual(enchantingRecipes);
      expect(result[0].potencyScalar).toBe(1.2);
      expect(result[1].requireClass).toContain('Mage');
    });

    it('should handle large tradeskill recipe collections', () => {
      const largeRecipeSet: IRecipe[] = [];

      for (let i = 1; i <= 100; i++) {
        largeRecipeSet.push({
          name: `Recipe ${i}`,
          recipeType: 'Cooking' as Tradeskill,
          item: `recipe-item-${i}`,
          category: 'mass-production',
          requireSkill: i,
          skillGained: Math.ceil(i / 10),
          maxSkillForGains: i * 2,
          xpGained: i,
          ingredients: [`ingredient-${i}`],
        });
      }

      const tradeskillRecipes = {
        MassProduction: largeRecipeSet,
      };

      mockGetContentKey.mockReturnValue(tradeskillRecipes);

      const result = recipeGetForTradeskill('MassProduction');

      expect(result).toHaveLength(100);
      expect(result[49].name).toBe('Recipe 50');
      expect(result[99].requireSkill).toBe(100);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null for recipes', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => recipeGet('any')).toThrow();
    });

    it('should handle when getContentKey returns undefined for recipes', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => recipeGet('any')).toThrow();
    });

    it('should handle null and undefined recipe values', () => {
      const recipes = {
        'null-recipe': null,
        'undefined-recipe': undefined,
        'valid-recipe': { name: 'Valid Recipe' },
      };

      mockGetContentKey.mockReturnValue(recipes);

      const nullResult = recipeGet('null-recipe');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Recipe:null-recipe',
        expect.any(Error),
      );

      vi.clearAllMocks();

      const undefinedResult = recipeGet('undefined-recipe');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Recipe:undefined-recipe',
        expect.any(Error),
      );

      vi.clearAllMocks();

      const validResult = recipeGet('valid-recipe');
      expect(validResult).toEqual(recipes['valid-recipe']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle very long recipe names', () => {
      const longRecipeName =
        'very-long-recipe-name-that-exceeds-normal-limits-and-continues-for-testing';

      mockGetContentKey.mockReturnValue({});

      recipeGet(longRecipeName);

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        `Content:Recipe:${longRecipeName}`,
        expect.any(Error),
      );
    });
  });
});
