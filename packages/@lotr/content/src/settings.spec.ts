import { BaseClass, Skill, Stat } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { settingClassConfigGet, settingGameGet } from './settings';

// Mock dependencies
vi.mock('./core', () => ({
  coreSettings: vi.fn(),
}));

vi.mock('lodash', () => ({
  get: vi.fn(),
  isUndefined: vi.fn(),
}));

describe('Settings Functions', () => {
  let mockCoreSettings: any;
  let mockGet: any;
  let mockIsUndefined: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const core = await import('./core');
    const lodash = await import('lodash');

    mockCoreSettings = vi.mocked(core.coreSettings);
    mockGet = vi.mocked(lodash.get);
    mockIsUndefined = vi.mocked(lodash.isUndefined);
  });

  describe('settingClassConfigGet', () => {
    it('should return class config value when it exists', () => {
      const mockSettings = {
        classConfig: {
          [BaseClass.Warrior]: {
            baseMP: 20,
            usesMana: true,
            castStat: Stat.STR,
            castSkill: Skill.Sword,
            canBeEncumbered: true,
            castResource: 'MP' as const,
            regensLikeThief: false,
            regensLikeWarrior: true,
            hasStealthBonus: false,
            hasPerceptionBonus: false,
            gainsManaOnHitOrDodge: false,
            canLockpick: false,
            hasStealBonus: false,
            requiresMPToHide: false,
            canGainMPFromIntPots: false,
            canGainMPFromWisPots: false,
            gainsSkillFromSinging: false,
            canAppraiseWhileIdentifying: false,
            learnedTrait: 'Strong Back',
            noFateTraits: [],
            noTrainSkills: [],
            hpMaxes: [100, 150, 200, 250] as const,
            mpMaxes: [20, 30, 40, 50] as const,
            levelup: {} as any,
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const result = settingClassConfigGet(BaseClass.Warrior, 'baseMP');

      expect(mockCoreSettings).toHaveBeenCalledTimes(1);
      expect(mockIsUndefined).toHaveBeenCalledWith(20);
      expect(result).toBe(20);
    });

    it('should handle different base classes with different properties', () => {
      const mockSettings = {
        classConfig: {
          [BaseClass.Mage]: {
            baseMP: 100,
            usesMana: true,
            castStat: Stat.INT,
            canBeEncumbered: false,
            castResource: 'MP' as const,
            canGainMPFromIntPots: true,
            canGainMPFromWisPots: true,
          },
          [BaseClass.Thief]: {
            baseMP: 30,
            usesMana: false,
            castStat: Stat.DEX,
            canLockpick: true,
            hasStealthBonus: true,
            hasStealBonus: true,
            regensLikeThief: true,
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const mageMP = settingClassConfigGet(BaseClass.Mage, 'baseMP');
      const thiefCanLockpick = settingClassConfigGet(
        BaseClass.Thief,
        'canLockpick',
      );
      const mageCanGainFromInt = settingClassConfigGet(
        BaseClass.Mage,
        'canGainMPFromIntPots',
      );

      expect(mageMP).toBe(100);
      expect(thiefCanLockpick).toBe(true);
      expect(mageCanGainFromInt).toBe(true);
    });

    it('should handle different config keys for same class', () => {
      const mockSettings = {
        classConfig: {
          [BaseClass.Healer]: {
            usesMana: true,
            castStat: Stat.WIS,
            castSkill: Skill.Restoration,
            canGainMPFromWisPots: true,
            gainsSkillFromSinging: true,
            learnedTrait: 'Healer',
            noFateTraits: ['Death Grip'],
            noTrainSkills: [Skill.Thievery],
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const usesMana = settingClassConfigGet(BaseClass.Healer, 'usesMana');
      const castStat = settingClassConfigGet(BaseClass.Healer, 'castStat');
      const learnedTrait = settingClassConfigGet(
        BaseClass.Healer,
        'learnedTrait',
      );

      expect(usesMana).toBe(true);
      expect(castStat).toBe(Stat.WIS);
      expect(learnedTrait).toBe('Healer');
    });

    it('should throw error when class config key is undefined', () => {
      const mockSettings = {
        classConfig: {
          [BaseClass.Warrior]: {
            baseMP: undefined,
            usesMana: true,
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(true);

      expect(() => settingClassConfigGet(BaseClass.Warrior, 'baseMP')).toThrow(
        `Class config key ${BaseClass.Warrior}->baseMP was undefined.`,
      );

      expect(mockCoreSettings).toHaveBeenCalledTimes(1);
      expect(mockIsUndefined).toHaveBeenCalledWith(undefined);
    });

    it('should handle array properties correctly', () => {
      const hpMaxes = [50, 100, 150, 200] as const;
      const mpMaxes = [10, 20, 30, 40] as const;
      const noFateTraits = ['Death Grip', 'Vampire'];
      const noTrainSkills = [Skill.Thievery, Skill.Mace];

      const mockSettings = {
        classConfig: {
          [BaseClass.Warrior]: {
            hpMaxes,
            mpMaxes,
            noFateTraits,
            noTrainSkills,
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const resultHpMaxes = settingClassConfigGet(BaseClass.Warrior, 'hpMaxes');
      const resultNoFateTraits = settingClassConfigGet(
        BaseClass.Warrior,
        'noFateTraits',
      );

      expect(resultHpMaxes).toBe(hpMaxes);
      expect(resultNoFateTraits).toEqual(noFateTraits);
      expect(resultNoFateTraits).toContain('Death Grip');
    });

    it('should handle all BaseClass enum values', () => {
      const allClassConfigs = Object.values(BaseClass).reduce(
        (acc, baseClass) => {
          acc[baseClass] = {
            baseMP: 50,
            usesMana: true,
            castStat: Stat.INT,
            castSkill: Skill.Conjuration,
            canBeEncumbered: true,
            castResource: 'MP' as const,
          };
          return acc;
        },
        {} as any,
      );

      const mockSettings = { classConfig: allClassConfigs };
      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      Object.values(BaseClass).forEach((baseClass) => {
        const mp = settingClassConfigGet(baseClass, 'baseMP');
        expect(mp).toBe(50);
      });
    });

    it('should preserve exact return value type and reference', () => {
      const exactTraitsArray = ['Death Grip', 'Vampire'];

      const mockSettings = {
        classConfig: {
          [BaseClass.Warrior]: {
            noFateTraits: exactTraitsArray,
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const result = settingClassConfigGet(BaseClass.Warrior, 'noFateTraits');

      expect(result).toBe(exactTraitsArray); // Same reference
      expect(result).toEqual(exactTraitsArray);
    });

    it('should handle zero and falsy values that are not undefined', () => {
      const mockSettings = {
        classConfig: {
          [BaseClass.Mage]: {
            baseMP: 0,
            usesMana: false,
            canBeEncumbered: false,
            learnedTrait: '',
            noFateTraits: [],
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const baseMP = settingClassConfigGet(BaseClass.Mage, 'baseMP');
      const usesMana = settingClassConfigGet(BaseClass.Mage, 'usesMana');
      const canBeEncumbered = settingClassConfigGet(
        BaseClass.Mage,
        'canBeEncumbered',
      );
      const learnedTrait = settingClassConfigGet(
        BaseClass.Mage,
        'learnedTrait',
      );

      expect(baseMP).toBe(0);
      expect(usesMana).toBe(false);
      expect(canBeEncumbered).toBe(false);
      expect(learnedTrait).toBe('');
    });

    it('should handle missing class in classConfig', () => {
      const mockSettings = {
        classConfig: {
          [BaseClass.Warrior]: {
            baseMP: 20,
          },
          // Missing Mage class
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);

      expect(() => settingClassConfigGet(BaseClass.Mage, 'baseMP')).toThrow(); // Will throw when trying to access undefined[key]
    });
  });

  describe('settingGameGet', () => {
    it('should return game setting value when no subKey provided', () => {
      const mockSettings = {
        auth: {
          verificationHourExpiration: 24,
        },
        classConfig: {
          [BaseClass.Warrior]: { baseMP: 50 },
        },
        character: {
          maxLevel: 50,
          maxSkill: 100,
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);

      const auth = settingGameGet('auth');
      const classConfig = settingGameGet('classConfig');

      expect(mockCoreSettings).toHaveBeenCalledTimes(2);
      expect(auth).toEqual({ verificationHourExpiration: 24 });
      expect(classConfig).toEqual({ [BaseClass.Warrior]: { baseMP: 50 } });
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should use lodash.get when subKey is provided', () => {
      const mockSettings = {
        character: {
          maxLevel: 50,
          maxSkill: 100,
          sellValuePercent: 0.5,
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockGet.mockReturnValue(50);

      const result = settingGameGet('character', 'maxLevel');

      expect(mockCoreSettings).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(mockSettings.character, 'maxLevel');
      expect(result).toBe(50);
    });

    it('should handle nested subKey paths', () => {
      const mockSettings = {
        character: {
          maxLevel: 50,
          maxSkill: 100,
          sellValuePercent: 0.5,
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockGet.mockReturnValue(0.5);

      const sellPercent = settingGameGet('character', 'sellValuePercent');

      expect(mockGet).toHaveBeenCalledWith(
        mockSettings.character,
        'sellValuePercent',
      );
      expect(sellPercent).toBe(0.5);
    });

    it('should return different setting types correctly', () => {
      const authConfig = { verificationHourExpiration: 24 };
      const charConfig = { maxLevel: 50, maxSkill: 100 };
      const classConfigs = { [BaseClass.Warrior]: { baseMP: 20 } };

      const mockSettings = {
        auth: authConfig,
        character: charConfig,
        classConfig: classConfigs,
      };

      mockCoreSettings.mockReturnValue(mockSettings);

      expect(settingGameGet('auth')).toEqual(authConfig);
      expect(settingGameGet('character')).toEqual(charConfig);
      expect(settingGameGet('classConfig')).toEqual(classConfigs);
    });

    it('should return exact reference when no subKey used', () => {
      const exactAuthObject = {
        verificationHourExpiration: 48,
      };

      const mockSettings = {
        auth: exactAuthObject,
      };

      mockCoreSettings.mockReturnValue(mockSettings);

      const result = settingGameGet('auth');

      expect(result).toBe(exactAuthObject); // Same reference
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should handle when lodash.get returns undefined', () => {
      const mockSettings = {
        character: {
          maxLevel: 50,
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockGet.mockReturnValue(undefined);

      const result = settingGameGet('character', 'nonexistent.path');

      expect(mockGet).toHaveBeenCalledWith(
        mockSettings.character,
        'nonexistent.path',
      );
      expect(result).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should work with both functions accessing same settings', () => {
      const mockSettings = {
        auth: { verificationHourExpiration: 24 },
        classConfig: {
          [BaseClass.Warrior]: {
            baseMP: 20,
            usesMana: true,
          },
        },
      };

      mockCoreSettings.mockReturnValue(mockSettings);
      mockIsUndefined.mockReturnValue(false);

      const auth = settingGameGet('auth');
      const warriorMP = settingClassConfigGet(BaseClass.Warrior, 'baseMP');

      expect(auth).toEqual({ verificationHourExpiration: 24 });
      expect(warriorMP).toBe(20);
      expect(mockCoreSettings).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when coreSettings returns null', () => {
      mockCoreSettings.mockReturnValue(null);

      expect(() => settingGameGet('auth')).toThrow();
      expect(() =>
        settingClassConfigGet(BaseClass.Warrior, 'baseMP'),
      ).toThrow();
    });

    it('should handle when coreSettings returns undefined', () => {
      mockCoreSettings.mockReturnValue(undefined);

      expect(() => settingGameGet('auth')).toThrow();
      expect(() =>
        settingClassConfigGet(BaseClass.Warrior, 'baseMP'),
      ).toThrow();
    });

    it('should handle when classConfig is missing', () => {
      const mockSettings = { auth: { verificationHourExpiration: 24 } }; // Missing classConfig

      mockCoreSettings.mockReturnValue(mockSettings);

      expect(() =>
        settingClassConfigGet(BaseClass.Warrior, 'baseMP'),
      ).toThrow();
    });

    it('should preserve original error types and messages', () => {
      mockCoreSettings.mockReturnValue({
        classConfig: {
          [BaseClass.Mage]: { baseMP: undefined },
        },
      });
      mockIsUndefined.mockReturnValue(true);

      try {
        settingClassConfigGet(BaseClass.Mage, 'baseMP');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Mage');
        expect(error.message).toContain('baseMP');
        expect(error.message).toContain('undefined');
      }
    });
  });
});
