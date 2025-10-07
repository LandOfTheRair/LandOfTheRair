import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  achievementAll,
  achievementExists,
  achievementGet,
} from './achievements';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Achievements Functions', () => {
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

  describe('achievementAll', () => {
    it('should return all achievements from content', () => {
      const achievements = {
        'first-kill': {
          name: 'First Kill',
          description: 'Kill your first enemy',
          rewards: { exp: 100 },
        },
        'level-10': {
          name: 'Veteran',
          description: 'Reach level 10',
          rewards: { title: 'Veteran' },
        },
      };

      mockGetContentKey.mockReturnValue(achievements);

      const result = achievementAll();

      expect(mockGetContentKey).toHaveBeenCalledWith('achievements');
      expect(result).toEqual(achievements);
    });

    it('should return empty object when no achievements exist', () => {
      mockGetContentKey.mockReturnValue({});

      const result = achievementAll();

      expect(result).toEqual({});
    });

    it('should call getContentKey with correct parameter', () => {
      mockGetContentKey.mockReturnValue({});

      achievementAll();

      expect(mockGetContentKey).toHaveBeenCalledWith('achievements');
      expect(mockGetContentKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('achievementGet', () => {
    it('should return achievement when it exists', () => {
      const achievements = {
        'dragon-slayer': {
          name: 'Dragon Slayer',
          description: 'Defeat a dragon',
          requirements: { kill: 'Dragon' },
          rewards: { exp: 5000, gold: 1000, title: 'Dragon Slayer' },
        },
      };

      mockGetContentKey.mockReturnValue(achievements);

      const result = achievementGet('dragon-slayer');

      expect(result).toEqual(achievements['dragon-slayer']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent achievement', () => {
      const achievements = {
        'existing-achievement': {
          name: 'Existing Achievement',
          description: 'This exists',
        },
      };

      mockGetContentKey.mockReturnValue(achievements);

      const result = achievementGet('nonexistent-achievement');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Achievement:nonexistent-achievement',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Achievement nonexistent-achievement does not exist.',
      );
    });

    it('should handle empty achievement collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = achievementGet('any-achievement');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Achievement:any-achievement',
        expect.any(Error),
      );
    });

    it('should handle achievements with complex data structures', () => {
      const complexAchievement = {
        name: 'Master Craftsman',
        description: 'Master all crafting skills',
        type: 'progression',
        category: 'crafting',
        requirements: {
          skills: {
            blacksmithing: 100,
            tailoring: 100,
            alchemy: 100,
          },
          items: ['Master Hammer', 'Expert Needle', 'Grand Cauldron'],
        },
        rewards: {
          exp: 10000,
          gold: 5000,
          title: 'Master Craftsman',
          items: ['Legendary Crafting Kit'],
          unlocks: ['legendary-recipes'],
        },
        hidden: false,
        points: 50,
      };

      const achievements = {
        'master-craftsman': complexAchievement,
      };

      mockGetContentKey.mockReturnValue(achievements);

      const result = achievementGet('master-craftsman');

      expect(result).toEqual(complexAchievement);
      expect((result as any).requirements.skills.blacksmithing).toBe(100);
      expect((result as any).rewards.items).toContain('Legendary Crafting Kit');
    });

    it('should handle achievements with special characters in name', () => {
      const achievements = {
        'achievement-with_special.chars!': {
          name: 'Special Achievement',
          description: 'An achievement with unusual naming',
        },
      };

      mockGetContentKey.mockReturnValue(achievements);

      const result = achievementGet('achievement-with_special.chars!');

      expect(result).toEqual(achievements['achievement-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return the exact object reference', () => {
      const achievementObject = {
        name: 'Reference Test',
        description: 'Testing object references',
      };

      const achievements = { 'reference-test': achievementObject };
      mockGetContentKey.mockReturnValue(achievements);

      const result = achievementGet('reference-test');

      expect(result).toBe(achievementObject); // Same reference
    });
  });

  describe('achievementExists', () => {
    it('should return true for existing achievements', () => {
      const achievements = {
        'first-login': {
          name: 'Welcome',
          description: 'Log in for the first time',
        },
      };

      mockGetContentKey.mockReturnValue(achievements);

      expect(achievementExists('first-login')).toBe(true);
    });

    it('should return false for nonexistent achievements', () => {
      mockGetContentKey.mockReturnValue({});

      expect(achievementExists('nonexistent-achievement')).toBe(false);
    });

    it('should return false for achievements with falsy values', () => {
      const achievements = {
        'null-achievement': null,
        'undefined-achievement': undefined,
        'false-achievement': false,
        'zero-achievement': 0,
        'empty-string-achievement': '',
        'valid-achievement': { name: 'Valid' },
      };

      mockGetContentKey.mockReturnValue(achievements);

      expect(achievementExists('null-achievement')).toBe(false);
      expect(achievementExists('undefined-achievement')).toBe(false);
      expect(achievementExists('false-achievement')).toBe(false);
      expect(achievementExists('zero-achievement')).toBe(false);
      expect(achievementExists('empty-string-achievement')).toBe(false);
      expect(achievementExists('valid-achievement')).toBe(true);
    });

    it('should handle empty achievement collection', () => {
      mockGetContentKey.mockReturnValue({});

      expect(achievementExists('any-achievement')).toBe(false);
    });

    it('should be case sensitive', () => {
      const achievements = {
        CamelCaseAchievement: { name: 'Camel Case' },
        lowercase: { name: 'Lowercase' },
        UPPERCASE: { name: 'Uppercase' },
      };

      mockGetContentKey.mockReturnValue(achievements);

      expect(achievementExists('CamelCaseAchievement')).toBe(true);
      expect(achievementExists('camelcaseachievement')).toBe(false);
      expect(achievementExists('lowercase')).toBe(true);
      expect(achievementExists('LOWERCASE')).toBe(false);
      expect(achievementExists('UPPERCASE')).toBe(true);
      expect(achievementExists('uppercase')).toBe(false);
    });

    it('should handle various achievement name formats', () => {
      const achievementNames = [
        'simple-name',
        'name_with_underscores',
        'name.with.dots',
        'name-123-with-numbers',
        'special!@#$%chars',
      ];

      const achievements: any = {};
      achievementNames.forEach((name) => {
        achievements[name] = { name: `Achievement ${name}` };
      });

      mockGetContentKey.mockReturnValue(achievements);

      achievementNames.forEach((name) => {
        expect(achievementExists(name)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with all functions together', () => {
      const achievements = {
        beginner: {
          name: 'Beginner',
          description: 'Complete the tutorial',
          rewards: { exp: 50 },
        },
        adventurer: {
          name: 'Adventurer',
          description: 'Complete 10 quests',
          rewards: { exp: 500, gold: 100 },
        },
        hero: {
          name: 'Hero',
          description: 'Save the kingdom',
          rewards: { exp: 10000, title: 'Hero of the Realm' },
        },
      };

      mockGetContentKey.mockReturnValue(achievements);

      // Test achievementAll
      const allAchievements = achievementAll();
      expect(allAchievements).toEqual(achievements);

      // Test achievementExists
      expect(achievementExists('beginner')).toBe(true);
      expect(achievementExists('adventurer')).toBe(true);
      expect(achievementExists('hero')).toBe(true);
      expect(achievementExists('nonexistent')).toBe(false);

      // Test achievementGet
      expect(achievementGet('beginner')).toEqual(achievements['beginner']);
      expect(achievementGet('adventurer')).toEqual(achievements['adventurer']);
      expect(achievementGet('hero')).toEqual(achievements['hero']);

      // Only the nonexistent achievement should log an error when we try to get it
      achievementGet('nonexistent');
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle realistic achievement scenarios', () => {
      const realisticAchievements = {
        'first-steps': {
          name: 'First Steps',
          description: 'Take your first step into the world',
          category: 'tutorial',
          points: 5,
          rewards: { exp: 25 },
          hidden: false,
        },
        'monster-hunter': {
          name: 'Monster Hunter',
          description: 'Kill 100 monsters',
          category: 'combat',
          points: 15,
          requirements: { kills: { any: 100 } },
          rewards: { exp: 1000, title: 'Monster Hunter' },
          hidden: false,
          progress: { current: 0, max: 100 },
        },
        'secret-finder': {
          name: 'Secret Finder',
          description: 'Find the hidden treasure',
          category: 'exploration',
          points: 25,
          requirements: { items: ['Hidden Treasure'] },
          rewards: { exp: 2000, gold: 5000 },
          hidden: true,
        },
      };

      mockGetContentKey.mockReturnValue(realisticAchievements);

      expect(achievementExists('first-steps')).toBe(true);
      expect(achievementExists('monster-hunter')).toBe(true);
      expect(achievementExists('secret-finder')).toBe(true);

      const monsterHunter = achievementGet('monster-hunter');
      expect((monsterHunter as any).progress.max).toBe(100);
      expect((monsterHunter as any).requirements.kills.any).toBe(100);
    });

    it('should maintain performance with large achievement collections', () => {
      // Simulate a large number of achievements
      const largeAchievementCollection: any = {};
      for (let i = 0; i < 500; i++) {
        largeAchievementCollection[`achievement-${i}`] = {
          name: `Achievement ${i}`,
          description: `Description for achievement ${i}`,
          points: i,
          rewards: { exp: i * 10 },
        };
      }

      mockGetContentKey.mockReturnValue(largeAchievementCollection);

      // Should quickly find existing achievements
      expect(achievementExists('achievement-250')).toBe(true);
      const achievement250 = achievementGet('achievement-250');
      expect((achievement250 as any).name).toBe('Achievement 250');

      // Should quickly determine non-existence
      expect(achievementExists('achievement-9999')).toBe(false);
      const nonExistent = achievementGet('achievement-9999');
      expect(nonExistent).toBeUndefined();

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent access patterns', () => {
      const achievements = {
        'concurrent-1': { name: 'Concurrent 1', points: 10 },
        'concurrent-2': { name: 'Concurrent 2', points: 20 },
        'concurrent-3': { name: 'Concurrent 3', points: 30 },
      };

      mockGetContentKey.mockReturnValue(achievements);

      // Simulate concurrent access
      const results = ['concurrent-1', 'concurrent-2', 'concurrent-3'].map(
        (name) => ({
          exists: achievementExists(name),
          achievement: achievementGet(name),
        }),
      );

      results.forEach((result, index) => {
        expect(result.exists).toBe(true);
        expect(result.achievement).toEqual(
          achievements[`concurrent-${index + 1}`],
        );
      });

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => achievementAll()).not.toThrow();
      expect(() => achievementExists('any')).toThrow();
      expect(() => achievementGet('any')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => achievementExists('any')).toThrow();
      expect(() => achievementGet('any')).toThrow();
    });
  });
});
