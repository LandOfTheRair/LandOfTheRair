import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { BuffType } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import {
  getEffect,
  getEffectLike,
  getEffectPotency,
  hasEffect,
  hasEffectLike,
} from './getters';

describe('Effect Getter Functions', () => {
  const createMockStatusEffect = (
    effectName: string,
    potency: number = 100,
  ): IStatusEffect =>
    ({
      uuid: `effect-${effectName}-uuid`,
      sourceName: 'Test Source',
      effectName,
      endsAt: Date.now() + 10000,
      effectInfo: {
        potency,
      },
    }) as IStatusEffect;

  const createMockCharacter = (
    effects: Record<string, IStatusEffect> = {},
  ): ICharacter =>
    ({
      uuid: 'char-uuid',
      name: 'Test Character',
      effects: {
        [BuffType.Buff]: [],
        [BuffType.Debuff]: [],
        [BuffType.OutgoingModifier]: [],
        [BuffType.IncomingModifier]: [],
        _hash: effects,
      },
    }) as unknown as ICharacter;

  describe('hasEffect', () => {
    it('should return true when character has the specified effect', () => {
      const effect = createMockStatusEffect('Strength Boost');
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = hasEffect(character, 'Strength Boost');

      expect(result).toBe(true);
    });

    it('should return false when character does not have the specified effect', () => {
      const character = createMockCharacter({});

      const result = hasEffect(character, 'Strength Boost');

      expect(result).toBe(false);
    });

    it('should return false when character has no effects at all', () => {
      const character = createMockCharacter();

      const result = hasEffect(character, 'Any Effect');

      expect(result).toBe(false);
    });

    it('should return false when character has null/undefined effects', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: null,
      } as any as ICharacter;

      const result = hasEffect(character, 'Any Effect');

      expect(result).toBe(false);
    });

    it('should return false when character has no _hash property', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: {
          [BuffType.Buff]: [],
          [BuffType.Debuff]: [],
          [BuffType.OutgoingModifier]: [],
          [BuffType.IncomingModifier]: [],
        },
      } as any as ICharacter;

      const result = hasEffect(character, 'Any Effect');

      expect(result).toBe(false);
    });

    it('should handle empty effect name', () => {
      const effect = createMockStatusEffect('Test Effect');
      const character = createMockCharacter({ 'Test Effect': effect });

      const result = hasEffect(character, '');

      expect(result).toBe(false);
    });

    it('should be case sensitive', () => {
      const effect = createMockStatusEffect('Strength Boost');
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = hasEffect(character, 'strength boost');

      expect(result).toBe(false);
    });
  });

  describe('hasEffectLike', () => {
    it('should return true when character has an effect that includes the search string', () => {
      const effect = createMockStatusEffect('Strength Boost Magic');
      const character = createMockCharacter({ 'Strength Boost Magic': effect });

      const result = hasEffectLike(character, 'Boost');

      expect(result).toBe(true);
    });

    it('should return true when multiple effects match the search string', () => {
      const effect1 = createMockStatusEffect('Fire Boost');
      const effect2 = createMockStatusEffect('Ice Boost');
      const character = createMockCharacter({
        'Fire Boost': effect1,
        'Ice Boost': effect2,
      });

      const result = hasEffectLike(character, 'Boost');

      expect(result).toBe(true);
    });

    it('should return false when no effects match the search string', () => {
      const effect = createMockStatusEffect('Strength Buff');
      const character = createMockCharacter({ 'Strength Buff': effect });

      const result = hasEffectLike(character, 'Boost');

      expect(result).toBe(false);
    });

    it('should return false when character has no effects', () => {
      const character = createMockCharacter({});

      const result = hasEffectLike(character, 'Boost');

      expect(result).toBe(false);
    });

    it('should return false when character has null/undefined effects', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: null,
      } as any as ICharacter;

      const result = hasEffectLike(character, 'Boost');

      expect(result).toBe(false);
    });

    it('should return false when character has no _hash property', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: {
          [BuffType.Buff]: [],
          [BuffType.Debuff]: [],
          [BuffType.OutgoingModifier]: [],
          [BuffType.IncomingModifier]: [],
        },
      } as any as ICharacter;

      const result = hasEffectLike(character, 'Boost');

      expect(result).toBe(false);
    });

    it('should handle empty search string', () => {
      const effect = createMockStatusEffect('Test Effect');
      const character = createMockCharacter({ 'Test Effect': effect });

      const result = hasEffectLike(character, '');

      expect(result).toBe(true); // Empty string is included in all strings
    });

    it('should be case sensitive', () => {
      const effect = createMockStatusEffect('Strength Boost');
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = hasEffectLike(character, 'boost');

      expect(result).toBe(false);
    });

    it('should handle partial matches correctly', () => {
      const effect = createMockStatusEffect('Magic Resistance Aura');
      const character = createMockCharacter({
        'Magic Resistance Aura': effect,
      });

      expect(hasEffectLike(character, 'Magic')).toBe(true);
      expect(hasEffectLike(character, 'Resistance')).toBe(true);
      expect(hasEffectLike(character, 'Aura')).toBe(true);
      expect(hasEffectLike(character, 'Fire')).toBe(false);
    });
  });

  describe('getEffect', () => {
    it('should return the effect when character has the specified effect', () => {
      const effect = createMockStatusEffect('Strength Boost', 150);
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = getEffect(character, 'Strength Boost');

      expect(result).toBe(effect);
      expect(result.effectName).toBe('Strength Boost');
      expect(result.effectInfo.potency).toBe(150);
    });

    it('should return undefined when character does not have the specified effect', () => {
      const character = createMockCharacter({});

      const result = getEffect(character, 'Strength Boost');

      expect(result).toBeUndefined();
    });

    it('should return undefined when character has null/undefined effects', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: null,
      } as any as ICharacter;

      const result = getEffect(character, 'Any Effect');

      expect(result).toBeUndefined();
    });

    it('should return undefined when character has no _hash property', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: {
          [BuffType.Buff]: [],
          [BuffType.Debuff]: [],
          [BuffType.OutgoingModifier]: [],
          [BuffType.IncomingModifier]: [],
        },
      } as any as ICharacter;

      const result = getEffect(character, 'Any Effect');

      expect(result).toBeUndefined();
    });

    it('should handle empty effect name', () => {
      const effect = createMockStatusEffect('Test Effect');
      const character = createMockCharacter({ 'Test Effect': effect });

      const result = getEffect(character, '');

      expect(result).toBeUndefined();
    });

    it('should be case sensitive', () => {
      const effect = createMockStatusEffect('Strength Boost');
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = getEffect(character, 'strength boost');

      expect(result).toBeUndefined();
    });

    it('should return the correct effect when multiple effects exist', () => {
      const effect1 = createMockStatusEffect('Fire Boost', 100);
      const effect2 = createMockStatusEffect('Ice Boost', 200);
      const character = createMockCharacter({
        'Fire Boost': effect1,
        'Ice Boost': effect2,
      });

      const fireResult = getEffect(character, 'Fire Boost');
      const iceResult = getEffect(character, 'Ice Boost');

      expect(fireResult).toBe(effect1);
      expect(iceResult).toBe(effect2);
      expect(fireResult.effectInfo.potency).toBe(100);
      expect(iceResult.effectInfo.potency).toBe(200);
    });
  });

  describe('getEffectLike', () => {
    it('should return array with matching effects', () => {
      const effect1 = createMockStatusEffect('Fire Boost', 100);
      const effect2 = createMockStatusEffect('Ice Boost', 200);
      const character = createMockCharacter({
        'Fire Boost': effect1,
        'Ice Boost': effect2,
      });

      const result = getEffectLike(character, 'Boost');

      expect(result).toHaveLength(2);
      expect(result).toContain(effect1);
      expect(result).toContain(effect2);
    });

    it('should return array with single effect when only one matches', () => {
      const effect1 = createMockStatusEffect('Fire Boost', 100);
      const effect2 = createMockStatusEffect('Ice Shield', 200);
      const character = createMockCharacter({
        'Fire Boost': effect1,
        'Ice Shield': effect2,
      });

      const result = getEffectLike(character, 'Boost');

      expect(result).toHaveLength(1);
      expect(result).toContain(effect1);
      expect(result).not.toContain(effect2);
    });

    it('should return empty array when no effects match', () => {
      const effect = createMockStatusEffect('Strength Buff', 100);
      const character = createMockCharacter({ 'Strength Buff': effect });

      const result = getEffectLike(character, 'Boost');

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when character has no effects', () => {
      const character = createMockCharacter({});

      const result = getEffectLike(character, 'Boost');

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when character has null/undefined effects', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: null,
      } as any as ICharacter;

      const result = getEffectLike(character, 'Boost');

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when character has no _hash property', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: {
          [BuffType.Buff]: [],
          [BuffType.Debuff]: [],
          [BuffType.OutgoingModifier]: [],
          [BuffType.IncomingModifier]: [],
        },
      } as any as ICharacter;

      const result = getEffectLike(character, 'Boost');

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty search string by returning all effects', () => {
      const effect1 = createMockStatusEffect('Effect One');
      const effect2 = createMockStatusEffect('Effect Two');
      const character = createMockCharacter({
        'Effect One': effect1,
        'Effect Two': effect2,
      });

      const result = getEffectLike(character, '');

      expect(result).toHaveLength(2);
      expect(result).toContain(effect1);
      expect(result).toContain(effect2);
    });

    it('should be case sensitive', () => {
      const effect = createMockStatusEffect('Strength Boost');
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = getEffectLike(character, 'boost');

      expect(result).toHaveLength(0);
    });

    it('should handle partial matches correctly', () => {
      const effect1 = createMockStatusEffect('Magic Resistance');
      const effect2 = createMockStatusEffect('Fire Resistance');
      const effect3 = createMockStatusEffect('Magic Shield');
      const character = createMockCharacter({
        'Magic Resistance': effect1,
        'Fire Resistance': effect2,
        'Magic Shield': effect3,
      });

      const resistanceResult = getEffectLike(character, 'Resistance');
      const magicResult = getEffectLike(character, 'Magic');

      expect(resistanceResult).toHaveLength(2);
      expect(resistanceResult).toContain(effect1);
      expect(resistanceResult).toContain(effect2);

      expect(magicResult).toHaveLength(2);
      expect(magicResult).toContain(effect1);
      expect(magicResult).toContain(effect3);
    });
  });

  describe('getEffectPotency', () => {
    it('should return the potency of the specified effect', () => {
      const effect = createMockStatusEffect('Strength Boost', 150);
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = getEffectPotency(character, 'Strength Boost');

      expect(result).toBe(150);
    });

    it('should return 0 when effect does not exist', () => {
      const character = createMockCharacter({});

      const result = getEffectPotency(character, 'Nonexistent Effect');

      expect(result).toBe(0);
    });

    it('should return 0 when character has null/undefined effects', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: null,
      } as any as ICharacter;

      const result = getEffectPotency(character, 'Any Effect');

      expect(result).toBe(0);
    });

    it('should return 0 when character has no _hash property', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: {
          [BuffType.Buff]: [],
          [BuffType.Debuff]: [],
          [BuffType.OutgoingModifier]: [],
          [BuffType.IncomingModifier]: [],
        },
      } as any as ICharacter;

      const result = getEffectPotency(character, 'Any Effect');

      expect(result).toBe(0);
    });

    it('should return 0 when effect exists but has no potency', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Test Effect',
        endsAt: Date.now() + 10000,
        effectInfo: {}, // No potency property
      } as IStatusEffect;
      const character = createMockCharacter({ 'Test Effect': effect });

      const result = getEffectPotency(character, 'Test Effect');

      expect(result).toBe(0);
    });

    it('should return 0 when effect exists but potency is null', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Test Effect',
        endsAt: Date.now() + 10000,
        effectInfo: { potency: null as any },
      } as IStatusEffect;
      const character = createMockCharacter({ 'Test Effect': effect });

      const result = getEffectPotency(character, 'Test Effect');

      expect(result).toBe(0);
    });

    it('should return 0 when effect exists but potency is undefined', () => {
      const effect: IStatusEffect = {
        uuid: 'test-uuid',
        sourceName: 'Test Source',
        effectName: 'Test Effect',
        endsAt: Date.now() + 10000,
        effectInfo: { potency: undefined as any },
      } as IStatusEffect;
      const character = createMockCharacter({ 'Test Effect': effect });

      const result = getEffectPotency(character, 'Test Effect');

      expect(result).toBe(0);
    });

    it('should handle zero potency correctly', () => {
      const effect = createMockStatusEffect('Zero Potency Effect', 0);
      const character = createMockCharacter({ 'Zero Potency Effect': effect });

      const result = getEffectPotency(character, 'Zero Potency Effect');

      expect(result).toBe(0);
    });

    it('should handle negative potency values', () => {
      const effect = createMockStatusEffect('Debuff Effect', -50);
      const character = createMockCharacter({ 'Debuff Effect': effect });

      const result = getEffectPotency(character, 'Debuff Effect');

      expect(result).toBe(-50);
    });

    it('should handle fractional potency values', () => {
      const effect = createMockStatusEffect('Fractional Effect', 123.45);
      const character = createMockCharacter({ 'Fractional Effect': effect });

      const result = getEffectPotency(character, 'Fractional Effect');

      expect(result).toBe(123.45);
    });

    it('should be case sensitive', () => {
      const effect = createMockStatusEffect('Strength Boost', 150);
      const character = createMockCharacter({ 'Strength Boost': effect });

      const result = getEffectPotency(character, 'strength boost');

      expect(result).toBe(0);
    });

    it('should return correct potency when multiple effects exist', () => {
      const effect1 = createMockStatusEffect('Fire Boost', 100);
      const effect2 = createMockStatusEffect('Ice Boost', 200);
      const character = createMockCharacter({
        'Fire Boost': effect1,
        'Ice Boost': effect2,
      });

      const fireResult = getEffectPotency(character, 'Fire Boost');
      const iceResult = getEffectPotency(character, 'Ice Boost');

      expect(fireResult).toBe(100);
      expect(iceResult).toBe(200);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with complex effect scenarios', () => {
      const strengthBoost = createMockStatusEffect('Strength Boost', 150);
      const magicResistance = createMockStatusEffect('Magic Resistance', 75);
      const fireProtection = createMockStatusEffect('Fire Protection', 50);
      const character = createMockCharacter({
        'Strength Boost': strengthBoost,
        'Magic Resistance': magicResistance,
        'Fire Protection': fireProtection,
      });

      // Test hasEffect
      expect(hasEffect(character, 'Strength Boost')).toBe(true);
      expect(hasEffect(character, 'Ice Shield')).toBe(false);

      // Test hasEffectLike
      expect(hasEffectLike(character, 'Resistance')).toBe(true);
      expect(hasEffectLike(character, 'Protection')).toBe(true);
      expect(hasEffectLike(character, 'Shield')).toBe(false);

      // Test getEffect
      expect(getEffect(character, 'Magic Resistance')).toBe(magicResistance);
      expect(getEffect(character, 'Nonexistent')).toBeUndefined();

      // Test getEffectLike
      const boostEffects = getEffectLike(character, 'Boost');
      const protectionEffects = getEffectLike(character, 'Protection');

      expect(boostEffects).toHaveLength(1);
      expect(boostEffects[0]).toBe(strengthBoost);
      expect(protectionEffects).toHaveLength(1);
      expect(protectionEffects[0]).toBe(fireProtection);

      // Test getEffectPotency
      expect(getEffectPotency(character, 'Strength Boost')).toBe(150);
      expect(getEffectPotency(character, 'Magic Resistance')).toBe(75);
      expect(getEffectPotency(character, 'Fire Protection')).toBe(50);
      expect(getEffectPotency(character, 'Nonexistent')).toBe(0);
    });

    it('should handle edge cases consistently across all functions', () => {
      const character = {
        uuid: 'test',
        name: 'Test',
        effects: null,
      } as any as ICharacter;

      expect(hasEffect(character, 'Test')).toBe(false);
      expect(hasEffectLike(character, 'Test')).toBe(false);
      expect(getEffect(character, 'Test')).toBeUndefined();
      expect(getEffectLike(character, 'Test')).toEqual([]);
      expect(getEffectPotency(character, 'Test')).toBe(0);
    });
  });
});
