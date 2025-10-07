import { getStat } from '@lotr/characters';
import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import * as lodash from 'lodash';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  diceRoll,
  oneInX,
  oneToLUK,
  oneToStat,
  rollInOneHundred,
  rollInY,
  uniformRoll,
} from './dice';

// Mock dependencies
vi.mock('@lotr/characters', () => ({
  getStat: vi.fn(),
}));

vi.mock('lodash', () => ({
  random: vi.fn(),
}));

describe('Dice Functions', () => {
  const createMockCharacter = (
    stats: Partial<Record<Stat, number>> = {},
  ): ICharacter =>
    ({
      uuid: 'test-char-uuid',
      name: 'Test Character',
      totalStats: {
        [Stat.LUK]: 10,
        [Stat.STR]: 15,
        [Stat.INT]: 12,
        ...stats,
      },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random for diceRoll tests
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rollInY', () => {
    it('should return true when random roll is less than desired max', () => {
      vi.mocked(lodash.random).mockReturnValue(3);

      const result = rollInY(5, 100);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(0, 100);
    });

    it('should return false when random roll is equal to or greater than desired max', () => {
      vi.mocked(lodash.random).mockReturnValue(5);

      const result = rollInY(5, 100);

      expect(result).toBe(false);
      expect(lodash.random).toHaveBeenCalledWith(0, 100);
    });

    it('should return false when random roll exceeds desired max', () => {
      vi.mocked(lodash.random).mockReturnValue(8);

      const result = rollInY(5, 100);

      expect(result).toBe(false);
    });

    it('should work with different cap values', () => {
      vi.mocked(lodash.random).mockReturnValue(2);

      const result = rollInY(5, 20);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(0, 20);
    });

    it('should work with zero desired max', () => {
      vi.mocked(lodash.random).mockReturnValue(0);

      const result = rollInY(0, 100);

      expect(result).toBe(false);
    });

    it('should work with very small numbers', () => {
      vi.mocked(lodash.random).mockReturnValue(0);

      const result = rollInY(1, 2);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(0, 2);
    });

    it('should handle edge case where desired max equals cap', () => {
      vi.mocked(lodash.random).mockReturnValue(10);

      const result = rollInY(10, 10);

      expect(result).toBe(false);
    });
  });

  describe('rollInOneHundred', () => {
    it('should return false when desired roll max is zero or negative', () => {
      const result1 = rollInOneHundred(0);
      const result2 = rollInOneHundred(-5);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(lodash.random).not.toHaveBeenCalled();
    });

    it('should call rollInY with 100 as cap for positive values', () => {
      vi.mocked(lodash.random).mockReturnValue(3);

      const result = rollInOneHundred(5);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(0, 100);
    });

    it('should return false when roll fails', () => {
      vi.mocked(lodash.random).mockReturnValue(50);

      const result = rollInOneHundred(25);

      expect(result).toBe(false);
    });

    it('should work with value of 1', () => {
      vi.mocked(lodash.random).mockReturnValue(0);

      const result = rollInOneHundred(1);

      expect(result).toBe(true);
    });

    it('should work with value of 100', () => {
      vi.mocked(lodash.random).mockReturnValue(50);

      const result = rollInOneHundred(100);

      expect(result).toBe(true);
    });

    it('should handle negative numbers', () => {
      const result = rollInOneHundred(-10);

      expect(result).toBe(false);
    });
  });

  describe('oneInX', () => {
    it('should return false when x is zero or negative', () => {
      const result1 = oneInX(0);
      const result2 = oneInX(-5);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(lodash.random).not.toHaveBeenCalled();
    });

    it('should return true when random roll equals 1', () => {
      vi.mocked(lodash.random).mockReturnValue(1);

      const result = oneInX(5);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(1, 5);
    });

    it('should return false when random roll is not 1', () => {
      vi.mocked(lodash.random).mockReturnValue(3);

      const result = oneInX(5);

      expect(result).toBe(false);
      expect(lodash.random).toHaveBeenCalledWith(1, 5);
    });

    it('should work with x equals 1 (always true)', () => {
      vi.mocked(lodash.random).mockReturnValue(1);

      const result = oneInX(1);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(1, 1);
    });

    it('should work with large numbers', () => {
      vi.mocked(lodash.random).mockReturnValue(1);

      const result = oneInX(1000);

      expect(result).toBe(true);
      expect(lodash.random).toHaveBeenCalledWith(1, 1000);
    });

    it('should handle when roll is maximum value', () => {
      vi.mocked(lodash.random).mockReturnValue(10);

      const result = oneInX(10);

      expect(result).toBe(false);
    });
  });

  describe('uniformRoll', () => {
    it('should return x plus random value between 0 and x*y', () => {
      vi.mocked(lodash.random).mockReturnValue(5);

      const result = uniformRoll(3, 4);

      expect(result).toBe(8); // 3 + 5
      expect(lodash.random).toHaveBeenCalledWith(12); // 3 * 4
    });

    it('should work with zero values', () => {
      vi.mocked(lodash.random).mockReturnValue(0);

      const result = uniformRoll(0, 5);

      expect(result).toBe(0); // 0 + 0
      expect(lodash.random).toHaveBeenCalledWith(0); // 0 * 5
    });

    it('should work with negative x', () => {
      vi.mocked(lodash.random).mockReturnValue(10);

      const result = uniformRoll(-2, 5);

      expect(result).toBe(8); // -2 + 10
      expect(lodash.random).toHaveBeenCalledWith(-10); // -2 * 5
    });

    it('should work with fractional numbers', () => {
      vi.mocked(lodash.random).mockReturnValue(3.5);

      const result = uniformRoll(2.5, 4);

      expect(result).toBe(6); // 2.5 + 3.5
      expect(lodash.random).toHaveBeenCalledWith(10); // 2.5 * 4
    });

    it('should work with large numbers', () => {
      vi.mocked(lodash.random).mockReturnValue(500);

      const result = uniformRoll(100, 200);

      expect(result).toBe(600); // 100 + 500
      expect(lodash.random).toHaveBeenCalledWith(20000); // 100 * 200
    });

    it('should work when one value is zero', () => {
      vi.mocked(lodash.random).mockReturnValue(0);

      const result1 = uniformRoll(5, 0);
      const result2 = uniformRoll(0, 5);

      expect(result1).toBe(5); // 5 + 0
      expect(result2).toBe(0); // 0 + 0
    });
  });

  describe('diceRoll', () => {
    it('should calculate dice roll with default minSidesDivisor', () => {
      vi.mocked(Math.random).mockReturnValue(0.5); // Middle value

      const result = diceRoll(2, 6);

      expect(result).toBe(10); // 2 * (3 + Math.floor(0.5 * 4)) = 2 * (3 + 2) = 10
      expect(Math.random).toHaveBeenCalled();
    });

    it('should calculate dice roll with custom minSidesDivisor', () => {
      vi.mocked(Math.random).mockReturnValue(0); // Minimum random value

      const result = diceRoll(3, 10, 5);

      expect(result).toBe(6); // 3 * (2 + Math.floor(0 * 9)) = 3 * (2 + 0) = 6
    });

    it('should handle minimum random value', () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const result = diceRoll(1, 6);

      expect(result).toBe(3); // 1 * (3 + Math.floor(0 * 4)) = 1 * (3 + 0) = 3
    });

    it('should handle maximum random value (just under 1)', () => {
      vi.mocked(Math.random).mockReturnValue(0.999);

      const result = diceRoll(1, 6);

      expect(result).toBe(6); // 1 * (3 + Math.floor(0.999 * 4)) = 1 * (3 + 3) = 6
    });

    it('should work with single roll', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const result = diceRoll(1, 20);

      expect(result).toBe(15); // 1 * (10 + Math.floor(0.5 * 11)) = 1 * (10 + 5) = 15
    });

    it('should work with multiple rolls', () => {
      vi.mocked(Math.random).mockReturnValue(0.25);

      const result = diceRoll(4, 8);

      expect(result).toBe(20); // 4 * (4 + Math.floor(0.25 * 5)) = 4 * (4 + 1) = 20
    });

    it('should work with zero rolls', () => {
      const result = diceRoll(0, 6);

      expect(result).toBe(0); // 0 * anything = 0
    });

    it('should handle very large numbers', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);

      const result = diceRoll(10, 100);

      expect(result).toBe(750); // 10 * (50 + Math.floor(0.5 * 51)) = 10 * (50 + 25) = 750
    });
  });

  describe('oneToStat', () => {
    it('should return random value between 1 and character stat', () => {
      const character = createMockCharacter({ [Stat.STR]: 15 });
      vi.mocked(getStat).mockReturnValue(15);
      vi.mocked(lodash.random).mockReturnValue(8);

      const result = oneToStat(character, Stat.STR);

      expect(result).toBe(8);
      expect(getStat).toHaveBeenCalledWith(character, Stat.STR);
      expect(lodash.random).toHaveBeenCalledWith(1, 15);
    });

    it('should work with different stats', () => {
      const character = createMockCharacter({ [Stat.INT]: 20 });
      vi.mocked(getStat).mockReturnValue(20);
      vi.mocked(lodash.random).mockReturnValue(12);

      const result = oneToStat(character, Stat.INT);

      expect(result).toBe(12);
      expect(getStat).toHaveBeenCalledWith(character, Stat.INT);
      expect(lodash.random).toHaveBeenCalledWith(1, 20);
    });

    it('should handle minimum stat value of 1', () => {
      const character = createMockCharacter({ [Stat.LUK]: 1 });
      vi.mocked(getStat).mockReturnValue(1);
      vi.mocked(lodash.random).mockReturnValue(1);

      const result = oneToStat(character, Stat.LUK);

      expect(result).toBe(1);
      expect(lodash.random).toHaveBeenCalledWith(1, 1);
    });

    it('should handle high stat values', () => {
      const character = createMockCharacter({ [Stat.CON]: 100 });
      vi.mocked(getStat).mockReturnValue(100);
      vi.mocked(lodash.random).mockReturnValue(75);

      const result = oneToStat(character, Stat.CON);

      expect(result).toBe(75);
      expect(lodash.random).toHaveBeenCalledWith(1, 100);
    });

    it('should handle zero stat value', () => {
      const character = createMockCharacter({ [Stat.CHA]: 0 });
      vi.mocked(getStat).mockReturnValue(0);
      vi.mocked(lodash.random).mockReturnValue(0);

      const result = oneToStat(character, Stat.CHA);

      expect(result).toBe(0);
      expect(lodash.random).toHaveBeenCalledWith(1, 0);
    });

    it('should work with all stat types', () => {
      const character = createMockCharacter();
      const stats = [
        Stat.STR,
        Stat.INT,
        Stat.WIS,
        Stat.CON,
        Stat.DEX,
        Stat.AGI,
        Stat.CHA,
        Stat.LUK,
      ];

      stats.forEach((stat, index) => {
        const statValue = 10 + index;
        vi.mocked(getStat).mockReturnValue(statValue);
        vi.mocked(lodash.random).mockReturnValue(5);

        const result = oneToStat(character, stat);

        expect(result).toBe(5);
        expect(getStat).toHaveBeenCalledWith(character, stat);
      });
    });
  });

  describe('oneToLUK', () => {
    it('should call oneToStat with LUK stat', () => {
      const character = createMockCharacter({ [Stat.LUK]: 15 });
      vi.mocked(getStat).mockReturnValue(15);
      vi.mocked(lodash.random).mockReturnValue(8);

      const result = oneToLUK(character);

      expect(result).toBe(8);
      expect(getStat).toHaveBeenCalledWith(character, Stat.LUK);
      expect(lodash.random).toHaveBeenCalledWith(1, 15);
    });

    it('should work with different LUK values', () => {
      const character = createMockCharacter({ [Stat.LUK]: 25 });
      vi.mocked(getStat).mockReturnValue(25);
      vi.mocked(lodash.random).mockReturnValue(20);

      const result = oneToLUK(character);

      expect(result).toBe(20);
      expect(getStat).toHaveBeenCalledWith(character, Stat.LUK);
    });

    it('should handle minimum LUK value', () => {
      const character = createMockCharacter({ [Stat.LUK]: 1 });
      vi.mocked(getStat).mockReturnValue(1);
      vi.mocked(lodash.random).mockReturnValue(1);

      const result = oneToLUK(character);

      expect(result).toBe(1);
    });

    it('should handle high LUK values', () => {
      const character = createMockCharacter({ [Stat.LUK]: 50 });
      vi.mocked(getStat).mockReturnValue(50);
      vi.mocked(lodash.random).mockReturnValue(35);

      const result = oneToLUK(character);

      expect(result).toBe(35);
    });

    it('should handle zero LUK', () => {
      const character = createMockCharacter({ [Stat.LUK]: 0 });
      vi.mocked(getStat).mockReturnValue(0);
      vi.mocked(lodash.random).mockReturnValue(0);

      const result = oneToLUK(character);

      expect(result).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complex probability scenarios', () => {
      // Test a scenario where multiple functions might be used together
      vi.mocked(lodash.random).mockReturnValue(2);

      const inYResult = rollInY(5, 10);
      const oneHundredResult = rollInOneHundred(25);
      const oneInXResult = oneInX(3);

      expect(inYResult).toBe(true); // 2 < 5
      expect(oneHundredResult).toBe(true); // Uses rollInY internally
      expect(oneInXResult).toBe(false); // 2 !== 1
    });

    it('should handle edge cases consistently', () => {
      // Test edge cases across functions
      expect(rollInOneHundred(0)).toBe(false);
      expect(oneInX(0)).toBe(false);
      expect(diceRoll(0, 6)).toBe(0);
    });

    it('should maintain randomization consistency', () => {
      const character = createMockCharacter({ [Stat.LUK]: 10 });
      vi.mocked(getStat).mockReturnValue(10);
      vi.mocked(lodash.random).mockReturnValue(5);

      const statRoll = oneToStat(character, Stat.LUK);
      const lukRoll = oneToLUK(character);

      expect(statRoll).toBe(lukRoll); // Should be the same since they use the same mocked value
    });
  });
});
