import type { ICharacter } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';

import {
  gainCurrency,
  getCurrency,
  hasCurrency,
  loseCurrency,
} from './currency';

describe('Currency Functions', () => {
  describe('getCurrency', () => {
    const createMockCharacter = (
      currencyValues: Record<string, number>,
    ): ICharacter =>
      ({
        currency: currencyValues,
      }) as ICharacter;

    it('should return the specified currency value when it exists', () => {
      const character = createMockCharacter({ [Currency.Gold]: 100 });
      const result = getCurrency(character, Currency.Gold);
      expect(result).toBe(100);
    });

    it('should return 0 when currency does not exist', () => {
      const character = createMockCharacter({});
      const result = getCurrency(character, Currency.Gold);
      expect(result).toBe(0);
    });

    it('should return 0 when currency is null/undefined', () => {
      const character = createMockCharacter({ [Currency.Gold]: null as any });
      const result = getCurrency(character, Currency.Gold);
      expect(result).toBe(0);
    });

    it('should default to Gold currency when no currency type is specified', () => {
      const character = createMockCharacter({ [Currency.Gold]: 250 });
      const result = getCurrency(character);
      expect(result).toBe(250);
    });

    it('should work with different currency types', () => {
      const character = createMockCharacter({
        [Currency.Silver]: 50,
        [Currency.Fate]: 25,
        [Currency.Christmas]: 10,
      });

      expect(getCurrency(character, Currency.Silver)).toBe(50);
      expect(getCurrency(character, Currency.Fate)).toBe(25);
      expect(getCurrency(character, Currency.Christmas)).toBe(10);
    });

    it('should handle zero currency values', () => {
      const character = createMockCharacter({ [Currency.Gold]: 0 });
      const result = getCurrency(character, Currency.Gold);
      expect(result).toBe(0);
    });

    it('should handle negative currency values', () => {
      const character = createMockCharacter({ [Currency.Gold]: -50 });
      const result = getCurrency(character, Currency.Gold);
      expect(result).toBe(-50);
    });
  });

  describe('hasCurrency', () => {
    const createMockCharacter = (
      currencyValues: Record<string, number>,
    ): ICharacter =>
      ({
        currency: currencyValues,
      }) as ICharacter;

    it('should return true when character has enough currency', () => {
      const character = createMockCharacter({ [Currency.Gold]: 100 });
      const result = hasCurrency(character, 50, Currency.Gold);
      expect(result).toBe(true);
    });

    it('should return true when character has exactly the required amount', () => {
      const character = createMockCharacter({ [Currency.Gold]: 100 });
      const result = hasCurrency(character, 100, Currency.Gold);
      expect(result).toBe(true);
    });

    it('should return false when character does not have enough currency', () => {
      const character = createMockCharacter({ [Currency.Gold]: 50 });
      const result = hasCurrency(character, 100, Currency.Gold);
      expect(result).toBe(false);
    });

    it('should return false when currency does not exist', () => {
      const character = createMockCharacter({});
      const result = hasCurrency(character, 50, Currency.Gold);
      expect(result).toBe(false);
    });

    it('should use 0 as default when currency is null/undefined', () => {
      const character = createMockCharacter({ [Currency.Gold]: null as any });
      const result = hasCurrency(character, 50, Currency.Gold);
      expect(result).toBe(false);
    });

    it('should default to Gold currency when no currency type is specified', () => {
      const character = createMockCharacter({ [Currency.Gold]: 100 });
      const result = hasCurrency(character, 50);
      expect(result).toBe(true);
    });

    it('should work with different currency types', () => {
      const character = createMockCharacter({
        [Currency.Silver]: 100,
        [Currency.Fate]: 25,
        [Currency.Halloween]: 5,
      });

      expect(hasCurrency(character, 50, Currency.Silver)).toBe(true);
      expect(hasCurrency(character, 30, Currency.Fate)).toBe(false);
      expect(hasCurrency(character, 5, Currency.Halloween)).toBe(true);
    });

    it('should handle zero required amount', () => {
      const character = createMockCharacter({ [Currency.Gold]: 0 });
      const result = hasCurrency(character, 0, Currency.Gold);
      expect(result).toBe(true);
    });

    it('should handle negative currency values', () => {
      const character = createMockCharacter({ [Currency.Gold]: -10 });
      const result = hasCurrency(character, 5, Currency.Gold);
      expect(result).toBe(false);
    });
  });

  describe('gainCurrency', () => {
    it('should add currency to character when currency exists', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, 50, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(150);
    });

    it('should initialize currency when it does not exist', () => {
      const character = { currency: {} } as ICharacter;
      gainCurrency(character, 75, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(75);
    });

    it('should handle null/undefined existing currency', () => {
      const character = {
        currency: { [Currency.Gold]: null as any },
      } as ICharacter;
      gainCurrency(character, 50, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(50);
    });

    it('should default to Gold currency when no currency type is specified', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, 25);
      expect(character.currency[Currency.Gold]).toBe(125);
    });

    it('should work with different currency types', () => {
      const character = { currency: {} } as ICharacter;

      gainCurrency(character, 50, Currency.Silver);
      gainCurrency(character, 25, Currency.Fate);
      gainCurrency(character, 10, Currency.Christmas);

      expect(character.currency[Currency.Silver]).toBe(50);
      expect(character.currency[Currency.Fate]).toBe(25);
      expect(character.currency[Currency.Christmas]).toBe(10);
    });

    it('should handle zero currency gain', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, 0, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(100);
    });

    it('should handle negative currency gain (loss)', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, -25, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(75);
    });

    it('should not go below 0 when losing more than available', () => {
      const character = { currency: { [Currency.Gold]: 50 } } as ICharacter;
      gainCurrency(character, -100, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(0);
    });

    it('should floor the result using Math.floor', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, 25.7, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(125);
    });

    it('should return early when currency is null but not undefined (due to default parameter)', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      const originalValue = character.currency[Currency.Gold] as number;

      // null should cause early return
      gainCurrency(character, 50, null as any);
      expect(character.currency[Currency.Gold]).toBe(originalValue);

      // undefined triggers default parameter (Currency.Gold), so it should add to gold
      gainCurrency(character, 50, undefined as any);
      expect(character.currency[Currency.Gold]).toBe(originalValue + 50);
    });

    it('should handle string numbers through cleanNumber', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, '25' as any, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(125);
    });

    it('should handle NaN values through cleanNumber (defaulting to 0)', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, 'invalid' as any, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(100); // No change because cleanNumber returns 0 for NaN
    });

    it('should handle Infinity values through cleanNumber', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      gainCurrency(character, Infinity, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(100); // No change because cleanNumber returns 0 for Infinity
    });
  });

  describe('loseCurrency', () => {
    it('should subtract currency from character', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      loseCurrency(character, 25, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(75);
    });

    it('should not go below 0 when losing more than available', () => {
      const character = { currency: { [Currency.Gold]: 50 } } as ICharacter;
      loseCurrency(character, 100, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(0);
    });

    it('should default to Gold currency when no currency type is specified', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      loseCurrency(character, 30);
      expect(character.currency[Currency.Gold]).toBe(70);
    });

    it('should work with different currency types', () => {
      const character = {
        currency: {
          [Currency.Silver]: 100,
          [Currency.Fate]: 50,
          [Currency.Thanksgiving]: 20,
        },
      } as ICharacter;

      loseCurrency(character, 25, Currency.Silver);
      loseCurrency(character, 10, Currency.Fate);
      loseCurrency(character, 5, Currency.Thanksgiving);

      expect(character.currency[Currency.Silver]).toBe(75);
      expect(character.currency[Currency.Fate]).toBe(40);
      expect(character.currency[Currency.Thanksgiving]).toBe(15);
    });

    it('should handle zero currency loss', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      loseCurrency(character, 0, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(100);
    });

    it('should handle negative currency loss (which becomes a gain)', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      loseCurrency(character, -25, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(125);
    });

    it('should handle decimal amounts by flooring', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;
      loseCurrency(character, 25.7, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(74); // 100 - 25 (floored)
    });

    it('should handle currency that does not exist', () => {
      const character = { currency: {} } as ICharacter;
      loseCurrency(character, 50, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with gain and lose operations together', () => {
      const character = { currency: { [Currency.Gold]: 100 } } as ICharacter;

      gainCurrency(character, 50, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(150);

      loseCurrency(character, 25, Currency.Gold);
      expect(character.currency[Currency.Gold]).toBe(125);

      expect(hasCurrency(character, 100, Currency.Gold)).toBe(true);
      expect(hasCurrency(character, 200, Currency.Gold)).toBe(false);
    });

    it('should maintain consistency between hasCurrency and getCurrency', () => {
      const character = { currency: { [Currency.Gold]: 75 } } as ICharacter;

      const currentAmount = getCurrency(character, Currency.Gold);
      expect(hasCurrency(character, currentAmount, Currency.Gold)).toBe(true);
      expect(hasCurrency(character, currentAmount + 1, Currency.Gold)).toBe(
        false,
      );
    });

    it('should handle multiple currency types simultaneously', () => {
      const character = { currency: {} } as ICharacter;

      // Add different currencies
      gainCurrency(character, 100, Currency.Gold);
      gainCurrency(character, 50, Currency.Silver);
      gainCurrency(character, 25, Currency.Fate);

      // Check all currencies
      expect(getCurrency(character, Currency.Gold)).toBe(100);
      expect(getCurrency(character, Currency.Silver)).toBe(50);
      expect(getCurrency(character, Currency.Fate)).toBe(25);

      // Check hasCurrency for all
      expect(hasCurrency(character, 75, Currency.Gold)).toBe(true);
      expect(hasCurrency(character, 40, Currency.Silver)).toBe(true);
      expect(hasCurrency(character, 20, Currency.Fate)).toBe(true);

      // Lose some currency
      loseCurrency(character, 25, Currency.Gold);
      loseCurrency(character, 10, Currency.Silver);

      expect(getCurrency(character, Currency.Gold)).toBe(75);
      expect(getCurrency(character, Currency.Silver)).toBe(40);
      expect(getCurrency(character, Currency.Fate)).toBe(25); // Unchanged
    });
  });
});
