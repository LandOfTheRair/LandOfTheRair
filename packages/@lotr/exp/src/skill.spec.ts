import type { ICharacter, IPlayer, Skill } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import {
  assessPercentToNextSkill,
  calcSkillLevelForCharacter,
  calculateSkillLevelFromXP,
  calculateSkillXPRequiredForLevel,
  percentCompleteSkill,
} from './skill';

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

  describe('percentCompleteSkill', () => {
    const createMockPlayer = (skillValue: number): IPlayer =>
      ({
        skills: {
          sword: skillValue,
        },
      }) as IPlayer;

    it('should handle skill level 0', () => {
      const player = createMockPlayer(50);
      const result = percentCompleteSkill(player, 'sword' as Skill);
      expect(result).toBe('50.000');
    });

    it('should handle exact level boundaries', () => {
      const player = createMockPlayer(155); // Exact level 1
      const result = percentCompleteSkill(player, 'sword' as Skill);
      expect(result).toBe('100.000'); // 100% complete with level 1
    });

    it('should calculate percentage progress correctly', () => {
      const player = createMockPlayer(200); // Level 2, some progress toward level 3
      const result = percentCompleteSkill(player, 'sword' as Skill);
      const expected = (((200 - 155) / (240 - 155)) * 100).toFixed(3);
      expect(result).toBe(expected);
    });

    it('should handle missing skill (undefined)', () => {
      const player = { skills: {} } as IPlayer;
      const result = percentCompleteSkill(player, 'sword' as Skill);
      expect(result).toBe('0.000');
    });

    it('should handle skill value of 0', () => {
      const player = createMockPlayer(0);
      const result = percentCompleteSkill(player, 'sword' as Skill);
      expect(result).toBe('0.000');
    });

    it('should handle level 0 skills correctly', () => {
      const player = createMockPlayer(50); // Below level 1 threshold
      const result = percentCompleteSkill(player, 'sword' as Skill);
      expect(result).toBe('50.000'); // 50/100 * 100 = 50%
    });

    it('should handle high skill values', () => {
      const player = createMockPlayer(1000); // High skill value
      const result = percentCompleteSkill(player, 'sword' as Skill);
      expect(parseFloat(result)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(result)).toBeLessThanOrEqual(100);
    });
  });

  describe('calcSkillLevelForCharacter', () => {
    const createMockCharacter = (skillValue: number): ICharacter =>
      ({
        skills: {
          sword: skillValue,
        },
      }) as ICharacter;

    it('should calculate skill level correctly', () => {
      const character = createMockCharacter(200);
      const result = calcSkillLevelForCharacter(character, 'sword' as Skill);
      expect(result).toBe(2);
    });

    it('should handle lowercase skill names', () => {
      const character = {
        skills: {
          sword: 200,
        },
      } as ICharacter;
      const result = calcSkillLevelForCharacter(character, 'SWORD' as Skill);
      expect(result).toBe(2);
    });

    it('should handle missing skills', () => {
      const character = { skills: {} } as ICharacter;
      const result = calcSkillLevelForCharacter(character, 'sword' as Skill);
      expect(result).toBe(0);
    });

    it('should throw error for null skill parameter', () => {
      const character = createMockCharacter(200);
      expect(() => {
        calcSkillLevelForCharacter(character, null as any);
      }).toThrow('Trying to calculate skill of undefined');
    });

    it('should throw error for undefined skill parameter', () => {
      const character = createMockCharacter(200);
      expect(() => {
        calcSkillLevelForCharacter(character, undefined as any);
      }).toThrow('Trying to calculate skill of undefined');
    });

    it('should handle zero skill value', () => {
      const character = createMockCharacter(0);
      const result = calcSkillLevelForCharacter(character, 'sword' as Skill);
      expect(result).toBe(0);
    });

    it('should handle high skill values', () => {
      const character = createMockCharacter(10000);
      const result = calcSkillLevelForCharacter(character, 'sword' as Skill);
      expect(result).toBe(11); // Based on calculateSkillLevelFromXP(10000)
    });
  });

  describe('assessPercentToNextSkill', () => {
    const createMockCharacter = (skillValue: number): ICharacter =>
      ({
        skills: {
          sword: skillValue,
        },
      }) as ICharacter;

    it('should calculate percentage to next skill level', () => {
      const character = createMockCharacter(200); // Level 2, progress toward level 3
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      const expected = Math.min(
        99.999,
        ((200 - 155) / (240 - 155)) * 100,
      ).toFixed(3);
      expect(result).toBe(expected);
    });

    it('should handle skill level 0', () => {
      const character = createMockCharacter(50);
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      const expected = Math.min(99.999, (50 / 100) * 100).toFixed(3);
      expect(result).toBe(expected);
    });

    it('should cap at 99.999%', () => {
      const character = createMockCharacter(239); // Very close to level 3
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      expect(parseFloat(result)).toBeLessThanOrEqual(99.999);
    });

    it('should handle exact level boundaries and cap at 99.999%', () => {
      const character = createMockCharacter(155); // Exact level 1
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      expect(result).toBe('99.999'); // Caps at 99.999% at level boundary
    });

    it('should handle missing skills', () => {
      const character = { skills: {} } as ICharacter;
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      expect(result).toBe('0.000');
    });

    it('should handle very high skill values', () => {
      const character = createMockCharacter(100000);
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      expect(parseFloat(result)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(result)).toBeLessThanOrEqual(99.999);
    });

    it('should not return negative percentages', () => {
      const character = createMockCharacter(0);
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      expect(parseFloat(result)).toBeGreaterThanOrEqual(0);
    });

    it('should handle skill value with null coalescing', () => {
      const character = { skills: { sword: null } } as any;
      const result = assessPercentToNextSkill(character, 'sword' as Skill);
      expect(result).toBe('0.000');
    });
  });

  describe('Integration Tests', () => {
    it('should have consistent behavior between skill calculation functions', () => {
      // Test with exact level boundary XP
      const testXP = 240; // Exact XP for level 2
      const level = calculateSkillLevelFromXP(testXP);
      const requiredXP = calculateSkillXPRequiredForLevel(level);
      const nextLevelXP = calculateSkillXPRequiredForLevel(level + 1);

      // Current XP should equal the required XP for current level (at exact boundary)
      expect(testXP).toBe(requiredXP);
      // Current XP should be less than required XP for next level
      expect(testXP).toBeLessThan(nextLevelXP);
    });

    it('should have consistent percentage calculations between player and character functions', () => {
      const skillValue = 200;
      const player = { skills: { sword: skillValue } } as IPlayer;
      const character = { skills: { sword: skillValue } } as ICharacter;

      const playerPercent = percentCompleteSkill(player, 'sword' as Skill);
      const characterPercent = assessPercentToNextSkill(
        character,
        'sword' as Skill,
      );

      // Both should calculate the same percentage for non-boundary values
      expect(playerPercent).toBe(characterPercent);
    });
  });
});
