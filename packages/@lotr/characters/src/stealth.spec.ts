import type { ICharacter } from '@lotr/interfaces';
import {
  BaseClass,
  ItemSlot,
  Skill,
  Stat,
  WeaponClass,
} from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { perceptionGet, stealthGet, stealthPenaltyGet } from './stealth';

// Mock all external dependencies
vi.mock('@lotr/content', () => ({
  coreHideReductions: vi.fn(),
  itemPropertyGet: vi.fn(),
  settingClassConfigGet: vi.fn(),
  settingGameGet: vi.fn(),
  traitLevelValue: vi.fn(),
}));

vi.mock('@lotr/effects', () => ({
  hasEffect: vi.fn(),
}));

vi.mock('./skills', () => ({
  getSkillLevel: vi.fn(),
}));

vi.mock('./stats', () => ({
  getStat: vi.fn(),
}));

// Import mocked functions
import {
  coreHideReductions,
  itemPropertyGet,
  settingClassConfigGet,
  settingGameGet,
  traitLevelValue,
} from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import { getSkillLevel } from './skills';
import { getStat } from './stats';

describe('stealth', () => {
  let mockCharacter: ICharacter;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a basic mock character
    mockCharacter = {
      uuid: 'test-char-123',
      name: 'TestChar',
      baseClass: BaseClass.Thief,
      level: 10,
      items: {
        equipment: {
          [ItemSlot.LeftHand]: undefined,
          [ItemSlot.RightHand]: undefined,
        } as any,
      },
      allStats: {},
      allTraits: {},
    } as unknown as ICharacter;

    // Set up default mock returns
    (getSkillLevel as any).mockReturnValue(5);
    (getStat as any).mockReturnValue(10);
    (settingClassConfigGet as any).mockReturnValue(false);
    (settingGameGet as any).mockReturnValue(1.5);
    (hasEffect as any).mockReturnValue(false);
    (coreHideReductions as any).mockReturnValue({});
    (itemPropertyGet as any).mockReturnValue(undefined);
    (traitLevelValue as any).mockReturnValue(0);
  });

  describe('stealthGet', () => {
    it('should calculate basic stealth value without bonuses', () => {
      // Setup: Thievery=5, level=10, AGI=10, no stealth bonus
      (getSkillLevel as any).mockReturnValue(5);
      (getStat as any).mockReturnValue(10);
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(25); // Math.floor(5 + 10 + 10)
      expect(getSkillLevel).toHaveBeenCalledWith(mockCharacter, Skill.Thievery);
      expect(getStat).toHaveBeenCalledWith(mockCharacter, Stat.AGI);
      expect(settingClassConfigGet).toHaveBeenCalledWith(
        BaseClass.Thief,
        'hasStealthBonus',
      );
    });

    it('should apply stealth bonus multiplier for classes with stealth bonus', () => {
      (getSkillLevel as any).mockReturnValue(5);
      (getStat as any).mockReturnValue(10);
      (settingClassConfigGet as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(2.0);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(50); // Math.floor((5 + 10 + 10) * 2.0)
      expect(settingGameGet).toHaveBeenCalledWith(
        'character',
        'thiefStealthMultiplier',
      );
    });

    it('should use default stealth multiplier when setting returns null', () => {
      (getSkillLevel as any).mockReturnValue(5);
      (getStat as any).mockReturnValue(10);
      (settingClassConfigGet as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(null);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(37); // Math.floor((5 + 10 + 10) * 1.5)
    });

    it('should apply encumbered penalty', () => {
      (getSkillLevel as any).mockReturnValue(10);
      (getStat as any).mockReturnValue(10);
      (settingClassConfigGet as any).mockReturnValue(false);
      (hasEffect as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(2);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(15); // Math.floor((10 + 10 + 10) / 2)
      expect(hasEffect).toHaveBeenCalledWith(mockCharacter, 'Encumbered');
      expect(settingGameGet).toHaveBeenCalledWith(
        'character',
        'stealthEncumberDivisor',
      );
    });

    it('should use default encumber divisor when setting returns null', () => {
      (getSkillLevel as any).mockReturnValue(10);
      (getStat as any).mockReturnValue(10);
      (settingClassConfigGet as any).mockReturnValue(false);
      (hasEffect as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(null);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(15); // Math.floor((10 + 10 + 10) / 2)
    });

    it('should apply both stealth bonus and encumbered penalty', () => {
      (getSkillLevel as any).mockReturnValue(10);
      (getStat as any).mockReturnValue(10);
      (settingClassConfigGet as any).mockReturnValue(true);
      (hasEffect as any).mockReturnValue(true);
      (settingGameGet as any)
        .mockReturnValueOnce(1.5) // thiefStealthMultiplier
        .mockReturnValueOnce(3); // stealthEncumberDivisor

      const result = stealthGet(mockCharacter);

      expect(result).toBe(15); // Math.floor(((10 + 10 + 10) * 1.5) / 3)
    });

    it('should handle zero values', () => {
      (getSkillLevel as any).mockReturnValue(0);
      (getStat as any).mockReturnValue(0);
      mockCharacter.level = 0;
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      (getSkillLevel as any).mockReturnValue(-5);
      (getStat as any).mockReturnValue(-3);
      mockCharacter.level = 2;
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(-6); // Math.floor(-5 + 2 + (-3))
    });

    it('should handle high values', () => {
      (getSkillLevel as any).mockReturnValue(100);
      (getStat as any).mockReturnValue(50);
      mockCharacter.level = 75;
      (settingClassConfigGet as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(2.5);

      const result = stealthGet(mockCharacter);

      expect(result).toBe(562); // Math.floor((100 + 75 + 50) * 2.5)
    });
  });

  describe('stealthPenaltyGet', () => {
    beforeEach(() => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = undefined;
      mockCharacter.items.equipment[ItemSlot.RightHand] = undefined;
    });

    it('should return 0 when no weapons are equipped', () => {
      (coreHideReductions as any).mockReturnValue({});
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(0);
      expect(coreHideReductions).toHaveBeenCalled();
      expect(traitLevelValue).toHaveBeenCalledWith(
        mockCharacter,
        'ShadowSheath',
      );
    });

    it('should calculate penalty for left hand weapon only', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Sword);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 10,
      });
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(10); // Math.floor(10 * (1 - 0))
      expect(itemPropertyGet).toHaveBeenCalledWith(
        mockCharacter.items.equipment[ItemSlot.LeftHand],
        'itemClass',
      );
    });

    it('should calculate penalty for right hand weapon only', () => {
      mockCharacter.items.equipment[ItemSlot.RightHand] = {
        uuid: 'right-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Dagger);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Dagger]: 5,
      });
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(5);
      expect(itemPropertyGet).toHaveBeenCalledWith(
        mockCharacter.items.equipment[ItemSlot.RightHand],
        'itemClass',
      );
    });

    it('should calculate penalty for both hands with different weapons', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      mockCharacter.items.equipment[ItemSlot.RightHand] = {
        uuid: 'right-weapon',
      } as any;

      (itemPropertyGet as any)
        .mockReturnValueOnce(WeaponClass.Sword) // left hand
        .mockReturnValueOnce(WeaponClass.Dagger); // right hand

      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 15,
        [WeaponClass.Dagger]: 3,
      });
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(18); // Math.floor((15 + 3) * 1)
    });

    it('should apply ShadowSheath trait reduction', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Sword);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 20,
      });
      (traitLevelValue as any).mockReturnValue(0.3); // 30% reduction

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(14); // Math.floor(20 * (1 - 0.3)) = Math.floor(20 * 0.7)
    });

    it('should handle maximum ShadowSheath trait (100% reduction)', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Sword);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 20,
      });
      (traitLevelValue as any).mockReturnValue(1.0); // 100% reduction

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(0); // Math.floor(20 * (1 - 1.0))
    });

    it('should handle ShadowSheath trait exceeding 1.0', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Sword);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 20,
      });
      (traitLevelValue as any).mockReturnValue(1.5); // 150% reduction (capped by Math.max)

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(0); // Math.floor(20 * Math.max(0, 1 - 1.5))
    });

    it('should handle weapon classes not in hide reductions', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Staff);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 10,
        // Staff not included
      });
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(0); // No penalty for Staff
    });

    it('should handle undefined weapon classes', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(undefined);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 10,
      });
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(0);
    });

    it('should handle fractional penalties', () => {
      mockCharacter.items.equipment[ItemSlot.LeftHand] = {
        uuid: 'left-weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Sword);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 7,
      });
      (traitLevelValue as any).mockReturnValue(0.1); // 10% reduction

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(6); // Math.floor(7 * 0.9) = Math.floor(6.3)
    });
  });

  describe('perceptionGet', () => {
    it('should calculate basic perception without bonus', () => {
      (getStat as any)
        .mockReturnValueOnce(15) // Perception stat
        .mockReturnValueOnce(12); // WIS stat
      mockCharacter.level = 8;
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(35); // 15 + 8 + 12
      expect(getStat).toHaveBeenCalledWith(mockCharacter, Stat.Perception);
      expect(getStat).toHaveBeenCalledWith(mockCharacter, Stat.WIS);
      expect(settingClassConfigGet).toHaveBeenCalledWith(
        BaseClass.Thief,
        'hasPerceptionBonus',
      );
    });

    it('should apply perception bonus multiplier', () => {
      (getStat as any)
        .mockReturnValueOnce(10) // Perception stat
        .mockReturnValueOnce(8); // WIS stat
      mockCharacter.level = 12;
      (settingClassConfigGet as any).mockReturnValue(true);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(45); // (10 + 12 + 8) * 1.5
    });

    it('should handle zero values', () => {
      (getStat as any)
        .mockReturnValueOnce(0) // Perception stat
        .mockReturnValueOnce(0); // WIS stat
      mockCharacter.level = 0;
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      (getStat as any)
        .mockReturnValueOnce(-5) // Perception stat
        .mockReturnValueOnce(-3); // WIS stat
      mockCharacter.level = 2;
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(-6); // -5 + 2 + (-3)
    });

    it('should handle high values with bonus', () => {
      (getStat as any)
        .mockReturnValueOnce(50) // Perception stat
        .mockReturnValueOnce(40); // WIS stat
      mockCharacter.level = 60;
      (settingClassConfigGet as any).mockReturnValue(true);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(225); // (50 + 60 + 40) * 1.5
    });

    it('should work with different character classes', () => {
      mockCharacter.baseClass = BaseClass.Mage;
      (getStat as any)
        .mockReturnValueOnce(12) // Perception stat
        .mockReturnValueOnce(18); // WIS stat
      mockCharacter.level = 10;
      (settingClassConfigGet as any).mockReturnValue(false);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(40); // 12 + 10 + 18
      expect(settingClassConfigGet).toHaveBeenCalledWith(
        BaseClass.Mage,
        'hasPerceptionBonus',
      );
    });

    it('should handle fractional results from bonus', () => {
      (getStat as any)
        .mockReturnValueOnce(7) // Perception stat
        .mockReturnValueOnce(8); // WIS stat
      mockCharacter.level = 5;
      (settingClassConfigGet as any).mockReturnValue(true);

      const result = perceptionGet(mockCharacter);

      expect(result).toBe(30); // (7 + 5 + 8) * 1.5 = 30
    });
  });

  describe('Integration Tests', () => {
    it('should handle stealth and perception for the same character', () => {
      // Setup character with high stealth but low perception
      (getSkillLevel as any).mockReturnValue(20);
      (getStat as any)
        .mockReturnValueOnce(25) // AGI for stealth
        .mockReturnValueOnce(5) // Perception stat
        .mockReturnValueOnce(8); // WIS stat

      mockCharacter.level = 15;
      (settingClassConfigGet as any)
        .mockReturnValueOnce(true) // hasStealthBonus
        .mockReturnValueOnce(false); // hasPerceptionBonus

      const stealthResult = stealthGet(mockCharacter);
      const perceptionResult = perceptionGet(mockCharacter);

      expect(stealthResult).toBe(90); // Math.floor((20 + 15 + 25) * 1.5)
      expect(perceptionResult).toBe(28); // 5 + 15 + 8
    });

    it('should handle character with weapons and stealth penalty', () => {
      mockCharacter.items.equipment[ItemSlot.RightHand] = {
        uuid: 'weapon',
      } as any;
      (itemPropertyGet as any).mockReturnValue(WeaponClass.Sword);
      (coreHideReductions as any).mockReturnValue({
        [WeaponClass.Sword]: 12,
      });
      (traitLevelValue as any).mockReturnValue(0.25); // 25% reduction

      // Also test stealth calculation
      (getSkillLevel as any).mockReturnValue(15);
      (getStat as any).mockReturnValue(20);
      mockCharacter.level = 10;
      (settingClassConfigGet as any).mockReturnValue(true);

      const stealthResult = stealthGet(mockCharacter);
      const penaltyResult = stealthPenaltyGet(mockCharacter);

      expect(stealthResult).toBe(67); // Math.floor((15 + 10 + 20) * 1.5)
      expect(penaltyResult).toBe(9); // Math.floor(12 * (1 - 0.25))
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle character with minimal properties', () => {
      const minimalChar = {
        uuid: 'minimal',
        name: 'Minimal',
        baseClass: BaseClass.Traveller,
        level: 1,
        items: {
          equipment: {} as any,
        },
        allStats: {},
        allTraits: {},
      } as unknown as ICharacter;

      (getSkillLevel as any).mockReturnValue(0);
      (getStat as any).mockReturnValue(1);
      (settingClassConfigGet as any).mockReturnValue(false);

      expect(() => stealthGet(minimalChar)).not.toThrow();
      expect(() => perceptionGet(minimalChar)).not.toThrow();
      expect(() => stealthPenaltyGet(minimalChar)).not.toThrow();
    });

    it('should handle very large numbers', () => {
      (getSkillLevel as any).mockReturnValue(999999);
      (getStat as any).mockReturnValue(999999);
      mockCharacter.level = 999999;
      (settingClassConfigGet as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(999);

      const result = stealthGet(mockCharacter);

      expect(typeof result).toBe('number');
      expect(isFinite(result)).toBe(true);
    });

    it('should handle Math.floor edge cases', () => {
      (getSkillLevel as any).mockReturnValue(3);
      (getStat as any).mockReturnValue(3);
      mockCharacter.level = 2;
      (settingClassConfigGet as any).mockReturnValue(true);
      (settingGameGet as any).mockReturnValue(1.9); // Will create 15.2, floors to 15

      const result = stealthGet(mockCharacter);

      expect(result).toBe(15); // Math.floor((3 + 2 + 3) * 1.9) = Math.floor(15.2)
    });

    it('should handle equipment array edge cases', () => {
      // Test with equipment object having no slots
      mockCharacter.items.equipment = {} as any;
      (coreHideReductions as any).mockReturnValue({});
      (traitLevelValue as any).mockReturnValue(0);

      const result = stealthPenaltyGet(mockCharacter);

      expect(result).toBe(0);
    });
  });
});
