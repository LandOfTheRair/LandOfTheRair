import type { BoundedNumber, ICharacter } from '@lotr/interfaces';
import { Allegiance } from '@lotr/interfaces';
import { describe, expect, it, vi } from 'vitest';
import { heal, healToFull, takeDamage } from './health';

// Mock the dependencies
vi.mock('@lotr/shared', () => ({
  cleanNumber: vi.fn((value) => Math.floor(value)),
}));

vi.mock('lodash', () => ({
  clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value))),
}));

describe('Health Functions', () => {
  const createMockCharacter = (
    currentHp = 50,
    maxHp = 100,
    minHp = 0,
    allegiance = Allegiance.Enemy,
  ): ICharacter =>
    ({
      hp: {
        current: currentHp,
        maximum: maxHp,
        minimum: minHp,
      } as BoundedNumber,
      allegiance,
    }) as unknown as ICharacter;

  describe('heal', () => {
    it('should increase HP when healing amount is positive', () => {
      const char = createMockCharacter(50, 100, 0);

      heal(char, 25);

      expect(char.hp.current).toBe(75);
    });

    it('should not exceed maximum HP when healing', () => {
      const char = createMockCharacter(90, 100, 0);

      heal(char, 25);

      expect(char.hp.current).toBe(100);
    });

    it('should decrease HP when healing amount is negative', () => {
      const char = createMockCharacter(50, 100, 0);

      heal(char, -25);

      expect(char.hp.current).toBe(25);
    });

    it('should not go below minimum HP', () => {
      const char = createMockCharacter(20, 100, 0);

      heal(char, -50);

      expect(char.hp.current).toBe(0);
    });

    it('should return early when heal amount is zero', () => {
      const char = createMockCharacter(50, 100, 0);
      const originalHp = char.hp.current;

      heal(char, 0);

      expect(char.hp.current).toBe(originalHp);
    });

    it('should not heal natural resources with positive HP', () => {
      const char = createMockCharacter(50, 100, 0, Allegiance.NaturalResource);

      heal(char, 25);

      expect(char.hp.current).toBe(50); // Should remain unchanged
    });

    it('should allow damage to natural resources', () => {
      const char = createMockCharacter(50, 100, 0, Allegiance.NaturalResource);

      heal(char, -25);

      expect(char.hp.current).toBe(25);
    });

    it('should handle fractional healing amounts', () => {
      const char = createMockCharacter(50, 100, 0);

      heal(char, 25.7);

      expect(char.hp.current).toBe(75); // cleanNumber should floor it
    });

    it('should handle minimum HP above zero', () => {
      const char = createMockCharacter(30, 100, 10);

      heal(char, -50);

      expect(char.hp.current).toBe(10);
    });

    it('should handle healing to exactly maximum HP', () => {
      const char = createMockCharacter(25, 100, 0);

      heal(char, 75);

      expect(char.hp.current).toBe(100);
    });

    it('should handle damage to exactly minimum HP', () => {
      const char = createMockCharacter(25, 100, 0);

      heal(char, -25);

      expect(char.hp.current).toBe(0);
    });

    it('should work with different allegiances', () => {
      const enemyChar = createMockCharacter(50, 100, 0, Allegiance.Enemy);
      const townsfoldChar = createMockCharacter(
        50,
        100,
        0,
        Allegiance.Townsfolk,
      );

      heal(enemyChar, 25);
      heal(townsfoldChar, 25);

      expect(enemyChar.hp.current).toBe(75);
      expect(townsfoldChar.hp.current).toBe(75);
    });
  });

  describe('healToFull', () => {
    it('should heal character to maximum HP', () => {
      const char = createMockCharacter(25, 100, 0);

      healToFull(char);

      expect(char.hp.current).toBe(100);
    });

    it('should work when character is already at full HP', () => {
      const char = createMockCharacter(100, 100, 0);

      healToFull(char);

      expect(char.hp.current).toBe(100);
    });

    it('should work when character is at minimum HP', () => {
      const char = createMockCharacter(0, 100, 0);

      healToFull(char);

      expect(char.hp.current).toBe(100);
    });

    it('should not heal natural resources', () => {
      const char = createMockCharacter(25, 100, 0, Allegiance.NaturalResource);

      healToFull(char);

      expect(char.hp.current).toBe(25); // Should remain unchanged
    });

    it('should work with different maximum HP values', () => {
      const lowHpChar = createMockCharacter(10, 50, 0);
      const highHpChar = createMockCharacter(100, 500, 0);

      healToFull(lowHpChar);
      healToFull(highHpChar);

      expect(lowHpChar.hp.current).toBe(50);
      expect(highHpChar.hp.current).toBe(500);
    });
  });

  describe('takeDamage', () => {
    it('should reduce HP by damage amount', () => {
      const char = createMockCharacter(50, 100, 0);

      takeDamage(char, 25);

      expect(char.hp.current).toBe(25);
    });

    it('should not go below minimum HP when taking damage', () => {
      const char = createMockCharacter(20, 100, 0);

      takeDamage(char, 50);

      expect(char.hp.current).toBe(0);
    });

    it('should handle zero damage', () => {
      const char = createMockCharacter(50, 100, 0);
      const originalHp = char.hp.current;

      takeDamage(char, 0);

      expect(char.hp.current).toBe(originalHp);
    });

    it('should handle negative damage as healing', () => {
      const char = createMockCharacter(50, 100, 0);

      takeDamage(char, -25);

      expect(char.hp.current).toBe(75);
    });

    it('should work with fractional damage', () => {
      const char = createMockCharacter(50, 100, 0);

      takeDamage(char, 25.3);

      expect(char.hp.current).toBe(24); // 50 - 26 = 24 (damage is floored to 25)
    });

    it('should work on natural resources', () => {
      const char = createMockCharacter(50, 100, 0, Allegiance.NaturalResource);

      takeDamage(char, 25);

      expect(char.hp.current).toBe(25);
    });

    it('should handle damage equal to current HP', () => {
      const char = createMockCharacter(50, 100, 0);

      takeDamage(char, 50);

      expect(char.hp.current).toBe(0);
    });

    it('should work with minimum HP above zero', () => {
      const char = createMockCharacter(30, 100, 10);

      takeDamage(char, 50);

      expect(char.hp.current).toBe(10);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with multiple operations', () => {
      const char = createMockCharacter(50, 100, 0);

      heal(char, 25);
      expect(char.hp.current).toBe(75);

      takeDamage(char, 30);
      expect(char.hp.current).toBe(45);

      healToFull(char);
      expect(char.hp.current).toBe(100);

      takeDamage(char, 200);
      expect(char.hp.current).toBe(0);
    });

    it('should handle edge cases with bounds', () => {
      const char = createMockCharacter(25, 100, 5);

      // Test healing beyond max
      heal(char, 200);
      expect(char.hp.current).toBe(100);

      // Test damage below min
      takeDamage(char, 200);
      expect(char.hp.current).toBe(5);

      // Test heal to full from minimum
      healToFull(char);
      expect(char.hp.current).toBe(100);
    });
  });
});
