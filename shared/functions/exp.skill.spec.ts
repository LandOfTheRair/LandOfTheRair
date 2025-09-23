import { describe, expect, it } from 'vitest';
import {
  calculateSkillLevelFromXP,
  calculateSkillXPRequiredForLevel,
} from './exp';

describe('Skill Functions', () => {
  describe('calculateSkillXPRequiredForLevel', () => {
    it('should return consistent XP values for levels 0-40', () => {
      // Expected XP values for skill levels 0-40 (calculated once and stored to prevent regression)
      const expectedSkillXPValues: Record<number, number> = {
        0: 100,
        1: 155,
        2: 240,
        3: 372,
        4: 577,
        5: 894,
        6: 1386,
        7: 2149,
        8: 3331,
        9: 5163,
        10: 8004,
        11: 12406,
        12: 19230,
        13: 29806,
        14: 46200,
        15: 71610,
        16: 110995,
        17: 172043,
        18: 266667,
        19: 413335,
        20: 640669,
        21: 993037,
        22: 1539208,
        23: 2385772,
        24: 3697947,
        25: 5731818,
        26: 8884319,
        27: 13770694,
        28: 21344576,
        29: 33084094,
        30: 51280345,
        31: 79484535,
        32: 123201030,
        33: 190961597,
        34: 295990476,
        35: 458785238,
        36: 711117119,
        37: 1102231535,
        38: 1708458880,
        39: 2648111264,
        40: 4104572459,
      };

      // Test each level from 0 to 40
      for (let level = 0; level <= 40; level++) {
        const actualXP = calculateSkillXPRequiredForLevel(level);
        expect(actualXP).toBe(expectedSkillXPValues[level]);
      }
    });

    it('should return increasing XP values for consecutive levels', () => {
      for (let level = 0; level < 40; level++) {
        const currentLevelXP = calculateSkillXPRequiredForLevel(level);
        const nextLevelXP = calculateSkillXPRequiredForLevel(level + 1);
        expect(nextLevelXP).toBeGreaterThan(currentLevelXP);
      }
    });
  });

  describe('calculateSkillLevelFromXP', () => {
    it('should return 0 for XP below 100', () => {
      expect(calculateSkillLevelFromXP(0)).toBe(0);
      expect(calculateSkillLevelFromXP(50)).toBe(0);
      expect(calculateSkillLevelFromXP(99)).toBe(0);
    });

    it('should return correct levels for specific XP thresholds', () => {
      expect(calculateSkillLevelFromXP(100)).toBe(0);
      expect(calculateSkillLevelFromXP(154)).toBe(1);
      expect(calculateSkillLevelFromXP(155)).toBe(1);
      expect(calculateSkillLevelFromXP(240)).toBe(2);
      expect(calculateSkillLevelFromXP(372)).toBe(3);
    });

    it('should correctly calculate levels for known XP values', () => {
      const testCases = [
        { xp: 155, expectedLevel: 1 },
        { xp: 240, expectedLevel: 2 },
        { xp: 372, expectedLevel: 3 },
        { xp: 577, expectedLevel: 4 },
        { xp: 894, expectedLevel: 5 },
        { xp: 1386, expectedLevel: 6 },
        { xp: 2149, expectedLevel: 7 },
        { xp: 3331, expectedLevel: 8 },
        { xp: 5163, expectedLevel: 9 },
        { xp: 8004, expectedLevel: 10 },
      ];

      testCases.forEach(({ xp, expectedLevel }) => {
        expect(calculateSkillLevelFromXP(xp)).toBe(expectedLevel);
      });
    });

    it('should be consistent with calculateSkillXPRequiredForLevel', () => {
      // For each level, the exact XP required should give that level
      for (let level = 1; level <= 20; level++) {
        const requiredXP = calculateSkillXPRequiredForLevel(level);
        const calculatedLevel = calculateSkillLevelFromXP(requiredXP);
        expect(calculatedLevel).toBe(level);
      }
    });

    it('should handle null/undefined XP values', () => {
      expect(calculateSkillLevelFromXP(null as any)).toBe(0);
      expect(calculateSkillLevelFromXP(undefined as any)).toBe(0);
    });
  });
});
