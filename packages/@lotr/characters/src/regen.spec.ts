import type { ICharacter } from '@lotr/interfaces';
import { BaseClass, Stat } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { regenHPGet, regenMPGet } from './regen';

// Mock dependencies
vi.mock('@lotr/content', () => ({
  settingClassConfigGet: vi.fn(),
  settingGameGet: vi.fn(),
  traitLevelValue: vi.fn(),
}));

vi.mock('@lotr/effects', () => ({
  hasEffect: vi.fn(),
}));

vi.mock('./stats', () => ({
  getStat: vi.fn(),
}));

import {
  settingClassConfigGet,
  settingGameGet,
  traitLevelValue,
} from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import { getStat } from './stats';

describe('regen', () => {
  let mockCharacter: ICharacter;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCharacter = {
      name: 'TestCharacter',
      baseClass: BaseClass.Mage,
      combatTicks: 0,
    } as unknown as ICharacter;

    // Default mock implementations
    vi.mocked(getStat).mockImplementation((character, stat) => {
      switch (stat) {
        case Stat.HPRegen:
          return 5;
        case Stat.MPRegen:
          return 10;
        case Stat.CON:
          return 25;
        default:
          return 0;
      }
    });

    vi.mocked(settingGameGet).mockImplementation((category, setting) => {
      switch (`${category}.${setting}`) {
        case 'character.hpRegenSlidingCon':
          return 21;
        case 'character.defaultCasterMPRegen':
          return 10;
        case 'character.thiefOOCRegen':
          return 10;
        case 'character.thiefICRegen':
          return 1;
        case 'character.warriorOOCRegen':
          return -3;
        case 'character.warriorICRegen':
          return 3;
        default:
          return null;
      }
    });

    vi.mocked(settingClassConfigGet).mockReturnValue(false);
    vi.mocked(hasEffect).mockReturnValue(false);
    vi.mocked(traitLevelValue).mockReturnValue(0);
  });

  describe('regenHPGet', () => {
    it('should return base HP regen when CON is at or below sliding threshold', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 3;
          case Stat.CON:
            return 21; // At threshold
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(4); // 1 + 3 (base) = 4, no CON bonus
    });

    it('should add CON bonus when CON exceeds sliding threshold', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 3;
          case Stat.CON:
            return 25; // 4 above threshold
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(8); // max(4, 4 + 4) = 8
    });

    it('should use custom sliding CON threshold from settings', () => {
      vi.mocked(settingGameGet).mockImplementation((category, setting) => {
        if (category === 'character' && setting === 'hpRegenSlidingCon') {
          return 30; // Custom threshold
        }
        return null;
      });

      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 2;
          case Stat.CON:
            return 35; // 5 above custom threshold
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(8); // max(3, 3 + 5) = 8
    });

    it('should use default threshold when setting returns null', () => {
      vi.mocked(settingGameGet).mockReturnValue(null);

      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 3;
          case Stat.CON:
            return 25; // 4 above default threshold (21)
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(8); // max(4, 4 + 4) = 8
    });

    it('should handle negative HP regen stats', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return -2;
          case Stat.CON:
            return 25;
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(3); // max(-1, -1 + 4) = 3
    });

    it('should handle very high CON values', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 1;
          case Stat.CON:
            return 100; // 79 above threshold
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(81); // max(2, 2 + 79) = 81
    });

    it('should ensure minimum regen of base value', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 10;
          case Stat.CON:
            return 10; // Well below threshold
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(11); // max(11, 11 + 0) = 11
    });

    it('should handle zero HP regen stat', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 0;
          case Stat.CON:
            return 25;
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);

      expect(result).toBe(5); // max(1, 1 + 4) = 5
    });
  });

  describe('regenMPGet', () => {
    describe('Mana Users (Mages, Healers)', () => {
      beforeEach(() => {
        mockCharacter.baseClass = BaseClass.Mage;
        vi.mocked(settingClassConfigGet).mockImplementation(
          (baseClass, setting) => {
            if (setting === 'usesMana') return true;
            return false;
          },
        );
      });

      it('should add caster boost for mana users', () => {
        vi.mocked(getStat).mockReturnValue(5); // Base MP regen

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(15); // 5 + 10 (caster boost)
      });

      it('should use custom caster boost from settings', () => {
        vi.mocked(settingGameGet).mockImplementation((category, setting) => {
          if (category === 'character' && setting === 'defaultCasterMPRegen') {
            return 20; // Custom boost
          }
          return null;
        });

        vi.mocked(getStat).mockReturnValue(3);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(23); // 3 + 20
      });

      it('should handle null caster boost setting', () => {
        vi.mocked(settingGameGet).mockImplementation((category, setting) => {
          if (category === 'character' && setting === 'defaultCasterMPRegen') {
            return null;
          }
          return null;
        });

        vi.mocked(getStat).mockReturnValue(3);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(13); // 3 + 10 (default)
      });
    });

    describe('Thief-like Classes', () => {
      beforeEach(() => {
        mockCharacter.baseClass = BaseClass.Thief;
        vi.mocked(settingClassConfigGet).mockImplementation(
          (baseClass, setting) => {
            if (setting === 'regensLikeThief') return true;
            return false;
          },
        );
      });

      it('should return special regen for hidden thieves', () => {
        vi.mocked(hasEffect).mockImplementation(
          (character, effect) => effect === 'Hidden',
        );
        vi.mocked(traitLevelValue).mockReturnValue(0.5); // ReplenishingShadows
        vi.mocked(getStat).mockReturnValue(20); // Base MP regen

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(10); // Math.max(0, Math.floor(20 * 0.5))
      });

      it('should return 0 for singing thieves', () => {
        vi.mocked(hasEffect).mockImplementation(
          (character, effect) => effect === 'Singing',
        );

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(0);
      });

      it('should return out-of-combat regen for thieves not in combat', () => {
        mockCharacter.combatTicks = 0; // Out of combat
        vi.mocked(traitLevelValue).mockReturnValue(0.3); // ReplenishingReverberation
        vi.mocked(getStat).mockReturnValue(15);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(14); // Math.max(0, Math.floor(15 * 0.3)) + 10 = 4 + 10
      });

      it('should return in-combat regen for thieves in combat', () => {
        mockCharacter.combatTicks = 5; // In combat

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(1); // thiefICRegen default
      });

      it('should use custom thief regen settings', () => {
        mockCharacter.combatTicks = 0;
        vi.mocked(settingGameGet).mockImplementation((category, setting) => {
          switch (`${category}.${setting}`) {
            case 'character.thiefOOCRegen':
              return 15; // Custom OOC regen
            case 'character.thiefICRegen':
              return 2; // Custom IC regen
            default:
              return null;
          }
        });
        vi.mocked(traitLevelValue).mockReturnValue(0.2);
        vi.mocked(getStat).mockReturnValue(10);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(17); // Math.max(0, Math.floor(10 * 0.2)) + 15 = 2 + 15
      });

      it('should handle negative trait values for hidden thieves', () => {
        vi.mocked(hasEffect).mockImplementation(
          (character, effect) => effect === 'Hidden',
        );
        vi.mocked(traitLevelValue).mockReturnValue(-0.5);
        vi.mocked(getStat).mockReturnValue(10);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(0); // Math.max(0, Math.floor(10 * -0.5)) = 0
      });

      it('should handle zero base MP regen for thieves', () => {
        mockCharacter.combatTicks = 0;
        vi.mocked(getStat).mockReturnValue(0);
        vi.mocked(traitLevelValue).mockReturnValue(1.0);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(10); // Math.max(0, Math.floor(0 * 1.0)) + 10 = 0 + 10
      });

      it('should prioritize Hidden effect over out-of-combat regen', () => {
        mockCharacter.combatTicks = 0; // Out of combat
        vi.mocked(hasEffect).mockImplementation(
          (character, effect) => effect === 'Hidden',
        ); // But also hidden
        vi.mocked(traitLevelValue).mockReturnValue(0.4);
        vi.mocked(getStat).mockReturnValue(25);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(10); // Hidden takes priority: Math.max(0, Math.floor(25 * 0.4))
      });

      it('should prioritize Singing effect over other effects', () => {
        mockCharacter.combatTicks = 0;
        vi.mocked(hasEffect).mockImplementation(
          (character, effect) => effect === 'Singing' || effect === 'Hidden',
        ); // Both effects

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(0); // Singing takes priority
      });
    });

    describe('Warrior-like Classes', () => {
      beforeEach(() => {
        mockCharacter.baseClass = BaseClass.Warrior;
        vi.mocked(settingClassConfigGet).mockImplementation(
          (baseClass, setting) => {
            if (setting === 'regensLikeWarrior') return true;
            return false;
          },
        );
      });

      it('should return out-of-combat regen for warriors not in combat', () => {
        mockCharacter.combatTicks = 0;

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(-3); // warriorOOCRegen
      });

      it('should return in-combat regen for warriors in combat', () => {
        mockCharacter.combatTicks = 5;

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(3); // warriorICRegen
      });

      it('should use custom warrior regen settings', () => {
        vi.mocked(settingGameGet).mockImplementation((category, setting) => {
          switch (`${category}.${setting}`) {
            case 'character.warriorOOCRegen':
              return -5; // Custom OOC regen
            case 'character.warriorICRegen':
              return 7; // Custom IC regen
            default:
              return null;
          }
        });

        mockCharacter.combatTicks = 0;
        expect(regenMPGet(mockCharacter)).toBe(-5);

        mockCharacter.combatTicks = 1;
        expect(regenMPGet(mockCharacter)).toBe(7);
      });

      it('should handle null warrior settings', () => {
        vi.mocked(settingGameGet).mockReturnValue(null);

        mockCharacter.combatTicks = 0;
        expect(regenMPGet(mockCharacter)).toBe(-3); // Default

        mockCharacter.combatTicks = 1;
        expect(regenMPGet(mockCharacter)).toBe(3); // Default
      });
    });

    describe('Regular Classes (Traveller, etc.)', () => {
      beforeEach(() => {
        mockCharacter.baseClass = BaseClass.Traveller;
        vi.mocked(settingClassConfigGet).mockReturnValue(false); // Not special class
      });

      it('should return base MP regen for regular classes', () => {
        vi.mocked(getStat).mockReturnValue(8);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(8); // Just base, no boost
      });

      it('should handle negative base MP regen', () => {
        vi.mocked(getStat).mockReturnValue(-5);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(-5);
      });

      it('should handle zero base MP regen', () => {
        vi.mocked(getStat).mockReturnValue(0);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(0);
      });
    });

    describe('Class Configuration Edge Cases', () => {
      it('should handle multiple class flags simultaneously', () => {
        mockCharacter.baseClass = BaseClass.Healer;
        vi.mocked(settingClassConfigGet).mockImplementation(
          (baseClass, setting) => {
            switch (setting) {
              case 'usesMana':
                return true;
              case 'regensLikeThief':
                return true; // Also has thief regen
              default:
                return false;
            }
          },
        );

        // Should prioritize thief-like behavior over mana user
        mockCharacter.combatTicks = 0;
        vi.mocked(traitLevelValue).mockReturnValue(0.5);
        vi.mocked(getStat).mockReturnValue(10);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(15); // Thief OOC: Math.max(0, Math.floor(10 * 0.5)) + 10 = 5 + 10
      });

      it('should handle warrior and thief flags simultaneously', () => {
        vi.mocked(settingClassConfigGet).mockImplementation(
          (baseClass, setting) => {
            switch (setting) {
              case 'regensLikeThief':
                return true;
              case 'regensLikeWarrior':
                return true; // Both flags
              default:
                return false;
            }
          },
        );

        // Should prioritize thief behavior
        mockCharacter.combatTicks = 0;
        vi.mocked(traitLevelValue).mockReturnValue(0.3);
        vi.mocked(getStat).mockReturnValue(12);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(13); // Thief behavior: Math.max(0, Math.floor(12 * 0.3)) + 10 = 3 + 10
      });

      it('should handle null class config responses', () => {
        vi.mocked(settingClassConfigGet).mockReturnValue(null as any);
        vi.mocked(getStat).mockReturnValue(7);

        const result = regenMPGet(mockCharacter);

        expect(result).toBe(7); // Falls back to regular class behavior
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle character with both HP and MP regen needs', () => {
      mockCharacter.baseClass = BaseClass.Mage;
      vi.mocked(settingClassConfigGet).mockImplementation(
        (baseClass, setting) => {
          if (setting === 'usesMana') return true;
          return false;
        },
      );

      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 4;
          case Stat.MPRegen:
            return 8;
          case Stat.CON:
            return 26; // 5 above threshold
          default:
            return 0;
        }
      });

      const hpRegen = regenHPGet(mockCharacter);
      const mpRegen = regenMPGet(mockCharacter);

      expect(hpRegen).toBe(10); // max(5, 5 + 5) = 10
      expect(mpRegen).toBe(18); // 8 + 10 (caster boost)
    });

    it('should handle character class changes', () => {
      vi.mocked(getStat).mockReturnValue(10);

      // Start as Mage
      mockCharacter.baseClass = BaseClass.Mage;
      vi.mocked(settingClassConfigGet).mockImplementation(
        (baseClass, setting) => {
          if (baseClass === BaseClass.Mage && setting === 'usesMana') {
            return true;
          }
          return false;
        },
      );
      expect(regenMPGet(mockCharacter)).toBe(20); // 10 + 10

      // Change to Thief
      mockCharacter.baseClass = BaseClass.Thief;
      mockCharacter.combatTicks = 0;
      vi.mocked(settingClassConfigGet).mockImplementation(
        (baseClass, setting) => {
          if (baseClass === BaseClass.Thief && setting === 'regensLikeThief') {
            return true;
          }
          return false;
        },
      );
      vi.mocked(traitLevelValue).mockReturnValue(0.2);
      expect(regenMPGet(mockCharacter)).toBe(12); // Math.max(0, Math.floor(10 * 0.2)) + 10 = 2 + 10

      // Change to Warrior
      mockCharacter.baseClass = BaseClass.Warrior;
      vi.mocked(settingClassConfigGet).mockImplementation(
        (baseClass, setting) => {
          if (
            baseClass === BaseClass.Warrior &&
            setting === 'regensLikeWarrior'
          ) {
            return true;
          }
          return false;
        },
      );
      expect(regenMPGet(mockCharacter)).toBe(-3); // warriorOOCRegen
    });

    it('should handle combat state changes for thieves', () => {
      mockCharacter.baseClass = BaseClass.Thief;
      vi.mocked(settingClassConfigGet).mockImplementation(
        (baseClass, setting) => {
          if (setting === 'regensLikeThief') return true;
          return false;
        },
      );
      vi.mocked(getStat).mockReturnValue(15);
      vi.mocked(traitLevelValue).mockReturnValue(0.4);

      // Out of combat
      mockCharacter.combatTicks = 0;
      expect(regenMPGet(mockCharacter)).toBe(16); // Math.max(0, Math.floor(15 * 0.4)) + 10 = 6 + 10

      // Enter combat
      mockCharacter.combatTicks = 1;
      expect(regenMPGet(mockCharacter)).toBe(1); // thiefICRegen

      // Exit combat
      mockCharacter.combatTicks = 0;
      expect(regenMPGet(mockCharacter)).toBe(16); // Back to OOC regen
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle getStat returning undefined', () => {
      vi.mocked(getStat).mockReturnValue(undefined as any);

      expect(() => regenHPGet(mockCharacter)).not.toThrow();
      expect(() => regenMPGet(mockCharacter)).not.toThrow();
    });

    it('should handle settingGameGet throwing errors', () => {
      vi.mocked(settingGameGet).mockImplementation(() => {
        throw new Error('Settings error');
      });

      expect(() => regenHPGet(mockCharacter)).toThrow('Settings error');
    });

    it('should handle very large numbers', () => {
      vi.mocked(getStat).mockImplementation((character, stat) => {
        switch (stat) {
          case Stat.HPRegen:
            return 1000000;
          case Stat.CON:
            return 1000000;
          default:
            return 0;
        }
      });

      const result = regenHPGet(mockCharacter);
      expect(result).toBeGreaterThan(1000000);
      expect(typeof result).toBe('number');
      expect(isFinite(result)).toBe(true);
    });

    it('should handle floating point precision issues', () => {
      vi.mocked(getStat).mockReturnValue(10);
      vi.mocked(traitLevelValue).mockReturnValue(0.1);
      mockCharacter.baseClass = BaseClass.Thief;
      mockCharacter.combatTicks = 0;
      vi.mocked(settingClassConfigGet).mockImplementation(
        (baseClass, setting) => {
          if (setting === 'regensLikeThief') return true;
          return false;
        },
      );

      const result = regenMPGet(mockCharacter);
      expect(result).toBe(11); // Math.max(0, Math.floor(10 * 0.1)) + 10 = 1 + 10
    });
  });
});
