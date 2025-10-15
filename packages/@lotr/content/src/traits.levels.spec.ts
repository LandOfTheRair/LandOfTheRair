import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { traitHasLearned, traitLevel, traitLevelValue } from './traits.levels';

// Mock dependencies
vi.mock('./traits', () => ({
  traitGet: vi.fn(),
}));

import { traitGet } from './traits';

describe('traits.levels', () => {
  let mockCharacter: ICharacter;
  let mockPlayer: IPlayer;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCharacter = {
      name: 'TestCharacter',
      allTraits: {
        TestTrait: 3,
        AnotherTrait: 0,
        MaxTrait: 5,
      },
    } as unknown as ICharacter;

    mockPlayer = {
      name: 'TestPlayer',
      allTraits: {
        LearnedTrait: 2,
        UnlearnedTrait: 0,
        MasteredTrait: 10,
      },
    } as unknown as IPlayer;
  });

  describe('traitLevel', () => {
    it('should return trait level when trait exists', () => {
      const result = traitLevel(mockCharacter, 'TestTrait');

      expect(result).toBe(3);
    });

    it('should return 0 when trait does not exist', () => {
      const result = traitLevel(mockCharacter, 'NonexistentTrait');

      expect(result).toBe(0);
    });

    it('should return 0 when trait level is explicitly 0', () => {
      const result = traitLevel(mockCharacter, 'AnotherTrait');

      expect(result).toBe(0);
    });

    it('should throw error for character with no allTraits property', () => {
      const characterWithoutTraits = {
        name: 'NoTraits',
      } as unknown as ICharacter;

      expect(() => {
        traitLevel(characterWithoutTraits, 'TestTrait');
      }).toThrow('Cannot read properties of undefined');
    });

    it('should handle null/undefined character gracefully', () => {
      expect(() => {
        traitLevel(null as any, 'TestTrait');
      }).toThrow();

      expect(() => {
        traitLevel(undefined as any, 'TestTrait');
      }).toThrow();
    });

    it('should handle empty string trait name', () => {
      const result = traitLevel(mockCharacter, '');

      expect(result).toBe(0);
    });

    it('should handle special characters in trait name', () => {
      mockCharacter.allTraits['Special-Trait_123'] = 7;

      const result = traitLevel(mockCharacter, 'Special-Trait_123');

      expect(result).toBe(7);
    });

    it('should handle case sensitivity in trait names', () => {
      const result1 = traitLevel(mockCharacter, 'TestTrait');
      const result2 = traitLevel(mockCharacter, 'testtrait');
      const result3 = traitLevel(mockCharacter, 'TESTTRAIT');

      expect(result1).toBe(3);
      expect(result2).toBe(0); // Case sensitive
      expect(result3).toBe(0); // Case sensitive
    });

    it('should handle maximum trait levels', () => {
      const result = traitLevel(mockCharacter, 'MaxTrait');

      expect(result).toBe(5);
    });

    it('should handle negative trait levels', () => {
      mockCharacter.allTraits['NegativeTrait'] = -2;

      const result = traitLevel(mockCharacter, 'NegativeTrait');

      expect(result).toBe(-2);
    });
  });

  describe('traitHasLearned', () => {
    it('should return true for learned traits (level > 0)', () => {
      const result = traitHasLearned(mockPlayer, 'LearnedTrait');

      expect(result).toBe(true);
    });

    it('should return false for unlearned traits (level = 0)', () => {
      const result = traitHasLearned(mockPlayer, 'UnlearnedTrait');

      expect(result).toBe(false);
    });

    it('should return false for non-existent traits', () => {
      const result = traitHasLearned(mockPlayer, 'NonexistentTrait');

      expect(result).toBe(false);
    });

    it('should return true for mastered traits (high level)', () => {
      const result = traitHasLearned(mockPlayer, 'MasteredTrait');

      expect(result).toBe(true);
    });

    it('should throw error for player with no allTraits property', () => {
      const playerWithoutTraits = { name: 'NoTraits' } as unknown as IPlayer;

      expect(() => {
        traitHasLearned(playerWithoutTraits, 'TestTrait');
      }).toThrow('Cannot read properties of undefined');
    });

    it('should handle edge case of trait level exactly 1', () => {
      mockPlayer.allTraits['EdgeTrait'] = 1;

      const result = traitHasLearned(mockPlayer, 'EdgeTrait');

      expect(result).toBe(true);
    });

    it('should handle negative trait levels', () => {
      mockPlayer.allTraits['NegativeTrait'] = -1;

      const result = traitHasLearned(mockPlayer, 'NegativeTrait');

      expect(result).toBe(false); // -1 is not > 0
    });

    it('should work with IPlayer that extends ICharacter', () => {
      // Since IPlayer extends ICharacter, traitHasLearned uses traitLevel internally
      const result = traitHasLearned(mockPlayer, 'LearnedTrait');

      expect(result).toBe(true);
    });
  });

  describe('traitLevelValue', () => {
    beforeEach(() => {
      // Reset mock to default behavior
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 0.5,
      } as any);
    });

    it('should calculate trait value when trait data exists', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 0.5,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(traitGet).toHaveBeenCalledWith('TestTrait', 'TLV:TestCharacter');
      expect(result).toBe(1.5); // 3 * 0.5
    });

    it('should return 0 when trait data does not exist', () => {
      vi.mocked(traitGet).mockReturnValue(null as any);

      const result = traitLevelValue(mockCharacter, 'NonexistentTrait');

      expect(result).toBe(0);
    });

    it('should return 0 when trait data has no valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        // valuePerTier is missing
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(0);
    });

    it('should return 0 when trait data has undefined valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: undefined,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(0);
    });

    it('should return 0 when trait data has null valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: null,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(0);
    });

    it('should return 0 when trait data has zero valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 0,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(0);
    });

    it('should handle fractional valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 0.25,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(0.75); // 3 * 0.25
    });

    it('should handle large valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 100,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(300); // 3 * 100
    });

    it('should handle negative valuePerTier', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: -2,
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(-6); // 3 * -2
    });

    it('should return 0 when character has no trait level', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 0.5,
      } as any);

      const result = traitLevelValue(mockCharacter, 'NonexistentTrait');

      expect(result).toBe(0); // 0 * 0.5
    });

    it('should handle character with zero trait level', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'AnotherTrait',
        valuePerTier: 0.5,
      } as any);

      const result = traitLevelValue(mockCharacter, 'AnotherTrait');

      expect(result).toBe(0); // 0 * 0.5
    });

    it('should generate correct traitGet key with character name', () => {
      traitLevelValue(mockCharacter, 'TestTrait');

      expect(traitGet).toHaveBeenCalledWith('TestTrait', 'TLV:TestCharacter');
    });

    it('should handle character names with special characters', () => {
      const characterWithSpecialName = {
        name: 'Test-Character_123',
        allTraits: { TestTrait: 2 },
      } as unknown as ICharacter;

      traitLevelValue(characterWithSpecialName, 'TestTrait');

      expect(traitGet).toHaveBeenCalledWith(
        'TestTrait',
        'TLV:Test-Character_123',
      );
    });

    it('should handle empty character name', () => {
      const characterWithEmptyName = {
        name: '',
        allTraits: { TestTrait: 2 },
      } as unknown as ICharacter;

      traitLevelValue(characterWithEmptyName, 'TestTrait');

      expect(traitGet).toHaveBeenCalledWith('TestTrait', 'TLV:');
    });

    it('should handle character with undefined name', () => {
      const characterWithoutName = {
        allTraits: { TestTrait: 2 },
      } as unknown as ICharacter;

      traitLevelValue(characterWithoutName, 'TestTrait');

      expect(traitGet).toHaveBeenCalledWith('TestTrait', 'TLV:undefined');
    });

    it('should use character trait level from allTraits, not from trait data', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'TestTrait',
        valuePerTier: 2,
        level: 99, // This should be ignored
      } as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(6); // Uses 3 from allTraits, not 99 from trait data
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete trait analysis', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'MasterTrait',
        valuePerTier: 10,
      } as any);

      mockPlayer.allTraits['MasterTrait'] = 5;

      const level = traitLevel(mockPlayer, 'MasterTrait');
      const hasLearned = traitHasLearned(mockPlayer, 'MasterTrait');
      const value = traitLevelValue(mockPlayer, 'MasterTrait');

      expect(level).toBe(5);
      expect(hasLearned).toBe(true);
      expect(value).toBe(50);
    });

    it('should handle unlearned trait across all functions', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'UnlearnedTrait',
        valuePerTier: 5,
      } as any);

      const level = traitLevel(mockPlayer, 'TotallyNewTrait');
      const hasLearned = traitHasLearned(mockPlayer, 'TotallyNewTrait');
      const value = traitLevelValue(mockPlayer, 'TotallyNewTrait');

      expect(level).toBe(0);
      expect(hasLearned).toBe(false);
      expect(value).toBe(0);
    });

    it('should handle trait progression simulation', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'ProgressiveTrait',
        valuePerTier: 1.5,
      } as any);

      const traitName = 'ProgressiveTrait';

      // Level 0 - not learned
      mockPlayer.allTraits[traitName] = 0;
      expect(traitHasLearned(mockPlayer, traitName)).toBe(false);
      expect(traitLevelValue(mockPlayer, traitName)).toBe(0);

      // Level 1 - just learned
      mockPlayer.allTraits[traitName] = 1;
      expect(traitHasLearned(mockPlayer, traitName)).toBe(true);
      expect(traitLevelValue(mockPlayer, traitName)).toBe(1.5);

      // Level 3 - improved
      mockPlayer.allTraits[traitName] = 3;
      expect(traitLevel(mockPlayer, traitName)).toBe(3);
      expect(traitLevelValue(mockPlayer, traitName)).toBe(4.5);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large trait levels', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'MegaTrait',
        valuePerTier: 0.1,
      } as any);

      mockCharacter.allTraits['MegaTrait'] = 1000000;

      const result = traitLevelValue(mockCharacter, 'MegaTrait');

      expect(result).toBe(100000);
    });

    it('should handle traitGet throwing an error', () => {
      vi.mocked(traitGet).mockImplementation(() => {
        throw new Error('Trait system error');
      });

      expect(() => {
        traitLevelValue(mockCharacter, 'ErrorTrait');
      }).toThrow('Trait system error');
    });

    it('should handle traitGet returning invalid data types', () => {
      vi.mocked(traitGet).mockReturnValue('invalid string data' as any);

      const result = traitLevelValue(mockCharacter, 'TestTrait');

      expect(result).toBe(0);
    });

    it('should handle floating point precision', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'PrecisionTrait',
        valuePerTier: 0.1,
      } as any);

      mockCharacter.allTraits['PrecisionTrait'] = 3;

      const result = traitLevelValue(mockCharacter, 'PrecisionTrait');

      expect(result).toBeCloseTo(0.3, 10);
    });

    it('should handle concurrent access patterns', () => {
      vi.mocked(traitGet).mockReturnValue({
        name: 'ConcurrentTrait',
        valuePerTier: 1,
      } as any);

      // Simulate multiple characters accessing traits simultaneously
      const characters = Array.from({ length: 5 }, (_, i) => ({
        name: `Character${i}`,
        allTraits: { TestTrait: i + 1 },
      })) as unknown as ICharacter[];

      const results = characters.map((char) => ({
        level: traitLevel(char, 'TestTrait'),
        value: traitLevelValue(char, 'TestTrait'),
      }));

      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.level).toBe(index + 1);
        expect(result.value).toBe(index + 1);
      });
    });
  });
});
