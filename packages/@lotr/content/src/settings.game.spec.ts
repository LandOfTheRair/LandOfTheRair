import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  settingGetMaxExp,
  settingGetMaxLevel,
  settingGetMaxSkill,
  settingGetMaxSkillExp,
  settingGetMaxStats,
  settingGetPotionStats,
  settingIsAIActive,
  settingsLoadForGame,
  toggleAIFreeze,
} from './settings.game';

// Mock dependencies
vi.mock('./settings', () => ({
  settingGameGet: vi.fn(),
}));

vi.mock('@lotr/exp', () => ({
  calculateSkillXPRequiredForLevel: vi.fn(),
  calculateXPRequiredForLevel: vi.fn(),
}));

describe('Settings Game Functions', () => {
  let mockSettingGameGet: any;
  let mockCalculateXPRequiredForLevel: any;
  let mockCalculateSkillXPRequiredForLevel: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const settings = await import('./settings');
    const expModule = await import('@lotr/exp');

    mockSettingGameGet = vi.mocked(settings.settingGameGet);
    mockCalculateXPRequiredForLevel = vi.mocked(
      expModule.calculateXPRequiredForLevel,
    );
    mockCalculateSkillXPRequiredForLevel = vi.mocked(
      expModule.calculateSkillXPRequiredForLevel,
    );

    // Reset AI state to default
    const settingsGameModule = await import('./settings.game');
    // Force reset AI state by calling toggleAIFreeze if needed
    if (!settingsGameModule.settingIsAIActive()) {
      settingsGameModule.toggleAIFreeze();
    }
  });

  describe('settingsLoadForGame', () => {
    it('should load game settings and calculate experience values', () => {
      mockSettingGameGet.mockImplementation(
        (category: string, property?: string) => {
          if (category === 'character' && property === 'maxLevel') return 75;
          if (category === 'character' && property === 'maxSkill') return 40;
          if (category === 'character' && property === 'maxStats') return 30;
          if (category === 'potion') return { str: 5, dex: 5, int: 5 };
          return null;
        },
      );

      mockCalculateXPRequiredForLevel.mockReturnValue(2500000);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(150000);

      settingsLoadForGame();

      expect(mockSettingGameGet).toHaveBeenCalledWith('character', 'maxLevel');
      expect(mockSettingGameGet).toHaveBeenCalledWith('character', 'maxSkill');
      expect(mockSettingGameGet).toHaveBeenCalledWith('character', 'maxStats');
      expect(mockSettingGameGet).toHaveBeenCalledWith('potion');

      expect(mockCalculateXPRequiredForLevel).toHaveBeenCalledWith(75);
      expect(mockCalculateSkillXPRequiredForLevel).toHaveBeenCalledWith(40);
    });

    it('should handle default values when settings are unavailable', () => {
      mockSettingGameGet.mockImplementation(() => undefined);
      mockCalculateXPRequiredForLevel.mockReturnValue(0);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(0);

      settingsLoadForGame();

      expect(mockCalculateXPRequiredForLevel).toHaveBeenCalledWith(undefined);
      expect(mockCalculateSkillXPRequiredForLevel).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should handle edge case values', () => {
      mockSettingGameGet.mockImplementation(
        (category: string, property?: string) => {
          if (category === 'character' && property === 'maxLevel') return 1;
          if (category === 'character' && property === 'maxSkill') return 1;
          if (category === 'character' && property === 'maxStats') return 1;
          if (category === 'potion') return {};
          return null;
        },
      );

      mockCalculateXPRequiredForLevel.mockReturnValue(100);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(50);

      settingsLoadForGame();

      expect(mockCalculateXPRequiredForLevel).toHaveBeenCalledWith(1);
      expect(mockCalculateSkillXPRequiredForLevel).toHaveBeenCalledWith(1);
    });
  });

  describe('AI Control Functions', () => {
    describe('settingIsAIActive', () => {
      it('should return true when AI is active by default', () => {
        expect(settingIsAIActive()).toBe(true);
      });

      it('should return false when AI is frozen', () => {
        toggleAIFreeze(); // Freeze AI
        expect(settingIsAIActive()).toBe(false);
      });

      it('should return true when AI is unfrozen after being frozen', () => {
        toggleAIFreeze(); // Freeze AI
        toggleAIFreeze(); // Unfreeze AI
        expect(settingIsAIActive()).toBe(true);
      });
    });

    describe('toggleAIFreeze', () => {
      it('should toggle AI state from active to frozen', () => {
        const initialState = settingIsAIActive();
        toggleAIFreeze();
        expect(settingIsAIActive()).toBe(!initialState);
      });

      it('should toggle AI state from frozen to active', () => {
        toggleAIFreeze(); // First toggle
        const frozenState = settingIsAIActive();
        toggleAIFreeze(); // Second toggle
        expect(settingIsAIActive()).toBe(!frozenState);
      });

      it('should allow multiple toggles', () => {
        const originalState = settingIsAIActive();

        toggleAIFreeze();
        toggleAIFreeze();
        expect(settingIsAIActive()).toBe(originalState);

        toggleAIFreeze();
        toggleAIFreeze();
        toggleAIFreeze();
        expect(settingIsAIActive()).toBe(!originalState);
      });
    });
  });

  describe('Settings Getter Functions', () => {
    beforeEach(() => {
      // Set up known state before each test
      mockSettingGameGet.mockImplementation(
        (category: string, property?: string) => {
          if (category === 'character' && property === 'maxLevel') return 60;
          if (category === 'character' && property === 'maxSkill') return 35;
          if (category === 'character' && property === 'maxStats') return 28;
          if (category === 'potion') return { str: 3, dex: 3, int: 3, wis: 3 };
          return null;
        },
      );

      mockCalculateXPRequiredForLevel.mockReturnValue(1800000);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(120000);

      settingsLoadForGame();
    });

    describe('settingGetMaxLevel', () => {
      it('should return the loaded max level', () => {
        expect(settingGetMaxLevel()).toBe(60);
      });

      it('should return updated value after reload', () => {
        mockSettingGameGet.mockImplementation(
          (category: string, property?: string) => {
            if (category === 'character' && property === 'maxLevel') return 80;
            if (category === 'character' && property === 'maxSkill') return 35;
            if (category === 'character' && property === 'maxStats') return 28;
            if (category === 'potion') {
              return { str: 3, dex: 3, int: 3, wis: 3 };
            }
            return null;
          },
        );

        settingsLoadForGame();
        expect(settingGetMaxLevel()).toBe(80);
      });
    });

    describe('settingGetMaxSkill', () => {
      it('should return the loaded max skill', () => {
        expect(settingGetMaxSkill()).toBe(35);
      });

      it('should return updated value after reload', () => {
        mockSettingGameGet.mockImplementation(
          (category: string, property?: string) => {
            if (category === 'character' && property === 'maxLevel') return 60;
            if (category === 'character' && property === 'maxSkill') return 45;
            if (category === 'character' && property === 'maxStats') return 28;
            if (category === 'potion') {
              return { str: 3, dex: 3, int: 3, wis: 3 };
            }
            return null;
          },
        );

        settingsLoadForGame();
        expect(settingGetMaxSkill()).toBe(45);
      });
    });

    describe('settingGetMaxStats', () => {
      it('should return the loaded max stats', () => {
        expect(settingGetMaxStats()).toBe(28);
      });

      it('should return updated value after reload', () => {
        mockSettingGameGet.mockImplementation(
          (category: string, property?: string) => {
            if (category === 'character' && property === 'maxLevel') return 60;
            if (category === 'character' && property === 'maxSkill') return 35;
            if (category === 'character' && property === 'maxStats') return 35;
            if (category === 'potion') {
              return { str: 3, dex: 3, int: 3, wis: 3 };
            }
            return null;
          },
        );

        settingsLoadForGame();
        expect(settingGetMaxStats()).toBe(35);
      });
    });

    describe('settingGetPotionStats', () => {
      it('should return the loaded potion stats', () => {
        const potionStats = settingGetPotionStats();
        expect(potionStats).toEqual({ str: 3, dex: 3, int: 3, wis: 3 });
      });

      it('should return updated potion stats after reload', () => {
        const newPotionStats = { str: 5, dex: 4, int: 6, wis: 4, con: 3 };

        mockSettingGameGet.mockImplementation(
          (category: string, property?: string) => {
            if (category === 'character' && property === 'maxLevel') return 60;
            if (category === 'character' && property === 'maxSkill') return 35;
            if (category === 'character' && property === 'maxStats') return 28;
            if (category === 'potion') return newPotionStats;
            return null;
          },
        );

        settingsLoadForGame();
        expect(settingGetPotionStats()).toEqual(newPotionStats);
      });

      it('should handle empty potion stats', () => {
        mockSettingGameGet.mockImplementation(
          (category: string, property?: string) => {
            if (category === 'character' && property === 'maxLevel') return 60;
            if (category === 'character' && property === 'maxSkill') return 35;
            if (category === 'character' && property === 'maxStats') return 28;
            if (category === 'potion') return {};
            return null;
          },
        );

        settingsLoadForGame();
        expect(settingGetPotionStats()).toEqual({});
      });
    });

    describe('settingGetMaxExp', () => {
      it('should return the calculated max experience', () => {
        expect(settingGetMaxExp()).toBe(1800000);
      });

      it('should return updated max experience after reload', () => {
        mockCalculateXPRequiredForLevel.mockReturnValue(2200000);
        settingsLoadForGame();
        expect(settingGetMaxExp()).toBe(2200000);
      });

      it('should handle zero experience calculation', () => {
        mockCalculateXPRequiredForLevel.mockReturnValue(0);
        settingsLoadForGame();
        expect(settingGetMaxExp()).toBe(0);
      });
    });

    describe('settingGetMaxSkillExp', () => {
      it('should return the calculated max skill experience', () => {
        expect(settingGetMaxSkillExp()).toBe(120000);
      });

      it('should return updated max skill experience after reload', () => {
        mockCalculateSkillXPRequiredForLevel.mockReturnValue(150000);
        settingsLoadForGame();
        expect(settingGetMaxSkillExp()).toBe(150000);
      });

      it('should handle zero skill experience calculation', () => {
        mockCalculateSkillXPRequiredForLevel.mockReturnValue(0);
        settingsLoadForGame();
        expect(settingGetMaxSkillExp()).toBe(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency between getters and loaded values', () => {
      const testConfig = {
        maxLevel: 99,
        maxSkill: 50,
        maxStats: 40,
        potionStats: { str: 10, dex: 8, int: 12 },
        maxExp: 5000000,
        maxSkillExp: 300000,
      };

      mockSettingGameGet.mockImplementation(
        (category: string, property?: string) => {
          if (category === 'character' && property === 'maxLevel') {
            return testConfig.maxLevel;
          }
          if (category === 'character' && property === 'maxSkill') {
            return testConfig.maxSkill;
          }
          if (category === 'character' && property === 'maxStats') {
            return testConfig.maxStats;
          }
          if (category === 'potion') return testConfig.potionStats;
          return null;
        },
      );

      mockCalculateXPRequiredForLevel.mockReturnValue(testConfig.maxExp);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(
        testConfig.maxSkillExp,
      );

      settingsLoadForGame();

      expect(settingGetMaxLevel()).toBe(testConfig.maxLevel);
      expect(settingGetMaxSkill()).toBe(testConfig.maxSkill);
      expect(settingGetMaxStats()).toBe(testConfig.maxStats);
      expect(settingGetPotionStats()).toEqual(testConfig.potionStats);
      expect(settingGetMaxExp()).toBe(testConfig.maxExp);
      expect(settingGetMaxSkillExp()).toBe(testConfig.maxSkillExp);
    });

    it('should handle multiple reloads correctly', () => {
      // First configuration
      mockSettingGameGet.mockImplementation(
        (category: string, property?: string) => {
          if (category === 'character' && property === 'maxLevel') return 50;
          if (category === 'character' && property === 'maxSkill') return 30;
          if (category === 'character' && property === 'maxStats') return 25;
          if (category === 'potion') return { str: 5 };
          return null;
        },
      );
      mockCalculateXPRequiredForLevel.mockReturnValue(1000000);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(75000);

      settingsLoadForGame();
      expect(settingGetMaxLevel()).toBe(50);

      // Second configuration
      mockSettingGameGet.mockImplementation(
        (category: string, property?: string) => {
          if (category === 'character' && property === 'maxLevel') return 75;
          if (category === 'character' && property === 'maxSkill') return 45;
          if (category === 'character' && property === 'maxStats') return 35;
          if (category === 'potion') return { str: 8, dex: 6 };
          return null;
        },
      );
      mockCalculateXPRequiredForLevel.mockReturnValue(2500000);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(180000);

      settingsLoadForGame();
      expect(settingGetMaxLevel()).toBe(75);
      expect(settingGetMaxSkill()).toBe(45);
      expect(settingGetMaxExp()).toBe(2500000);
    });
  });

  describe('Error Handling', () => {
    it('should handle null values from settingGameGet', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockCalculateXPRequiredForLevel.mockReturnValue(0);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(0);

      expect(() => settingsLoadForGame()).not.toThrow();

      expect(settingGetMaxLevel()).toBe(null);
      expect(settingGetMaxSkill()).toBe(null);
      expect(settingGetMaxStats()).toBe(null);
      expect(settingGetPotionStats()).toBe(null);
    });

    it('should handle undefined values from settingGameGet', () => {
      mockSettingGameGet.mockReturnValue(undefined);
      mockCalculateXPRequiredForLevel.mockReturnValue(0);
      mockCalculateSkillXPRequiredForLevel.mockReturnValue(0);

      expect(() => settingsLoadForGame()).not.toThrow();

      expect(settingGetMaxLevel()).toBe(undefined);
      expect(settingGetMaxSkill()).toBe(undefined);
      expect(settingGetMaxStats()).toBe(undefined);
      expect(settingGetPotionStats()).toBe(undefined);
    });

    it('should handle calculation function errors gracefully', () => {
      mockSettingGameGet.mockReturnValue(50);
      mockCalculateXPRequiredForLevel.mockImplementation(() => {
        throw new Error('Calculation error');
      });
      mockCalculateSkillXPRequiredForLevel.mockImplementation(() => {
        throw new Error('Skill calculation error');
      });

      expect(() => settingsLoadForGame()).toThrow('Calculation error');
    });
  });
});
