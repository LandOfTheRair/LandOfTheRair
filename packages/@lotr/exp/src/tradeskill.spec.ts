import type { IPlayer, Tradeskill } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import {
  calcTradeskillLevelForCharacter,
  calculateTradeskillLevelFromXP,
  calculateTradeskillXPRequiredForLevel,
} from './tradeskill';

describe('Tradeskill Functions', () => {
  describe('calculateTradeskillXPRequiredForLevel', () => {
    it('should return consistent XP values for levels 0-30', () => {
      // Expected XP values for tradeskill levels 0-30 (calculated once and stored to prevent regression)
      const expectedTradeskillXPValues: Record<number, number> = {
        0: 5,
        1: 6,
        2: 9,
        3: 12,
        4: 16,
        5: 22,
        6: 30,
        7: 40,
        8: 55,
        9: 74,
        10: 100,
        11: 135,
        12: 183,
        13: 247,
        14: 333,
        15: 450,
        16: 608,
        17: 821,
        18: 1109,
        19: 1497,
        20: 2021,
        21: 2728,
        22: 3683,
        23: 4973,
        24: 6713,
        25: 9063,
        26: 12236,
        27: 16518,
        28: 22300,
        29: 30105,
        30: 40642,
      };

      // Test each level from 0 to 30
      for (let level = 0; level <= 30; level++) {
        const actualXP = calculateTradeskillXPRequiredForLevel(level);
        expect(actualXP).toBe(expectedTradeskillXPValues[level]);
      }
    });

    it('should return increasing XP values for consecutive levels', () => {
      for (let level = 0; level < 30; level++) {
        const currentLevelXP = calculateTradeskillXPRequiredForLevel(level);
        const nextLevelXP = calculateTradeskillXPRequiredForLevel(level + 1);
        expect(nextLevelXP).toBeGreaterThan(currentLevelXP);
      }
    });

    it('should handle edge cases', () => {
      // Level 0 should return 5
      expect(calculateTradeskillXPRequiredForLevel(0)).toBe(5);

      // Negative levels should still work (edge case)
      expect(() => calculateTradeskillXPRequiredForLevel(-1)).not.toThrow();

      // Very high levels should return very high values
      const level40XP = calculateTradeskillXPRequiredForLevel(40);
      expect(level40XP).toBeGreaterThan(40642);
    });
  });

  describe('calculateTradeskillLevelFromXP', () => {
    it('should return 0 for XP below 5', () => {
      expect(calculateTradeskillLevelFromXP(0)).toBe(0);
      expect(calculateTradeskillLevelFromXP(3)).toBe(0);
      expect(calculateTradeskillLevelFromXP(4)).toBe(0);
    });

    it('should return correct levels for specific XP thresholds', () => {
      // Test boundary values based on actual function behavior
      expect(calculateTradeskillLevelFromXP(5)).toBe(0); // Just at boundary, still level 0
      expect(calculateTradeskillLevelFromXP(6)).toBe(0); // At level 1 XP requirement but still level 0
      expect(calculateTradeskillLevelFromXP(7)).toBe(1); // Just above, reaches level 1
      expect(calculateTradeskillLevelFromXP(9)).toBe(1); // At level 2 XP requirement but still level 1
      expect(calculateTradeskillLevelFromXP(10)).toBe(2); // Just above level 2 threshold
      expect(calculateTradeskillLevelFromXP(12)).toBe(2); // At level 3 XP requirement
    });

    it('should correctly calculate levels for known XP values', () => {
      // Test some known conversions based on actual behavior
      const testCases = [
        { xp: 6, expectedLevel: 0 }, // Level 1 threshold XP but gives level 0
        { xp: 9, expectedLevel: 1 }, // Level 2 threshold XP but gives level 1
        { xp: 12, expectedLevel: 2 }, // Level 3 threshold XP gives level 2
        { xp: 16, expectedLevel: 3 }, // Level 4 threshold XP gives level 3
        { xp: 22, expectedLevel: 4 }, // Level 5 threshold XP gives level 4
        { xp: 30, expectedLevel: 5 }, // Level 6 threshold XP gives level 5
        { xp: 40, expectedLevel: 6 }, // Level 7 threshold XP gives level 6
        { xp: 55, expectedLevel: 7 }, // Level 8 threshold XP gives level 7
        { xp: 74, expectedLevel: 8 }, // Level 9 threshold XP gives level 8
        { xp: 100, expectedLevel: 9 }, // Level 10 threshold XP gives level 9
      ];

      testCases.forEach(({ xp, expectedLevel }) => {
        expect(calculateTradeskillLevelFromXP(xp)).toBe(expectedLevel);
      });
    });

    it('should be consistent with calculateTradeskillXPRequiredForLevel', () => {
      // For tradeskills, the XP required for level N gives level N-1 (due to no adjustment like skills)
      for (let level = 1; level <= 20; level++) {
        const requiredXP = calculateTradeskillXPRequiredForLevel(level);
        const calculatedLevel = calculateTradeskillLevelFromXP(requiredXP);
        expect(calculatedLevel).toBe(level - 1); // Tradeskills don't have the +1 adjustment
      }
    });

    it('should handle null/undefined XP values', () => {
      expect(calculateTradeskillLevelFromXP(null as any)).toBe(0);
      expect(calculateTradeskillLevelFromXP(undefined as any)).toBe(0);
    });

    it('should handle tradeskill progression correctly', () => {
      // Test that levels increase appropriately with XP
      const xpValues = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

      for (let i = 1; i < xpValues.length; i++) {
        const prevLevel = calculateTradeskillLevelFromXP(xpValues[i - 1]);
        const currentLevel = calculateTradeskillLevelFromXP(xpValues[i]);

        expect(currentLevel).toBeGreaterThanOrEqual(prevLevel);
      }
    });

    it('should handle the coefficient-based calculation correctly', () => {
      // Test specific mathematical properties
      // Since tradeskills use Math.log(skillValue / 5) / Math.log(1.35)
      // and Math.floor, we can test some specific values

      // XP 5 should give level 0 (5/5 = 1, log(1) = 0)
      expect(calculateTradeskillLevelFromXP(5)).toBe(0);

      // Test some calculated boundaries
      expect(calculateTradeskillLevelFromXP(6)).toBe(0); // Still level 0
      expect(calculateTradeskillLevelFromXP(7)).toBe(1); // Now level 1
      expect(calculateTradeskillLevelFromXP(8)).toBe(1); // Still level 1
      expect(calculateTradeskillLevelFromXP(9)).toBe(1); // Still level 1
      expect(calculateTradeskillLevelFromXP(10)).toBe(2); // Now level 2
      expect(calculateTradeskillLevelFromXP(11)).toBe(2); // Still level 2
      expect(calculateTradeskillLevelFromXP(12)).toBe(2); // Now level 2
    });
  });

  describe('calcTradeskillLevelForCharacter', () => {
    const createMockPlayer = (skillValue: number): IPlayer =>
      ({
        tradeskills: {
          alchemy: skillValue,
        },
      }) as IPlayer;

    it('should calculate tradeskill level correctly', () => {
      const character = createMockPlayer(30);
      const result = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );
      expect(result).toBe(5);
    });

    it('should handle lowercase tradeskill names', () => {
      const character = {
        tradeskills: {
          alchemy: 30,
        },
      } as IPlayer;
      const result = calcTradeskillLevelForCharacter(
        character,
        'ALCHEMY' as Tradeskill,
      );
      expect(result).toBe(5);
    });

    it('should handle missing tradeskills (returns 0)', () => {
      const character = { tradeskills: {} } as IPlayer;
      const result = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );
      expect(result).toBe(0);
    });

    it('should throw error for null tradeskill parameter', () => {
      const character = createMockPlayer(30);
      expect(() => {
        calcTradeskillLevelForCharacter(character, null as any);
      }).toThrow('Trying to calculate skill of undefined');
    });

    it('should throw error for undefined tradeskill parameter', () => {
      const character = createMockPlayer(30);
      expect(() => {
        calcTradeskillLevelForCharacter(character, undefined as any);
      }).toThrow('Trying to calculate skill of undefined');
    });

    it('should handle tradeskill value of 0', () => {
      const character = createMockPlayer(0);
      const result = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );
      expect(result).toBe(0);
    });

    it('should handle low tradeskill values (below 5)', () => {
      const character = createMockPlayer(3);
      const result = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );
      expect(result).toBe(0);
    });

    it('should handle high tradeskill values', () => {
      const character = createMockPlayer(1000);
      const result = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );
      expect(result).toBe(17); // Based on calculateTradeskillLevelFromXP(1000)
    });

    it('should handle null coalescing for missing tradeskill values', () => {
      const character = { tradeskills: { alchemy: null } } as any;
      const result = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );
      expect(result).toBe(0);
    });

    it('should work with all tradeskill types', () => {
      const tradeskillTypes: Tradeskill[] = [
        'alchemy' as Tradeskill,
        'spellforging' as Tradeskill,
        'metalworking' as Tradeskill,
        'gemcrafting' as Tradeskill,
        'weavefabricating' as Tradeskill,
        'foodmaking' as Tradeskill,
      ];

      tradeskillTypes.forEach((tradeskill) => {
        const character = {
          tradeskills: {
            [tradeskill.toLowerCase()]: 50,
          },
        } as IPlayer;

        const result = calcTradeskillLevelForCharacter(character, tradeskill);
        expect(result).toBe(7); // Level for 50 XP
      });
    });
  });

  describe('Integration Tests', () => {
    it('should have consistent behavior between tradeskill calculation functions', () => {
      // Test with exact level boundary XP
      const testXP = 22; // Exact XP for level 5
      const level = calculateTradeskillLevelFromXP(testXP);
      const requiredXP = calculateTradeskillXPRequiredForLevel(level + 1);
      const nextLevelXP = calculateTradeskillXPRequiredForLevel(level + 2);

      // Current XP should equal the required XP for the next level (since tradeskill gives level - 1)
      expect(testXP).toBe(requiredXP);
      // Current XP should be less than required XP for level after next
      expect(testXP).toBeLessThan(nextLevelXP);
    });

    it('should have consistent results between direct calculation and character function', () => {
      const tradeskillValue = 100;
      const character = {
        tradeskills: { alchemy: tradeskillValue },
      } as IPlayer;

      const directLevel = calculateTradeskillLevelFromXP(tradeskillValue);
      const characterLevel = calcTradeskillLevelForCharacter(
        character,
        'alchemy' as Tradeskill,
      );

      expect(directLevel).toBe(characterLevel);
    });

    it('should handle edge cases consistently', () => {
      // Test boundary values
      const boundaryValues = [4, 5, 6, 21, 22, 23, 99, 100, 101];

      boundaryValues.forEach((value) => {
        const character = { tradeskills: { alchemy: value } } as IPlayer;
        const directLevel = calculateTradeskillLevelFromXP(value);
        const characterLevel = calcTradeskillLevelForCharacter(
          character,
          'alchemy' as Tradeskill,
        );

        expect(directLevel).toBe(characterLevel);
      });
    });
  });
});
