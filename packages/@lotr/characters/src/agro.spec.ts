import type { ICharacter } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { hasAgro } from './agro';

describe('Agro Functions', () => {
  const createMockCharacter = (
    uuid: string,
    agro: Record<string, number> = {},
  ): ICharacter =>
    ({
      uuid,
      agro,
    }) as unknown as ICharacter;

  describe('hasAgro', () => {
    it('should return true when target has positive agro for character', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', { 'char-1': 5 });

      const result = hasAgro(char, target);

      expect(result).toBe(true);
    });

    it('should return false when target has zero agro for character', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', { 'char-1': 0 });

      const result = hasAgro(char, target);

      expect(result).toBe(false);
    });

    it('should return false when target has negative agro for character', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', { 'char-1': -5 });

      const result = hasAgro(char, target);

      expect(result).toBe(false);
    });

    it('should return false when target has no agro entry for character', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', {});

      const result = hasAgro(char, target);

      expect(result).toBe(false);
    });

    it('should return false when target has agro for different character', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', { 'char-2': 10 });

      const result = hasAgro(char, target);

      expect(result).toBe(false);
    });

    it('should handle multiple agro entries correctly', () => {
      const char1 = createMockCharacter('char-1');
      const char2 = createMockCharacter('char-2');
      const target = createMockCharacter('target-1', {
        'char-1': 15,
        'char-2': 0,
        'char-3': -5,
      });

      expect(hasAgro(char1, target)).toBe(true);
      expect(hasAgro(char2, target)).toBe(false);
    });

    it('should handle fractional agro values', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', { 'char-1': 0.1 });

      const result = hasAgro(char, target);

      expect(result).toBe(true);
    });

    it('should handle very large agro values', () => {
      const char = createMockCharacter('char-1');
      const target = createMockCharacter('target-1', { 'char-1': 999999 });

      const result = hasAgro(char, target);

      expect(result).toBe(true);
    });
  });
});
