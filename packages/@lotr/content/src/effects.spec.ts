import { beforeEach, describe, expect, it, vi } from 'vitest';
import { effectExists, effectGet } from './effects';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Effects Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('effectGet', () => {
    it('should return effect when it exists', () => {
      const effects = {
        poison: {
          name: 'Poison',
          potency: 5,
          duration: 30,
          type: 'debuff',
          ticksEvery: 3,
        },
        heal: {
          name: 'Heal',
          potency: 10,
          duration: 1,
          type: 'buff',
        },
      };

      mockGetContentKey.mockReturnValue(effects);

      const result = effectGet('poison', 'spell-cast');

      expect(mockGetContentKey).toHaveBeenCalledWith('effectData');
      expect(result).toEqual(effects['poison']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent effect', () => {
      const effects = {
        'existing-effect': {
          name: 'Existing Effect',
          potency: 1,
        },
      };

      mockGetContentKey.mockReturnValue(effects);

      const result = effectGet('nonexistent-effect', 'test-context');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Effect:nonexistent-effect',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Effect nonexistent-effect does not exist (ctx: test-context).',
      );
    });

    it('should include context in error message', () => {
      mockGetContentKey.mockReturnValue({});

      effectGet('missing-effect', 'player-login');

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Effect:missing-effect',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: player-login');
    });

    it('should handle empty effects collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = effectGet('any-effect', 'empty-collection');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Effect:any-effect',
        expect.any(Error),
      );
    });

    it('should handle effects with complex data structures', () => {
      const complexEffect = {
        name: 'Dragon Breath',
        type: 'debuff',
        potency: 25,
        duration: 60,
        ticksEvery: 5,
        metadata: {
          damageType: 'fire',
          resistance: 'fire',
          particles: 'flame',
          sound: 'dragon-roar',
        },
        conditions: {
          canStack: false,
          maxStacks: 1,
          immuneAfter: true,
        },
        effects: [
          { type: 'damage', value: 15 },
          { type: 'burn', duration: 10 },
          { type: 'fear', chance: 0.3 },
        ],
      };

      const effects = {
        'dragon-breath': complexEffect,
      };

      mockGetContentKey.mockReturnValue(effects);

      const result = effectGet('dragon-breath', 'dragon-attack');

      expect(result).toEqual(complexEffect);
      expect((result as any).metadata.damageType).toBe('fire');
      expect((result as any).effects).toHaveLength(3);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle effects with special characters in name', () => {
      const effects = {
        'effect-with_special.chars!': {
          name: 'Special Effect',
          potency: 1,
        },
      };

      mockGetContentKey.mockReturnValue(effects);

      const result = effectGet('effect-with_special.chars!', 'special-test');

      expect(result).toEqual(effects['effect-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return the exact object reference', () => {
      const effectObject = {
        name: 'Reference Test',
        potency: 5,
      };

      const effects = { 'reference-test': effectObject };
      mockGetContentKey.mockReturnValue(effects);

      const result = effectGet('reference-test', 'reference-check');

      expect(result).toBe(effectObject); // Same reference
    });

    it('should handle various context types', () => {
      const effects = {
        'test-effect': { name: 'Test', potency: 1 },
      };

      mockGetContentKey.mockReturnValue(effects);

      const contexts = [
        'spell-cast',
        'item-use',
        'skill-activation',
        'environmental-trigger',
        'combat-start',
        'player-death',
      ];

      contexts.forEach((context) => {
        const result = effectGet('test-effect', context);
        expect(result).toEqual(effects['test-effect']);
      });

      // Test with missing effect to check context is preserved
      effectGet('missing', 'custom-context-123');

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: custom-context-123');
    });

    it('should handle null and undefined effect values', () => {
      const effects = {
        'null-effect': null,
        'undefined-effect': undefined,
        'valid-effect': { name: 'Valid' },
      };

      mockGetContentKey.mockReturnValue(effects);

      // Null effect should be treated as non-existent
      const nullResult = effectGet('null-effect', 'null-test');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Effect:null-effect',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Undefined effect should be treated as non-existent
      const undefinedResult = effectGet('undefined-effect', 'undefined-test');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Effect:undefined-effect',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Valid effect should work normally
      const validResult = effectGet('valid-effect', 'valid-test');
      expect(validResult).toEqual(effects['valid-effect']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('effectExists', () => {
    it('should return true for existing effects', () => {
      const effects = {
        regeneration: {
          name: 'Regeneration',
          potency: 3,
          duration: 60,
        },
      };

      mockGetContentKey.mockReturnValue(effects);

      expect(effectExists('regeneration')).toBe(true);
      expect(mockGetContentKey).toHaveBeenCalledWith('effectData');
    });

    it('should return false for nonexistent effects', () => {
      mockGetContentKey.mockReturnValue({});

      expect(effectExists('nonexistent-effect')).toBe(false);
    });

    it('should return false for effects with falsy values', () => {
      const effects = {
        'null-effect': null,
        'undefined-effect': undefined,
        'false-effect': false,
        'zero-effect': 0,
        'empty-string-effect': '',
        'valid-effect': { name: 'Valid' },
      };

      mockGetContentKey.mockReturnValue(effects);

      expect(effectExists('null-effect')).toBe(false);
      expect(effectExists('undefined-effect')).toBe(false);
      expect(effectExists('false-effect')).toBe(false);
      expect(effectExists('zero-effect')).toBe(false);
      expect(effectExists('empty-string-effect')).toBe(false);
      expect(effectExists('valid-effect')).toBe(true);
    });

    it('should handle empty effects collection', () => {
      mockGetContentKey.mockReturnValue({});

      expect(effectExists('any-effect')).toBe(false);
    });

    it('should be case sensitive', () => {
      const effects = {
        CamelCaseEffect: { name: 'Camel Case' },
        lowercase: { name: 'Lowercase' },
        UPPERCASE: { name: 'Uppercase' },
      };

      mockGetContentKey.mockReturnValue(effects);

      expect(effectExists('CamelCaseEffect')).toBe(true);
      expect(effectExists('camelcaseeffect')).toBe(false);
      expect(effectExists('lowercase')).toBe(true);
      expect(effectExists('LOWERCASE')).toBe(false);
      expect(effectExists('UPPERCASE')).toBe(true);
      expect(effectExists('uppercase')).toBe(false);
    });

    it('should handle various effect name formats', () => {
      const effectNames = [
        'simple-name',
        'name_with_underscores',
        'name.with.dots',
        'name-123-with-numbers',
        'special!@#$%chars',
      ];

      const effects: any = {};
      effectNames.forEach((name) => {
        effects[name] = { name: `Effect ${name}` };
      });

      mockGetContentKey.mockReturnValue(effects);

      effectNames.forEach((name) => {
        expect(effectExists(name)).toBe(true);
      });
    });

    it('should not log errors like effectGet does', () => {
      mockGetContentKey.mockReturnValue({});

      effectExists('nonexistent');

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with both functions together', () => {
      const effects = {
        poison: {
          name: 'Poison',
          type: 'debuff',
          potency: 5,
          duration: 30,
        },
        haste: {
          name: 'Haste',
          type: 'buff',
          potency: 10,
          duration: 45,
        },
        invisibility: {
          name: 'Invisibility',
          type: 'buff',
          potency: 1,
          duration: 120,
        },
      };

      mockGetContentKey.mockReturnValue(effects);

      // Test effectExists
      expect(effectExists('poison')).toBe(true);
      expect(effectExists('haste')).toBe(true);
      expect(effectExists('invisibility')).toBe(true);
      expect(effectExists('nonexistent')).toBe(false);

      // Test effectGet
      expect(effectGet('poison', 'spell')).toEqual(effects['poison']);
      expect(effectGet('haste', 'item')).toEqual(effects['haste']);
      expect(effectGet('invisibility', 'skill')).toEqual(
        effects['invisibility'],
      );

      // Only the nonexistent effect should log an error when we try to get it
      effectGet('nonexistent', 'test');
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle realistic effect scenarios', () => {
      const realisticEffects = {
        burning: {
          name: 'Burning',
          type: 'debuff',
          potency: 8,
          duration: 20,
          ticksEvery: 2,
          damageType: 'fire',
          canStack: false,
          description: 'Takes fire damage over time',
          icon: 'flame-icon',
        },
        blessed: {
          name: 'Blessed',
          type: 'buff',
          potency: 15,
          duration: 300,
          ticksEvery: 10,
          effects: {
            healing: 5,
            manaRegen: 3,
          },
          requirements: { alignment: 'good' },
          description: 'Slowly heals health and mana',
          icon: 'holy-icon',
        },
        cursed: {
          name: 'Cursed',
          type: 'debuff',
          potency: 20,
          duration: -1, // Permanent until dispelled
          effects: {
            statReduction: { luck: -10, karma: -5 },
            experiencePenalty: 0.5,
          },
          canDispel: true,
          description: 'Reduces luck and karma, halves experience gain',
          icon: 'curse-icon',
        },
      };

      mockGetContentKey.mockReturnValue(realisticEffects);

      expect(effectExists('burning')).toBe(true);
      expect(effectExists('blessed')).toBe(true);
      expect(effectExists('cursed')).toBe(true);

      const burning = effectGet('burning', 'fire-spell');
      expect((burning as any).damageType).toBe('fire');
      expect((burning as any).canStack).toBe(false);

      const blessed = effectGet('blessed', 'prayer');
      expect((blessed as any).effects.healing).toBe(5);
      expect((blessed as any).requirements.alignment).toBe('good');

      const cursed = effectGet('cursed', 'dark-magic');
      expect((cursed as any).duration).toBe(-1);
      expect((cursed as any).effects.experiencePenalty).toBe(0.5);
    });

    it('should maintain performance with large effect collections', () => {
      // Simulate a large number of effects
      const largeEffectCollection: any = {};
      for (let i = 0; i < 1000; i++) {
        largeEffectCollection[`effect-${i}`] = {
          name: `Effect ${i}`,
          potency: (i % 20) + 1,
          duration: (i % 60) + 10,
          type: i % 2 === 0 ? 'buff' : 'debuff',
        };
      }

      mockGetContentKey.mockReturnValue(largeEffectCollection);

      // Should quickly find existing effects
      expect(effectExists('effect-500')).toBe(true);
      const effect500 = effectGet('effect-500', 'performance-test');
      expect((effect500 as any).name).toBe('Effect 500');

      // Should quickly determine non-existence
      expect(effectExists('effect-9999')).toBe(false);
      const nonExistent = effectGet('effect-9999', 'performance-test');
      expect(nonExistent).toBeUndefined();

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent access patterns', () => {
      const effects = {
        'effect-1': { name: 'Effect 1', potency: 5 },
        'effect-2': { name: 'Effect 2', potency: 10 },
        'effect-3': { name: 'Effect 3', potency: 15 },
      };

      mockGetContentKey.mockReturnValue(effects);

      // Simulate concurrent access
      const results = ['effect-1', 'effect-2', 'effect-3'].map((name) => ({
        exists: effectExists(name),
        effect: effectGet(name, 'concurrent-test'),
      }));

      results.forEach((result, index) => {
        expect(result.exists).toBe(true);
        expect(result.effect).toEqual(effects[`effect-${index + 1}`]);
      });

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle consistent behavior between effectExists and effectGet', () => {
      const effects = {
        'valid-effect': { name: 'Valid', potency: 1 },
        'null-effect': null,
        'undefined-effect': undefined,
      };

      mockGetContentKey.mockReturnValue(effects);

      // For valid effect, both should succeed
      expect(effectExists('valid-effect')).toBe(true);
      expect(effectGet('valid-effect', 'consistency-test')).toEqual(
        effects['valid-effect'],
      );

      // For null effect, exists should return false, get should return null but log error
      expect(effectExists('null-effect')).toBe(false);
      const nullEffect = effectGet('null-effect', 'consistency-test');
      expect(nullEffect).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      // For undefined effect, exists should return false, get should return undefined but log error
      expect(effectExists('undefined-effect')).toBe(false);
      const undefinedEffect = effectGet('undefined-effect', 'consistency-test');
      expect(undefinedEffect).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      // For nonexistent effect, exists should return false, get should return undefined and log error
      expect(effectExists('nonexistent')).toBe(false);
      const nonExistent = effectGet('nonexistent', 'consistency-test');
      expect(nonExistent).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => effectExists('any')).toThrow();
      expect(() => effectGet('any', 'context')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => effectExists('any')).toThrow();
      expect(() => effectGet('any', 'context')).toThrow();
    });

    it('should handle empty string contexts gracefully', () => {
      const effects = { test: { name: 'Test' } };
      mockGetContentKey.mockReturnValue(effects);

      const result = effectGet('test', '');
      expect(result).toEqual(effects['test']);

      // Test with missing effect and empty context
      effectGet('missing', '');
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Effect:missing',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: ');
    });
  });
});
