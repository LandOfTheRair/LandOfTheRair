import type { BoundedNumber, ICharacter } from '@lotr/interfaces';
import { describe, expect, it, vi } from 'vitest';
import { mana, manaDamage, manaToFull } from './mana';

// Mock the dependencies
vi.mock('@lotr/shared', () => ({
  cleanNumber: vi.fn((value) => Math.floor(value)),
}));

vi.mock('lodash', () => ({
  clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value))),
}));

describe('Mana Functions', () => {
  const createMockCharacter = (
    currentMp = 50,
    maxMp = 100,
    minMp = 0,
  ): ICharacter =>
    ({
      mp: {
        current: currentMp,
        maximum: maxMp,
        minimum: minMp,
      } as BoundedNumber,
    }) as unknown as ICharacter;

  describe('mana', () => {
    it('should increase MP when amount is positive', () => {
      const char = createMockCharacter(50, 100, 0);

      mana(char, 25);

      expect(char.mp.current).toBe(75);
    });

    it('should not exceed maximum MP', () => {
      const char = createMockCharacter(90, 100, 0);

      mana(char, 25);

      expect(char.mp.current).toBe(100);
    });

    it('should decrease MP when amount is negative', () => {
      const char = createMockCharacter(50, 100, 0);

      mana(char, -25);

      expect(char.mp.current).toBe(25);
    });

    it('should not go below minimum MP', () => {
      const char = createMockCharacter(20, 100, 0);

      mana(char, -50);

      expect(char.mp.current).toBe(0);
    });

    it('should handle zero mana change', () => {
      const char = createMockCharacter(50, 100, 0);
      const originalMp = char.mp.current;

      mana(char, 0);

      expect(char.mp.current).toBe(originalMp);
    });

    it('should handle fractional mana amounts', () => {
      const char = createMockCharacter(50, 100, 0);

      mana(char, 25.7);

      expect(char.mp.current).toBe(75); // cleanNumber should floor it
    });

    it('should handle minimum MP above zero', () => {
      const char = createMockCharacter(30, 100, 10);

      mana(char, -50);

      expect(char.mp.current).toBe(10);
    });

    it('should handle restoring to exactly maximum MP', () => {
      const char = createMockCharacter(25, 100, 0);

      mana(char, 75);

      expect(char.mp.current).toBe(100);
    });

    it('should handle draining to exactly minimum MP', () => {
      const char = createMockCharacter(25, 100, 0);

      mana(char, -25);

      expect(char.mp.current).toBe(0);
    });

    it('should work with very large mana amounts', () => {
      const char = createMockCharacter(50, 1000, 0);

      mana(char, 2000);

      expect(char.mp.current).toBe(1000);
    });

    it('should work with very large negative amounts', () => {
      const char = createMockCharacter(500, 1000, 0);

      mana(char, -2000);

      expect(char.mp.current).toBe(0);
    });

    it('should handle different maximum MP values', () => {
      const lowMpChar = createMockCharacter(10, 50, 0);
      const highMpChar = createMockCharacter(100, 500, 0);

      mana(lowMpChar, 100);
      mana(highMpChar, 1000);

      expect(lowMpChar.mp.current).toBe(50);
      expect(highMpChar.mp.current).toBe(500);
    });
  });

  describe('manaDamage', () => {
    it('should reduce MP by damage amount', () => {
      const char = createMockCharacter(50, 100, 0);

      manaDamage(char, 25);

      expect(char.mp.current).toBe(25);
    });

    it('should not go below minimum MP when taking damage', () => {
      const char = createMockCharacter(20, 100, 0);

      manaDamage(char, 50);

      expect(char.mp.current).toBe(0);
    });

    it('should handle zero mana damage', () => {
      const char = createMockCharacter(50, 100, 0);
      const originalMp = char.mp.current;

      manaDamage(char, 0);

      expect(char.mp.current).toBe(originalMp);
    });

    it('should handle negative damage as mana restoration', () => {
      const char = createMockCharacter(50, 100, 0);

      manaDamage(char, -25);

      expect(char.mp.current).toBe(75);
    });

    it('should work with fractional damage', () => {
      const char = createMockCharacter(50, 100, 0);

      manaDamage(char, 25.3);

      expect(char.mp.current).toBe(24); // 50 - 26 = 24 (damage is floored to 25)
    });

    it('should handle damage equal to current MP', () => {
      const char = createMockCharacter(50, 100, 0);

      manaDamage(char, 50);

      expect(char.mp.current).toBe(0);
    });

    it('should work with minimum MP above zero', () => {
      const char = createMockCharacter(30, 100, 10);

      manaDamage(char, 50);

      expect(char.mp.current).toBe(10);
    });

    it('should handle very large damage amounts', () => {
      const char = createMockCharacter(500, 1000, 0);

      manaDamage(char, 2000);

      expect(char.mp.current).toBe(0);
    });
  });

  describe('manaToFull', () => {
    it('should restore character to maximum MP', () => {
      const char = createMockCharacter(25, 100, 0);

      manaToFull(char);

      expect(char.mp.current).toBe(100);
    });

    it('should work when character is already at full MP', () => {
      const char = createMockCharacter(100, 100, 0);

      manaToFull(char);

      expect(char.mp.current).toBe(100);
    });

    it('should work when character is at minimum MP', () => {
      const char = createMockCharacter(0, 100, 0);

      manaToFull(char);

      expect(char.mp.current).toBe(100);
    });

    it('should work with different maximum MP values', () => {
      const lowMpChar = createMockCharacter(10, 50, 0);
      const highMpChar = createMockCharacter(100, 500, 0);

      manaToFull(lowMpChar);
      manaToFull(highMpChar);

      expect(lowMpChar.mp.current).toBe(50);
      expect(highMpChar.mp.current).toBe(500);
    });

    it('should work from minimum MP above zero', () => {
      const char = createMockCharacter(15, 100, 15);

      manaToFull(char);

      expect(char.mp.current).toBe(100);
    });

    it('should work with very high maximum MP', () => {
      const char = createMockCharacter(100, 9999, 0);

      manaToFull(char);

      expect(char.mp.current).toBe(9999);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with multiple operations', () => {
      const char = createMockCharacter(50, 100, 0);

      mana(char, 25);
      expect(char.mp.current).toBe(75);

      manaDamage(char, 30);
      expect(char.mp.current).toBe(45);

      manaToFull(char);
      expect(char.mp.current).toBe(100);

      manaDamage(char, 200);
      expect(char.mp.current).toBe(0);
    });

    it('should handle edge cases with bounds', () => {
      const char = createMockCharacter(25, 100, 5);

      // Test restoration beyond max
      mana(char, 200);
      expect(char.mp.current).toBe(100);

      // Test damage below min
      manaDamage(char, 200);
      expect(char.mp.current).toBe(5);

      // Test restore to full from minimum
      manaToFull(char);
      expect(char.mp.current).toBe(100);
    });

    it('should work with fractional values and bounds', () => {
      const char = createMockCharacter(50.8, 100, 0);

      mana(char, 25.3);
      expect(char.mp.current).toBe(76); // Should be floored

      manaDamage(char, 30.7);
      expect(char.mp.current).toBe(45); // Should be floored
    });
  });
});
