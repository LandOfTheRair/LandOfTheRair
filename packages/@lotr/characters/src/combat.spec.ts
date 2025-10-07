import type { ICharacter } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { engageInCombat } from './combat';

describe('Combat Functions', () => {
  const createMockCharacter = (combatTicks = 0): ICharacter =>
    ({
      combatTicks,
    }) as unknown as ICharacter;

  describe('engageInCombat', () => {
    it('should set combat ticks to default value of 6', () => {
      const char = createMockCharacter();

      engageInCombat(char);

      expect(char.combatTicks).toBe(6);
    });

    it('should set combat ticks to specified value', () => {
      const char = createMockCharacter();

      engageInCombat(char, 10);

      expect(char.combatTicks).toBe(10);
    });

    it('should overwrite existing combat ticks', () => {
      const char = createMockCharacter(5);

      engageInCombat(char, 15);

      expect(char.combatTicks).toBe(15);
    });

    it('should handle zero combat ticks', () => {
      const char = createMockCharacter();

      engageInCombat(char, 0);

      expect(char.combatTicks).toBe(0);
    });

    it('should handle negative combat ticks', () => {
      const char = createMockCharacter();

      engageInCombat(char, -5);

      expect(char.combatTicks).toBe(-5);
    });

    it('should handle fractional combat ticks', () => {
      const char = createMockCharacter();

      engageInCombat(char, 3.5);

      expect(char.combatTicks).toBe(3.5);
    });

    it('should handle very large combat ticks', () => {
      const char = createMockCharacter();

      engageInCombat(char, 999999);

      expect(char.combatTicks).toBe(999999);
    });
  });
});
