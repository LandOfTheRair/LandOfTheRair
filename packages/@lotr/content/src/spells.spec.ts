import { beforeEach, describe, expect, it, vi } from 'vitest';
import { spellGet, spellGetAll } from './spells';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Spells Functions', () => {
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

  describe('spellGetAll', () => {
    it('should return all spells from content', () => {
      const spells = {
        fireball: {
          name: 'Fireball',
          mpCost: 15,
          level: 5,
          damage: { min: 20, max: 40 },
          element: 'fire',
        },
        heal: {
          name: 'Heal',
          mpCost: 10,
          level: 1,
          healing: { min: 15, max: 25 },
          element: 'light',
        },
      };

      mockGetContentKey.mockReturnValue(spells);

      const result = spellGetAll();

      expect(mockGetContentKey).toHaveBeenCalledWith('spells');
      expect(result).toEqual(spells);
    });

    it('should return empty object when no spells exist', () => {
      mockGetContentKey.mockReturnValue({});

      const result = spellGetAll();

      expect(result).toEqual({});
    });

    it('should call getContentKey with correct parameter', () => {
      mockGetContentKey.mockReturnValue({});

      spellGetAll();

      expect(mockGetContentKey).toHaveBeenCalledWith('spells');
      expect(mockGetContentKey).toHaveBeenCalledTimes(1);
    });

    it('should return the exact object reference from getContentKey', () => {
      const spellsObject = {
        'magic-missile': {
          name: 'Magic Missile',
          mpCost: 5,
          level: 1,
        },
      };

      mockGetContentKey.mockReturnValue(spellsObject);

      const result = spellGetAll();

      expect(result).toBe(spellsObject); // Same reference
    });

    it('should handle complex spell data structures', () => {
      const complexSpells = {
        meteor: {
          name: 'Meteor',
          description: 'Summons a meteor from the sky',
          mpCost: 50,
          level: 20,
          castTime: 5000,
          cooldown: 30000,
          range: 10,
          areaOfEffect: 3,
          element: 'fire',
          damage: { min: 100, max: 200 },
          effects: [
            { type: 'burn', duration: 10, potency: 5 },
            { type: 'knockback', strength: 3 },
          ],
          requirements: {
            stats: { intelligence: 25 },
            skills: { magic: 80 },
            reagents: ['sulfur', 'star-dust'],
          },
          animation: 'meteor-cast',
          sound: 'meteor-impact',
          particles: 'fire-explosion',
        },
      };

      mockGetContentKey.mockReturnValue(complexSpells);

      const result = spellGetAll();

      expect(result).toEqual(complexSpells);
      expect((result as any)['meteor'].requirements.reagents).toContain(
        'sulfur',
      );
      expect((result as any)['meteor'].effects).toHaveLength(2);
    });
  });

  describe('spellGet', () => {
    it('should return spell when it exists', () => {
      const spells = {
        'lightning-bolt': {
          name: 'Lightning Bolt',
          mpCost: 25,
          level: 10,
          damage: { min: 30, max: 60 },
          element: 'lightning',
          castTime: 1500,
        },
      };

      mockGetContentKey.mockReturnValue(spells);

      const result = spellGet('lightning-bolt', 'spell-cast');

      expect(mockGetContentKey).toHaveBeenCalledWith('spells');
      expect(result).toEqual(spells['lightning-bolt']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent spell', () => {
      const spells = {
        'existing-spell': {
          name: 'Existing Spell',
          mpCost: 5,
        },
      };

      mockGetContentKey.mockReturnValue(spells);

      const result = spellGet('nonexistent-spell', 'test-context');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spell:nonexistent-spell',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Spell nonexistent-spell does not exist (ctx: test-context).',
      );
    });

    it('should include context in error message', () => {
      mockGetContentKey.mockReturnValue({});

      spellGet('missing-spell', 'player-combat');

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spell:missing-spell',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: player-combat');
    });

    it('should handle empty spells collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = spellGet('any-spell', 'empty-collection');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spell:any-spell',
        expect.any(Error),
      );
    });

    it('should return the exact object reference', () => {
      const spellObject = {
        name: 'Reference Test',
        mpCost: 1,
      };

      const spells = { 'reference-test': spellObject };
      mockGetContentKey.mockReturnValue(spells);

      const result = spellGet('reference-test', 'reference-check');

      expect(result).toBe(spellObject); // Same reference
    });

    it('should handle spells with special characters in name', () => {
      const spells = {
        'spell-with_special.chars!': {
          name: 'Special Spell',
          mpCost: 10,
        },
      };

      mockGetContentKey.mockReturnValue(spells);

      const result = spellGet('spell-with_special.chars!', 'special-test');

      expect(result).toEqual(spells['spell-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle various context types', () => {
      const spells = {
        'test-spell': { name: 'Test', mpCost: 1 },
      };

      mockGetContentKey.mockReturnValue(spells);

      const contexts = [
        'combat-action',
        'skill-learning',
        'item-enchantment',
        'npc-cast',
        'scroll-use',
        'wand-activation',
      ];

      contexts.forEach((context) => {
        const result = spellGet('test-spell', context);
        expect(result).toEqual(spells['test-spell']);
      });

      // Test with missing spell to check context is preserved
      spellGet('missing', 'custom-context-456');

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: custom-context-456');
    });

    it('should handle null and undefined spell values', () => {
      const spells = {
        'null-spell': null,
        'undefined-spell': undefined,
        'valid-spell': { name: 'Valid' },
      };

      mockGetContentKey.mockReturnValue(spells);

      // Null spell should be treated as non-existent
      const nullResult = spellGet('null-spell', 'null-test');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spell:null-spell',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Undefined spell should be treated as non-existent
      const undefinedResult = spellGet('undefined-spell', 'undefined-test');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spell:undefined-spell',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Valid spell should work normally
      const validResult = spellGet('valid-spell', 'valid-test');
      expect(validResult).toEqual(spells['valid-spell']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should use spellGetAll internally', () => {
      const spells = {
        'internal-test': { name: 'Internal Test', mpCost: 5 },
      };

      mockGetContentKey.mockReturnValue(spells);

      // Call spellGet which should internally call spellGetAll
      const result = spellGet('internal-test', 'internal-check');

      expect(result).toEqual(spells['internal-test']);
      expect(mockGetContentKey).toHaveBeenCalledWith('spells');
      expect(mockGetContentKey).toHaveBeenCalledTimes(1);
    });

    it('should handle complex spell retrieval scenarios', () => {
      const complexSpell = {
        name: 'Arcane Orb',
        description: 'A slow-moving orb of pure magical energy',
        mpCost: 35,
        level: 15,
        castTime: 2000,
        projectileSpeed: 2,
        piercing: true,
        damage: { min: 50, max: 80 },
        element: 'arcane',
        effects: [
          { type: 'mana-burn', percentage: 0.2 },
          { type: 'silence', duration: 3, chance: 0.15 },
        ],
        upgrades: {
          'Improved Orb': { damage: 1.5, mpCost: 1.2 },
          'Piercing Orb': { piercing: 2, damage: 0.8 },
        },
        requirements: {
          stats: { intelligence: 20, wisdom: 15 },
          skills: { magic: 60, concentration: 40 },
        },
      };

      const spells = {
        'arcane-orb': complexSpell,
      };

      mockGetContentKey.mockReturnValue(spells);

      const result = spellGet('arcane-orb', 'mage-combat');

      expect(result).toEqual(complexSpell);
      expect((result as any).upgrades['Improved Orb'].damage).toBe(1.5);
      expect((result as any).effects[0].type).toBe('mana-burn');
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with both functions together', () => {
      const spells = {
        heal: {
          name: 'Heal',
          mpCost: 10,
          level: 1,
          healing: { min: 15, max: 25 },
        },
        fireball: {
          name: 'Fireball',
          mpCost: 15,
          level: 5,
          damage: { min: 20, max: 40 },
        },
        teleport: {
          name: 'Teleport',
          mpCost: 25,
          level: 8,
          range: 20,
        },
      };

      mockGetContentKey.mockReturnValue(spells);

      // Test spellGetAll
      const allSpells = spellGetAll();
      expect(allSpells).toEqual(spells);

      // Test spellGet for each spell
      expect(spellGet('heal', 'healing')).toEqual(spells['heal']);
      expect(spellGet('fireball', 'combat')).toEqual(spells['fireball']);
      expect(spellGet('teleport', 'movement')).toEqual(spells['teleport']);

      // Only the nonexistent spell should log an error when we try to get it
      spellGet('nonexistent', 'test');
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle realistic spell scenarios', () => {
      const realisticSpells = {
        'magic-missile': {
          name: 'Magic Missile',
          description: 'Unerring bolts of magical force',
          mpCost: 8,
          level: 1,
          castTime: 1000,
          missiles: 3,
          damage: { min: 5, max: 8 },
          element: 'force',
          autoHit: true,
          school: 'evocation',
        },
        'summon-familiar': {
          name: 'Summon Familiar',
          description: 'Calls a magical creature to aid you',
          mpCost: 30,
          level: 3,
          castTime: 3000,
          duration: 600000, // 10 minutes
          summon: {
            creature: 'familiar',
            health: 25,
            damage: 3,
            abilities: ['scout', 'deliver-items'],
          },
          school: 'conjuration',
        },
        'time-stop': {
          name: 'Time Stop',
          description: 'Freezes time for a brief moment',
          mpCost: 100,
          level: 25,
          castTime: 5000,
          duration: 3000,
          area: 'global',
          effects: [
            { type: 'freeze-time', excludeSelf: true },
            { type: 'extra-actions', count: 3 },
          ],
          school: 'transmutation',
          legendary: true,
        },
      };

      mockGetContentKey.mockReturnValue(realisticSpells);

      const magicMissile = spellGet('magic-missile', 'novice-combat');
      expect((magicMissile as any).autoHit).toBe(true);
      expect((magicMissile as any).missiles).toBe(3);

      const familiar = spellGet('summon-familiar', 'exploration');
      expect((familiar as any).summon.abilities).toContain('scout');
      expect((familiar as any).duration).toBe(600000);

      const timeStop = spellGet('time-stop', 'epic-battle');
      expect((timeStop as any).legendary).toBe(true);
      expect((timeStop as any).effects).toHaveLength(2);
    });

    it('should maintain performance with large spell collections', () => {
      // Simulate a large spell database
      const largeSpellCollection: any = {};
      for (let i = 0; i < 800; i++) {
        largeSpellCollection[`spell-${i}`] = {
          name: `Spell ${i}`,
          mpCost: (i % 50) + 5,
          level: Math.floor(i / 20) + 1,
          damage: { min: i % 30, max: (i % 30) + 10 },
        };
      }

      mockGetContentKey.mockReturnValue(largeSpellCollection);

      // Should quickly find existing spells
      const allSpells = spellGetAll();
      expect(Object.keys(allSpells)).toHaveLength(800);

      const spell400 = spellGet('spell-400', 'performance-test');
      expect((spell400 as any).name).toBe('Spell 400');

      // Should quickly determine non-existence
      const nonExistent = spellGet('spell-9999', 'performance-test');
      expect(nonExistent).toBeUndefined();

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent access patterns', () => {
      const spells = {
        'spell-1': { name: 'Spell 1', mpCost: 5 },
        'spell-2': { name: 'Spell 2', mpCost: 10 },
        'spell-3': { name: 'Spell 3', mpCost: 15 },
      };

      mockGetContentKey.mockReturnValue(spells);

      // Simulate concurrent access
      const results = ['spell-1', 'spell-2', 'spell-3'].map((name) => ({
        fromGetAll: spellGetAll()[name],
        fromGet: spellGet(name, 'concurrent-test'),
      }));

      results.forEach((result, index) => {
        const expectedSpell = spells[`spell-${index + 1}`];
        expect(result.fromGetAll).toEqual(expectedSpell);
        expect(result.fromGet).toEqual(expectedSpell);
      });

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle spell collections by school/category', () => {
      const spellsBySchool = {
        fireball: { name: 'Fireball', school: 'evocation', element: 'fire' },
        heal: { name: 'Heal', school: 'restoration', element: 'light' },
        'charm-person': {
          name: 'Charm Person',
          school: 'enchantment',
          target: 'humanoid',
        },
        'detect-magic': {
          name: 'Detect Magic',
          school: 'divination',
          range: 60,
        },
        'mage-armor': {
          name: 'Mage Armor',
          school: 'abjuration',
          duration: 28800,
        },
      };

      mockGetContentKey.mockReturnValue(spellsBySchool);

      const allSpells = spellGetAll();

      // Verify each school is represented
      const schools = Object.values(allSpells).map(
        (spell: any) => spell.school,
      );
      expect(schools).toContain('evocation');
      expect(schools).toContain('restoration');
      expect(schools).toContain('enchantment');
      expect(schools).toContain('divination');
      expect(schools).toContain('abjuration');

      // Test specific spell retrieval
      const fireball = spellGet('fireball', 'evocation-test');
      expect((fireball as any).school).toBe('evocation');
      expect((fireball as any).element).toBe('fire');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(spellGetAll()).toBeNull();
      expect(() => spellGet('any', 'context')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(spellGetAll()).toBeUndefined();
      expect(() => spellGet('any', 'context')).toThrow();
    });

    it('should handle empty string contexts gracefully', () => {
      const spells = { test: { name: 'Test' } };
      mockGetContentKey.mockReturnValue(spells);

      const result = spellGet('test', '');
      expect(result).toEqual(spells['test']);

      // Test with missing spell and empty context
      spellGet('missing', '');
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spell:missing',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain('ctx: ');
    });

    it('should handle special characters in context', () => {
      const spells = {};
      mockGetContentKey.mockReturnValue(spells);

      const specialContexts = [
        'context-with-dashes',
        'context_with_underscores',
        'context.with.dots',
        'context with spaces',
        'context!@#$%^&*()',
        'context123numbers',
      ];

      specialContexts.forEach((context) => {
        spellGet('missing-spell', context);

        const errorCall =
          mockLogErrorWithContext.mock.calls[
            mockLogErrorWithContext.mock.calls.length - 1
          ];
        expect(errorCall[1].message).toContain(`ctx: ${context}`);
      });

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(
        specialContexts.length,
      );
    });
  });
});
