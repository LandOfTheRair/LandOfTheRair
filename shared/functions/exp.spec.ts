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
        20: 529288000,
        21: 1083576000,
        22: 1637864000,
        23: 2192152000,
        24: 2746440000,
        25: 3300728000,
        26: 3855016000,
        27: 4409304000,
        28: 4963592000,
        29: 5517880000,
        30: 6072168000,
        31: 6626456000,
        32: 7180744000,
        33: 7735032000,
        34: 8289320000,
        35: 8843608000,
        36: 9397896000,
        37: 9952184000,
        38: 10506472000,
        39: 11060760000,
        40: 11615048000,
        41: 12169336000,
        42: 12723624000,
        43: 13277912000,
        44: 13832200000,
        45: 14386488000,
        46: 14940776000,
        47: 15495064000,
        48: 16049352000,
        49: 16603640000,
        50: 17157928000,
        51: 25774392000,
        52: 51623784000,
        53: 86164640000,
        54: 129434460000,
        55: 181470744000,
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
      expect(level20XP).toBe(529288000);

      // Test the level 50 breakpoint
      const level50XP = calculateXPRequiredForLevel(50);
      const level51XP = calculateXPRequiredForLevel(51);

      expect(level50XP).toBe(17157928000);
      expect(level51XP).toBe(25774392000);

      // Test specific high-level calculations (these use internal level50XP which differs from level 50 result)
      expect(calculateXPRequiredForLevel(52)).toBe(51623784000);
      expect(calculateXPRequiredForLevel(53)).toBe(86164640000);
      expect(calculateXPRequiredForLevel(54)).toBe(129434460000);
      expect(calculateXPRequiredForLevel(55)).toBe(181470744000);
    });
  });
});
