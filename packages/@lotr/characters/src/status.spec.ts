import type { ICharacter } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { canAct, isDead } from './status';

// Mock the @lotr/effects module
vi.mock('@lotr/effects', () => ({
  getEffect: vi.fn(),
  hasEffect: vi.fn(),
}));

import { getEffect, hasEffect } from '@lotr/effects';

describe('Status Functions', () => {
  const createMockCharacter = (
    hp: Partial<{ current: number }> = {},
  ): ICharacter =>
    ({
      uuid: 'test-uuid',
      name: 'Test Character',
      hp: { current: 100, ...hp },
      effects: {},
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEffect).mockReturnValue(null as any);
    vi.mocked(hasEffect).mockReturnValue(false);
  });

  describe('canAct', () => {
    it('should return true when character has no freezing effects', () => {
      const character = createMockCharacter();
      const result = canAct(character);
      expect(result).toBe(true);
    });

    it('should return false when character has Stun effect with isFrozen', () => {
      const character = createMockCharacter();

      vi.mocked(getEffect).mockImplementation((char, effectName) => {
        if (effectName === 'Stun') {
          return { effectInfo: { isFrozen: true, potency: 1 } } as any;
        }
        return null as any;
      });

      const result = canAct(character);
      expect(result).toBe(false);
    });

    it('should return false when character has Chilled effect with isFrozen', () => {
      const character = createMockCharacter();

      vi.mocked(getEffect).mockImplementation((char, effectName) => {
        if (effectName === 'Chilled') {
          return { effectInfo: { isFrozen: true, potency: 1 } } as any;
        }
        return null as any;
      });

      const result = canAct(character);
      expect(result).toBe(false);
    });
  });

  describe('isDead', () => {
    it('should return true when character has Dead effect', () => {
      const character = createMockCharacter({ current: 50 });

      vi.mocked(hasEffect).mockImplementation(
        (char, effectName) => effectName === 'Dead',
      );

      const result = isDead(character);
      expect(result).toBe(true);
    });

    it('should return true when character has 0 HP', () => {
      const character = createMockCharacter({ current: 0 });
      const result = isDead(character);
      expect(result).toBe(true);
    });

    it('should return false when character has positive HP and no Dead effect', () => {
      const character = createMockCharacter({ current: 50 });
      const result = isDead(character);
      expect(result).toBe(false);
    });
  });
});
