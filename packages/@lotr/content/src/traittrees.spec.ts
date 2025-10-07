import { beforeEach, describe, expect, it, vi } from 'vitest';
import { traitTreeGet } from './traittrees';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Trait Tree Functions', () => {
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

  describe('traitTreeGet', () => {
    it('should return trait tree when it exists', () => {
      const traitTrees = {
        warrior: {
          name: 'Warrior Tree',
          description: 'Combat-focused abilities',
          maxTierLevel: 50,
          treeOrder: ['Martial Prowess', 'Combat Mastery', 'Weapon Expert'],
          allTreeTraits: {
            'Strong Back': { name: 'Strong Back', maxLevel: 5 },
            Charge: { name: 'Charge', maxLevel: 1 },
            'Weapon Specialist': { name: 'Weapon Specialist', maxLevel: 3 },
          },
        },
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      const result = traitTreeGet('warrior');

      expect(mockGetContentKey).toHaveBeenCalledWith('traitTrees');
      expect(result).toEqual(traitTrees['warrior']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent trait tree', () => {
      const traitTrees = {
        warrior: {
          name: 'Warrior Tree',
          treeOrder: ['Martial Prowess'],
        },
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      const result = traitTreeGet('nonexistent-tree');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:TraitTree:nonexistent-tree',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Trait Tree nonexistent-tree does not exist.',
      );
    });

    it('should handle empty trait tree collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = traitTreeGet('any-tree');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:TraitTree:any-tree',
        expect.any(Error),
      );
    });

    it('should handle complex trait tree data structures', () => {
      const complexTraitTree = {
        name: 'Advanced Mage Tree',
        description: 'Master the arcane arts',
        maxTierLevel: 75,
        requiredLevel: 25,
        prerequisites: ['Basic Magic', 'Spell Focus'],
        treeOrder: [
          'Elemental Mastery',
          'Arcane Secrets',
          'Metamagic',
          'Spell Weaving',
          'Archmage',
        ],
        allTreeTraits: {
          'Elemental Focus': {
            name: 'Elemental Focus',
            maxLevel: 5,
            description: 'Increases elemental spell damage',
            requires: null,
            icon: 'elemental-focus',
          },
          Metamagic: {
            name: 'Metamagic',
            maxLevel: 3,
            description: 'Modify spells with metamagic effects',
            requires: ['Elemental Focus'],
            icon: 'metamagic',
            unlockLevel: 15,
          },
          Archmage: {
            name: 'Archmage',
            maxLevel: 1,
            description: 'Ultimate magical mastery',
            requires: ['Metamagic', 'Spell Weaving'],
            icon: 'archmage',
            unlockLevel: 50,
          },
        },
        bonuses: {
          'spell-damage': 0.25,
          'mana-efficiency': 0.15,
          'spell-range': 0.1,
        },
      };

      const traitTrees = {
        'advanced-mage': complexTraitTree,
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      const result = traitTreeGet('advanced-mage');

      expect(result).toEqual(complexTraitTree);
      expect((result as any).treeOrder).toHaveLength(5);
      expect((result as any).allTreeTraits['Archmage'].maxLevel).toBe(1);
      expect((result as any).bonuses['spell-damage']).toBe(0.25);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle all base class trait trees', () => {
      const allTraitTrees = {
        warrior: {
          name: 'Warrior Tree',
          treeOrder: ['Martial Prowess', 'Combat Mastery'],
          allTreeTraits: {
            'Strong Back': { name: 'Strong Back', maxLevel: 5 },
            Charge: { name: 'Charge', maxLevel: 1 },
          },
        },
        mage: {
          name: 'Mage Tree',
          treeOrder: ['Spell Focus', 'Elemental Mastery'],
          allTreeTraits: {
            'Magic Focus': { name: 'Magic Focus', maxLevel: 5 },
            'Spell Power': { name: 'Spell Power', maxLevel: 3 },
          },
        },
        thief: {
          name: 'Thief Tree',
          treeOrder: ['Stealth', 'Cunning'],
          allTreeTraits: {
            Lockpicking: { name: 'Lockpicking', maxLevel: 5 },
            Backstab: { name: 'Backstab', maxLevel: 3 },
          },
        },
        healer: {
          name: 'Healer Tree',
          treeOrder: ['Divine Magic', 'Restoration'],
          allTreeTraits: {
            'Healing Focus': { name: 'Healing Focus', maxLevel: 5 },
            'Divine Protection': { name: 'Divine Protection', maxLevel: 1 },
          },
        },
      };

      mockGetContentKey.mockReturnValue(allTraitTrees);

      Object.keys(allTraitTrees).forEach((className) => {
        const result = traitTreeGet(className);
        expect(result).toEqual(allTraitTrees[className]);
        expect((result as any).name).toContain('Tree');
      });

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle trait trees with special characters in names', () => {
      const traitTrees = {
        'tree-with_special.chars!': {
          name: 'Special Tree',
          treeOrder: ['Test Trait'],
        },
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      const result = traitTreeGet('tree-with_special.chars!');

      expect(result).toEqual(traitTrees['tree-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return the exact object reference', () => {
      const traitTreeObject = {
        name: 'Reference Test Tree',
        treeOrder: ['Test'],
        allTreeTraits: { Test: { name: 'Test', maxLevel: 1 } },
      };

      const traitTrees = { 'reference-test': traitTreeObject };
      mockGetContentKey.mockReturnValue(traitTrees);

      const result = traitTreeGet('reference-test');

      expect(result).toBe(traitTreeObject); // Same reference
    });

    it('should handle null and undefined trait tree values', () => {
      const traitTrees = {
        'null-tree': null,
        'undefined-tree': undefined,
        'valid-tree': { name: 'Valid Tree', treeOrder: [] },
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      // Null tree should be treated as non-existent
      const nullResult = traitTreeGet('null-tree');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:TraitTree:null-tree',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Undefined tree should be treated as non-existent
      const undefinedResult = traitTreeGet('undefined-tree');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:TraitTree:undefined-tree',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Valid tree should work normally
      const validResult = traitTreeGet('valid-tree');
      expect(validResult).toEqual(traitTrees['valid-tree']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle trait trees with varying complexity levels', () => {
      const traitTrees = {
        simple: {
          name: 'Simple Tree',
        },
        medium: {
          name: 'Medium Tree',
          treeOrder: ['Trait1', 'Trait2'],
          allTreeTraits: {
            Trait1: { name: 'Trait1', maxLevel: 1 },
            Trait2: { name: 'Trait2', maxLevel: 3 },
          },
        },
        complex: {
          name: 'Complex Tree',
          description: 'A complex trait tree with many features',
          maxTierLevel: 100,
          requiredLevel: 50,
          prerequisites: ['Other Tree'],
          treeOrder: ['Category1', 'Category2', 'Category3'],
          allTreeTraits: {
            Trait1: {
              name: 'Trait1',
              maxLevel: 5,
              description: 'First trait',
              requires: null,
              unlockLevel: 1,
            },
            Trait2: {
              name: 'Trait2',
              maxLevel: 3,
              description: 'Second trait',
              requires: ['Trait1'],
              unlockLevel: 10,
            },
          },
          bonuses: { damage: 0.1, defense: 0.05 },
          penalties: { speed: -0.02 },
        },
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      const simple = traitTreeGet('simple');
      const medium = traitTreeGet('medium');
      const complex = traitTreeGet('complex');

      expect((simple as any).name).toBe('Simple Tree');
      expect((medium as any).treeOrder).toHaveLength(2);
      expect((complex as any).allTreeTraits['Trait2'].requires).toContain(
        'Trait1',
      );
      expect((complex as any).bonuses.damage).toBe(0.1);
    });

    it('should handle trait trees with empty arrays and objects', () => {
      const traitTrees = {
        'empty-arrays': {
          name: 'Empty Arrays Tree',
          treeOrder: [],
          allTreeTraits: {},
          prerequisites: [],
          bonuses: {},
        },
      };

      mockGetContentKey.mockReturnValue(traitTrees);

      const result = traitTreeGet('empty-arrays');

      expect((result as any).treeOrder).toEqual([]);
      expect((result as any).allTreeTraits).toEqual({});
      expect((result as any).prerequisites).toEqual([]);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should maintain performance with large trait tree collections', () => {
      // Simulate large trait tree database
      const largeTraitTreeCollection: any = {};

      for (let i = 0; i < 100; i++) {
        largeTraitTreeCollection[`tree-${i}`] = {
          name: `Tree ${i}`,
          treeOrder: [`Category-${i}-1`, `Category-${i}-2`],
          allTreeTraits: {
            [`Trait-${i}-1`]: { name: `Trait-${i}-1`, maxLevel: (i % 5) + 1 },
            [`Trait-${i}-2`]: {
              name: `Trait-${i}-2`,
              maxLevel: ((i + 1) % 3) + 1,
            },
          },
        };
      }

      mockGetContentKey.mockReturnValue(largeTraitTreeCollection);

      // Should quickly find existing trait trees
      const tree50 = traitTreeGet('tree-50');
      expect((tree50 as any).name).toBe('Tree 50');

      const tree99 = traitTreeGet('tree-99');
      expect((tree99 as any).allTreeTraits['Trait-99-1'].maxLevel).toBe(5);

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => traitTreeGet('any')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => traitTreeGet('any')).toThrow();
    });

    it('should handle empty collections gracefully', () => {
      mockGetContentKey.mockReturnValue({});

      const traitTree = traitTreeGet('missing');
      expect(traitTree).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle very long trait tree names', () => {
      const longName =
        'very-long-trait-tree-name-that-exceeds-normal-limits-and-continues-for-a-very-long-time-to-test-edge-cases';
      const traitTrees = {};

      mockGetContentKey.mockReturnValue(traitTrees);

      traitTreeGet(longName);

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        `Content:TraitTree:${longName}`,
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain(longName);
    });

    it('should preserve error message format', () => {
      mockGetContentKey.mockReturnValue({});

      traitTreeGet('test-tree');

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[0]).toBe('Content:TraitTree:test-tree');
      expect(errorCall[1].message).toBe('Trait Tree test-tree does not exist.');
      expect(errorCall[1]).toBeInstanceOf(Error);
    });

    it('should handle special characters in error messages', () => {
      const specialName = 'trait-tree_with.special!chars@#$%';
      mockGetContentKey.mockReturnValue({});

      traitTreeGet(specialName);

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain(specialName);
    });
  });
});
