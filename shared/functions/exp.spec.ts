import { describe, expect, it } from 'vitest';
import { calculateXPRequiredForLevel } from './exp';

describe('EXP Functions', () => {
  describe('calculateXPRequiredForLevel', () => {
    it('should return consistent XP values for levels 1-55', () => {
      // Expected XP values for levels 1-55 (calculated once and stored to prevent regression)
      const expectedXPValues: Record<number, number> = {
        1: 1000,
        2: 2000,
        3: 4000,
        4: 8000,
        5: 16000,
        6: 32000,
        7: 64000,
        8: 128000,
        9: 256000,
        10: 512000,
        11: 1024000,
        12: 2048000,
        13: 4096000,
        14: 8192000,
        15: 16384000,
        16: 32768000,
        17: 65536000,
        18: 131072000,
        19: 262144000,
        20: 1029288000,
        21: 1583576000,
        22: 2137864000,
        23: 2692152000,
        24: 3246440000,
        25: 3800728000,
        26: 4355016000,
        27: 4909304000,
        28: 5463592000,
        29: 6017880000,
        30: 6572168000,
        31: 7126456000,
        32: 7680744000,
        33: 8235032000,
        34: 8789320000,
        35: 9343608000,
        36: 9897896000,
        37: 10452184000,
        38: 11006472000,
        39: 11560760000,
        40: 12115048000,
        41: 12669336000,
        42: 13223624000,
        43: 13777912000,
        44: 14332200000,
        45: 14886488000,
        46: 15440776000,
        47: 15995064000,
        48: 16549352000,
        49: 17103640000,
        50: 17657928000,
        51: 26486892000,
        52: 52973784000,
        53: 88289640000,
        54: 132434460000,
        55: 185408244000,
      };

      // Test each level from 1 to 55
      for (let level = 1; level <= 55; level++) {
        const actualXP = calculateXPRequiredForLevel(level);
        const expectedXP = expectedXPValues[level];

        expect(
          actualXP,
          `XP for level ${level} should be ${expectedXP} but got ${actualXP}`,
        ).toBe(expectedXP);
      }
    });

    it('should handle edge cases correctly', () => {
      // Test level 0 (if applicable)
      expect(() => calculateXPRequiredForLevel(0)).not.toThrow();

      // Test negative levels
      expect(() => calculateXPRequiredForLevel(-1)).not.toThrow();

      // Test levels beyond 55 (should return very high values)
      const level56XP = calculateXPRequiredForLevel(56);
      const level57XP = calculateXPRequiredForLevel(57);

      expect(level56XP).toBeGreaterThan(185408244000);
      expect(level57XP).toBeGreaterThan(level56XP);
    });

    it('should return increasing XP values for consecutive levels', () => {
      for (let level = 1; level < 55; level++) {
        const currentLevelXP = calculateXPRequiredForLevel(level);
        const nextLevelXP = calculateXPRequiredForLevel(level + 1);

        expect(
          nextLevelXP,
          `Level ${level + 1} XP should be greater than level ${level} XP`,
        ).toBeGreaterThan(currentLevelXP);
      }
    });

    it('should have specific breakpoint behaviors', () => {
      // Test the level 19 constant changer breakpoint
      const level19XP = calculateXPRequiredForLevel(19);
      const level20XP = calculateXPRequiredForLevel(20);

      expect(level19XP).toBe(262144000);
      expect(level20XP).toBe(1029288000);

      // Test the level 50 breakpoint
      const level50XP = calculateXPRequiredForLevel(50);
      const level51XP = calculateXPRequiredForLevel(51);

      expect(level50XP).toBe(17657928000);
      expect(level51XP).toBe(26486892000);

      // Test specific high-level calculations
      expect(level51XP).toBe(Math.floor(level50XP * 1.5));
      expect(calculateXPRequiredForLevel(52)).toBe(Math.floor(level50XP * 3));
      expect(calculateXPRequiredForLevel(53)).toBe(Math.floor(level50XP * 5));
      expect(calculateXPRequiredForLevel(54)).toBe(Math.floor(level50XP * 7.5));
      expect(calculateXPRequiredForLevel(55)).toBe(
        Math.floor(level50XP * 10.5),
      );
    });
  });
});
