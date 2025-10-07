import { beforeEach, describe, expect, it, vi } from 'vitest';
import { traitGet } from './traits';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Traits Functions', () => {
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

  describe('traitGet', () => {
    it('should return trait when it exists', () => {
      const traits = {
        berserker: {
          name: 'Berserker',
          description: 'Gain strength when health is low',
          type: 'combat',
          maxLevel: 5,
          requirements: { level: 10 },
        },
        stealth: {
          name: 'Stealth',
          description: 'Move unseen by enemies',
          type: 'utility',
          maxLevel: 10,
          requirements: { dexterity: 15 },
        },
      };

      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('berserker', 'character-creation');

      expect(mockGetContentKey).toHaveBeenCalledWith('traits');
      expect(result).toEqual(traits['berserker']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent trait', () => {
      const traits = {
        'existing-trait': {
          name: 'Existing Trait',
          type: 'test',
        },
      };

      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('nonexistent-trait', 'test-context');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Trait:nonexistent-trait',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Trait nonexistent-trait does not exist (ctx: test-context).',
      );
    });

    it('should include context in error message', () => {
      mockGetContentKey.mockReturnValue({});

      traitGet('missing-trait', 'skill-learning');

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Trait:missing-trait',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: skill-learning');
    });

    it('should handle empty traits collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = traitGet('any-trait', 'empty-collection');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Trait:any-trait',
        expect.any(Error),
      );
    });

    it('should handle traits with complex data structures', () => {
      const complexTrait = {
        name: 'Master Craftsman',
        description: 'Exceptional skill in all crafting disciplines',
        type: 'crafting',
        maxLevel: 15,
        category: 'profession',
        requirements: {
          level: 25,
          skills: {
            blacksmithing: 80,
            tailoring: 80,
            alchemy: 80,
          },
          stats: {
            intelligence: 20,
            dexterity: 18,
          },
        },
        benefits: [
          {
            level: 1,
            effects: [
              { type: 'craft-quality-bonus', value: 0.05 },
              { type: 'craft-speed-bonus', value: 0.1 },
            ],
          },
          {
            level: 5,
            effects: [
              { type: 'craft-quality-bonus', value: 0.1 },
              { type: 'rare-material-chance', value: 0.02 },
            ],
          },
          {
            level: 10,
            effects: [
              { type: 'masterwork-chance', value: 0.05 },
              { type: 'resource-conservation', value: 0.15 },
            ],
          },
        ],
        incompatible: ['apprentice-crafter'],
        prerequisites: ['skilled-crafter'],
      };

      const traits = {
        'master-craftsman': complexTrait,
      };

      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('master-craftsman', 'trait-selection');

      expect(result).toEqual(complexTrait);
      expect((result as any).benefits).toHaveLength(3);
      expect((result as any).requirements.skills.blacksmithing).toBe(80);
      expect((result as any).incompatible).toContain('apprentice-crafter');
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle traits with special characters in name', () => {
      const traits = {
        'trait-with_special.chars!': {
          name: 'Special Trait',
          type: 'test',
        },
      };

      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('trait-with_special.chars!', 'special-test');

      expect(result).toEqual(traits['trait-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return the exact object reference', () => {
      const traitObject = {
        name: 'Reference Test',
        type: 'test',
      };

      const traits = { 'reference-test': traitObject };
      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('reference-test', 'reference-check');

      expect(result).toBe(traitObject); // Same reference
    });

    it('should handle various context types', () => {
      const traits = {
        'test-trait': { name: 'Test', type: 'test' },
      };

      mockGetContentKey.mockReturnValue(traits);

      const contexts = [
        'character-creation',
        'level-up',
        'trait-learning',
        'skill-advancement',
        'quest-reward',
        'item-bonus',
      ];

      contexts.forEach((context) => {
        const result = traitGet('test-trait', context);
        expect(result).toEqual(traits['test-trait']);
      });

      // Test with missing trait to check context is preserved
      traitGet('missing', 'custom-context-789');

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: custom-context-789');
    });

    it('should handle null and undefined trait values', () => {
      const traits = {
        'null-trait': null,
        'undefined-trait': undefined,
        'valid-trait': { name: 'Valid', type: 'test' },
      };

      mockGetContentKey.mockReturnValue(traits);

      // Null trait should be treated as non-existent
      const nullResult = traitGet('null-trait', 'null-test');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Trait:null-trait',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Undefined trait should be treated as non-existent
      const undefinedResult = traitGet('undefined-trait', 'undefined-test');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Trait:undefined-trait',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Valid trait should work normally
      const validResult = traitGet('valid-trait', 'valid-test');
      expect(validResult).toEqual(traits['valid-trait']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle realistic trait scenarios', () => {
      const realisticTraits = {
        'weapon-mastery': {
          name: 'Weapon Mastery',
          description: 'Improved proficiency with all weapon types',
          type: 'combat',
          category: 'martial',
          maxLevel: 20,
          requirements: {
            level: 5,
            stats: { strength: 12, dexterity: 10 },
          },
          benefits: [
            {
              level: 1,
              effects: [
                { type: 'weapon-skill-bonus', value: 1 },
                { type: 'accuracy-bonus', value: 0.02 },
              ],
            },
            {
              level: 10,
              effects: [
                { type: 'critical-chance', value: 0.05 },
                { type: 'weapon-damage-bonus', value: 0.1 },
              ],
            },
          ],
          tags: ['combat', 'weapon', 'physical'],
        },
        'nature-affinity': {
          name: 'Nature Affinity',
          description: 'Deep connection with the natural world',
          type: 'utility',
          category: 'mystical',
          maxLevel: 15,
          requirements: {
            level: 8,
            stats: { wisdom: 15 },
            alignment: 'neutral-good',
          },
          benefits: [
            {
              level: 1,
              effects: [
                { type: 'animal-communication', enabled: true },
                { type: 'plant-growth-speed', multiplier: 1.5 },
              ],
            },
            {
              level: 7,
              effects: [
                { type: 'weather-prediction', accuracy: 0.8 },
                { type: 'natural-healing', bonus: 0.25 },
              ],
            },
          ],
          tags: ['nature', 'utility', 'mystical'],
        },
      };

      mockGetContentKey.mockReturnValue(realisticTraits);

      const weaponMastery = traitGet('weapon-mastery', 'combat-training');
      expect((weaponMastery as any).category).toBe('martial');
      expect((weaponMastery as any).benefits).toHaveLength(2);
      expect((weaponMastery as any).tags).toContain('combat');

      const natureAffinity = traitGet('nature-affinity', 'druid-path');
      expect((natureAffinity as any).requirements.alignment).toBe(
        'neutral-good',
      );
      expect((natureAffinity as any).benefits[1].effects[0].type).toBe(
        'weather-prediction',
      );
    });

    it('should handle trait categories and types', () => {
      const categorizedTraits = {
        'sword-fighter': {
          name: 'Sword Fighter',
          type: 'combat',
          category: 'martial',
          weaponType: 'sword',
        },
        'fire-mage': {
          name: 'Fire Mage',
          type: 'magic',
          category: 'elemental',
          element: 'fire',
        },
        lockpicking: {
          name: 'Lockpicking',
          type: 'utility',
          category: 'thievery',
          skill: 'dexterity',
        },
        merchant: {
          name: 'Merchant',
          type: 'social',
          category: 'profession',
          tradeBonus: 0.15,
        },
      };

      mockGetContentKey.mockReturnValue(categorizedTraits);

      // Test combat trait
      const swordFighter = traitGet('sword-fighter', 'warrior-build');
      expect((swordFighter as any).type).toBe('combat');
      expect((swordFighter as any).category).toBe('martial');

      // Test magic trait
      const fireMage = traitGet('fire-mage', 'mage-build');
      expect((fireMage as any).element).toBe('fire');

      // Test utility trait
      const lockpicking = traitGet('lockpicking', 'rogue-build');
      expect((lockpicking as any).category).toBe('thievery');

      // Test social trait
      const merchant = traitGet('merchant', 'trader-build');
      expect((merchant as any).tradeBonus).toBe(0.15);
    });

    it('should maintain performance with large trait collections', () => {
      // Simulate a large trait database
      const largeTraitCollection: any = {};
      for (let i = 0; i < 600; i++) {
        largeTraitCollection[`trait-${i}`] = {
          name: `Trait ${i}`,
          type:
            i % 4 === 0
              ? 'combat'
              : i % 4 === 1
                ? 'magic'
                : i % 4 === 2
                  ? 'utility'
                  : 'social',
          maxLevel: (i % 10) + 1,
          requirements: { level: Math.floor(i / 10) + 1 },
        };
      }

      mockGetContentKey.mockReturnValue(largeTraitCollection);

      // Should quickly find existing traits
      const trait300 = traitGet('trait-300', 'performance-test');
      expect((trait300 as any).name).toBe('Trait 300');

      // Should quickly determine non-existence
      const nonExistent = traitGet('trait-9999', 'performance-test');
      expect(nonExistent).toBeUndefined();

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent access patterns', () => {
      const traits = {
        'trait-1': { name: 'Trait 1', type: 'combat' },
        'trait-2': { name: 'Trait 2', type: 'magic' },
        'trait-3': { name: 'Trait 3', type: 'utility' },
      };

      mockGetContentKey.mockReturnValue(traits);

      // Simulate concurrent access
      const results = ['trait-1', 'trait-2', 'trait-3'].map((name) => ({
        trait: traitGet(name, 'concurrent-test'),
      }));

      results.forEach((result, index) => {
        expect(result.trait).toEqual(traits[`trait-${index + 1}`]);
      });

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle traits with leveling systems', () => {
      const leveledTrait = {
        name: 'Progressive Trait',
        type: 'combat',
        maxLevel: 25,
        scaling: 'linear',
        benefits: Array.from({ length: 25 }, (_, i) => ({
          level: i + 1,
          effects: [
            { type: 'damage-bonus', value: (i + 1) * 0.02 },
            { type: 'accuracy-bonus', value: (i + 1) * 0.01 },
          ],
        })),
        requirements: {
          level: 1,
          stats: { strength: 10 },
        },
      };

      const traits = {
        'progressive-trait': leveledTrait,
      };

      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('progressive-trait', 'leveling-system');

      expect(result).toEqual(leveledTrait);
      expect((result as any).benefits).toHaveLength(25);
      expect((result as any).benefits[24].level).toBe(25);
      expect((result as any).benefits[24].effects[0].value).toBe(0.5); // 25 * 0.02
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => traitGet('any', 'context')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => traitGet('any', 'context')).toThrow();
    });

    it('should handle empty string contexts gracefully', () => {
      const traits = { test: { name: 'Test', type: 'test' } };
      mockGetContentKey.mockReturnValue(traits);

      const result = traitGet('test', '');
      expect(result).toEqual(traits['test']);

      // Test with missing trait and empty context
      traitGet('missing', '');
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Trait:missing',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: ');
    });

    it('should handle special characters in context', () => {
      const traits = {};
      mockGetContentKey.mockReturnValue(traits);

      const specialContexts = [
        'context-with-dashes',
        'context_with_underscores',
        'context.with.dots',
        'context with spaces',
        'context!@#$%^&*()',
        'context123numbers',
      ];

      specialContexts.forEach((context) => {
        traitGet('missing-trait', context);

        const errorCall =
          mockLogErrorWithContext.mock.calls[
            mockLogErrorWithContext.mock.calls.length - 1
          ];
        expect(errorCall[1].message).toContain(`ctx: ${context}`);
      });

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(
        specialContexts.length,
      );
    });

    it('should handle very long trait names and contexts', () => {
      const longName =
        'very-long-trait-name-that-exceeds-normal-limits-and-continues-for-a-very-long-time-to-test-edge-cases';
      const longContext =
        'very-long-context-description-that-might-be-used-in-complex-scenarios-with-detailed-information';

      const traits = {};
      mockGetContentKey.mockReturnValue(traits);

      traitGet(longName, longContext);

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        `Content:Trait:${longName}`,
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain(`ctx: ${longContext}`);
    });
  });
});
