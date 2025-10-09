import { Skill } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { skillGetDescription } from './text';

// Mock dependencies
vi.mock('./core', () => ({
  coreSkillDescs: vi.fn(),
}));

describe('Text Functions', () => {
  let mockCoreSkillDescs: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const core = await import('./core');
    mockCoreSkillDescs = vi.mocked(core.coreSkillDescs);
  });

  describe('skillGetDescription', () => {
    it('should return correct description for valid skill and level', () => {
      const mockSkillDescs = {
        sword: ['Sword novice', 'Sword apprentice', 'Sword master'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      const result = skillGetDescription(Skill.Sword, 1);

      expect(mockCoreSkillDescs).toHaveBeenCalledTimes(1);
      expect(result).toBe('Sword apprentice');
    });

    it('should return first description for skill level 0', () => {
      const mockSkillDescs = {
        conjuration: ['Magic novice', 'Magic apprentice', 'Magic master'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      const result = skillGetDescription(Skill.Conjuration, 0);

      expect(result).toBe('Magic novice');
    });

    it('should return highest description when level exceeds available descriptions', () => {
      const mockSkillDescs = {
        thievery: ['Thievery novice', 'Thievery apprentice', 'Thievery master'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      const result = skillGetDescription(Skill.Thievery, 10);

      expect(result).toBe('Thievery master');
    });

    it('should handle null and undefined skillLevel', () => {
      const mockSkillDescs = {
        staff: ['Staff novice', 'Staff apprentice'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      expect(skillGetDescription(Skill.Staff, null as any)).toBe(
        'Staff novice',
      );
      expect(skillGetDescription(Skill.Staff, undefined as any)).toBe(
        'Staff novice',
      );
    });

    it('should handle single description arrays', () => {
      const mockSkillDescs = {
        throwing: ['You can throw objects.'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      expect(skillGetDescription(Skill.Throwing, 0)).toBe(
        'You can throw objects.',
      );
      expect(skillGetDescription(Skill.Throwing, 100)).toBe(
        'You can throw objects.',
      );
    });

    it('should use Math.min to cap skill levels', () => {
      const mockSkillDescs = {
        axe: ['Level 0', 'Level 1', 'Level 2'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      expect(skillGetDescription(Skill.Axe, 0)).toBe('Level 0');
      expect(skillGetDescription(Skill.Axe, 1)).toBe('Level 1');
      expect(skillGetDescription(Skill.Axe, 2)).toBe('Level 2');
      expect(skillGetDescription(Skill.Axe, 100)).toBe('Level 2');
    });

    it('should handle fractional skill levels', () => {
      const mockSkillDescs = {
        dagger: ['Novice', 'Apprentice', 'Expert'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      // Math.min(2, 1.7) = 1.7, but array access with 1.7 is undefined
      expect(skillGetDescription(Skill.Dagger, 1.7)).toBe('');
      expect(skillGetDescription(Skill.Dagger, 0.5)).toBe('');
      // Integer indices work normally
      expect(skillGetDescription(Skill.Dagger, 1)).toBe('Apprentice');
    });

    it('should call coreSkillDescs for each invocation', () => {
      const mockSkillDescs = {
        mace: ['Mace novice'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);

      skillGetDescription(Skill.Mace, 0);
      skillGetDescription(Skill.Mace, 0);
      skillGetDescription(Skill.Mace, 0);

      expect(mockCoreSkillDescs).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle when coreSkillDescs returns null', () => {
      mockCoreSkillDescs.mockReturnValue(null);
      expect(() => skillGetDescription(Skill.Sword, 0)).toThrow();
    });

    it('should handle when coreSkillDescs returns undefined', () => {
      mockCoreSkillDescs.mockReturnValue(undefined);
      expect(() => skillGetDescription(Skill.Sword, 0)).toThrow();
    });

    it('should handle when skill not found in descriptions', () => {
      const mockSkillDescs = {
        ranged: ['Ranged novice'],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);
      expect(() => skillGetDescription(Skill.Sword, 0)).toThrow();
    });

    it('should handle empty descriptions array', () => {
      const mockSkillDescs = {
        axe: [],
      } as any;

      mockCoreSkillDescs.mockReturnValue(mockSkillDescs);
      // Math.min(-1, 0) = -1, so axe[-1] = undefined (no error thrown)
      expect(skillGetDescription(Skill.Axe, 0)).toBe('');
    });
  });
});
