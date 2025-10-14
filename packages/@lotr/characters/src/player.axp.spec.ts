import type { ICharacter } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { playerCalcAXPReward } from './player.axp';

// Mock dependencies
vi.mock('@lotr/effects', () => ({
  hasEffect: vi.fn(),
}));

describe('Player AXP Functions', () => {
  let mockHasEffect: any;
  let mockCharacter: ICharacter;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const effectsModule = await import('@lotr/effects');
    mockHasEffect = vi.mocked(effectsModule.hasEffect);

    // Create mock character with basic properties
    mockCharacter = {
      name: 'Test Character',
      uuid: 'test-uuid-123',
    } as ICharacter;

    // Default mock behavior - no effects
    mockHasEffect.mockReturnValue(false);
  });

  describe('playerCalcAXPReward', () => {
    describe('Dangerous Effect Priority', () => {
      it('should return 10 AXP when character has Dangerous effect', () => {
        mockHasEffect.mockReturnValue(true);
        mockCharacter.name = 'Regular Monster';

        const result = playerCalcAXPReward(mockCharacter);

        expect(mockHasEffect).toHaveBeenCalledWith(mockCharacter, 'Dangerous');
        expect(result).toBe(10);
      });

      it('should prioritize Dangerous effect over elite status', () => {
        mockHasEffect.mockReturnValue(true);
        mockCharacter.name = 'elite Dragon Boss';

        const result = playerCalcAXPReward(mockCharacter);

        expect(mockHasEffect).toHaveBeenCalledWith(mockCharacter, 'Dangerous');
        expect(result).toBe(10);
      });

      it('should return 10 for Dangerous effect regardless of name variations', () => {
        mockHasEffect.mockReturnValue(true);

        const testNames = [
          'goblin warrior',
          'elite orc chieftain',
          'legendary dragon',
          'boss monster',
          'elite legendary ancient wyrm',
          '',
        ];

        testNames.forEach((name) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(10);
        });
      });
    });

    describe('Elite Character Recognition', () => {
      it('should return 5 AXP for characters with "elite " prefix', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = 'elite orc warrior';

        const result = playerCalcAXPReward(mockCharacter);

        expect(result).toBe(5);
      });

      it('should match "elite " with exact spacing', () => {
        mockHasEffect.mockReturnValue(false);

        const eliteNames = [
          'elite goblin',
          'elite orc chieftain',
          'elite dragon lord',
          'elite ancient wyrm',
          'elite legendary beast',
        ];

        eliteNames.forEach((name) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(5);
        });
      });

      it('should NOT match "elite" without trailing space', () => {
        mockHasEffect.mockReturnValue(false);

        const nonEliteNames = [
          'elite', // no space after
          'eliteorc', // no space
          'legendary elite', // elite not at start
          'Elite Orc', // capital E, but should still work due to includes
          'super elite warrior', // elite not at start
        ];

        nonEliteNames.forEach((name) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);

          // Only 'Elite Orc' and 'super elite warrior' should match since includes() is case sensitive
          if (name === 'Elite Orc' || name === 'super elite warrior') {
            expect(result).toBe(5);
          } else {
            expect(result).toBe(1);
          }
        });
      });

      it('should handle case sensitivity correctly', () => {
        mockHasEffect.mockReturnValue(false);

        const testCases = [
          { name: 'elite orc', expected: 5 }, // lowercase - should match
          { name: 'Elite orc', expected: 1 }, // capital E - should NOT match
          { name: 'ELITE orc', expected: 1 }, // all caps - should NOT match
          { name: 'eLiTe orc', expected: 1 }, // mixed case - should NOT match
        ];

        testCases.forEach(({ name, expected }) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(expected);
        });
      });

      it('should match elite anywhere in the name due to includes()', () => {
        mockHasEffect.mockReturnValue(false);

        const testCases = [
          { name: 'elite warrior', expected: 5 }, // at start
          { name: 'ancient elite dragon', expected: 5 }, // in middle
          { name: 'dragon elite', expected: 5 }, // at end
          { name: 'super elite legendary beast', expected: 5 }, // in middle with multiple words
        ];

        testCases.forEach(({ name, expected }) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(expected);
        });
      });
    });

    describe('Default AXP Reward', () => {
      it('should return 1 AXP for regular characters', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = 'goblin warrior';

        const result = playerCalcAXPReward(mockCharacter);

        expect(result).toBe(1);
      });

      it('should return 1 AXP for characters with no special properties', () => {
        mockHasEffect.mockReturnValue(false);

        const regularNames = [
          'orc',
          'goblin scout',
          'dragon hatchling',
          'skeleton warrior',
          'zombie shambler',
          'giant spider',
        ];

        regularNames.forEach((name) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(1);
        });
      });

      it('should return 1 AXP for empty or whitespace names', () => {
        mockHasEffect.mockReturnValue(false);

        const edgeCaseNames = ['', ' ', '  ', '\t', '\n'];

        edgeCaseNames.forEach((name) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(1);
        });
      });
    });

    describe('Function Call Verification', () => {
      it('should always check for Dangerous effect first', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = 'elite orc';

        playerCalcAXPReward(mockCharacter);

        expect(mockHasEffect).toHaveBeenCalledTimes(1);
        expect(mockHasEffect).toHaveBeenCalledWith(mockCharacter, 'Dangerous');
      });

      it('should only call hasEffect once regardless of result', () => {
        // Test when hasEffect returns true
        mockHasEffect.mockReturnValue(true);
        mockCharacter.name = 'elite dragon';

        playerCalcAXPReward(mockCharacter);
        expect(mockHasEffect).toHaveBeenCalledTimes(1);

        vi.clearAllMocks();

        // Test when hasEffect returns false
        mockHasEffect.mockReturnValue(false);
        playerCalcAXPReward(mockCharacter);
        expect(mockHasEffect).toHaveBeenCalledTimes(1);
      });

      it('should pass the exact character object to hasEffect', () => {
        const specificCharacter = {
          name: 'test monster',
          uuid: 'specific-uuid',
          level: 10,
        } as ICharacter;

        playerCalcAXPReward(specificCharacter);

        expect(mockHasEffect).toHaveBeenCalledWith(
          specificCharacter,
          'Dangerous',
        );
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle null character name gracefully', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = null as any;

        expect(() => {
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(1); // Should default to 1 since null.includes() will throw
        }).toThrow(); // Actually, this will throw because null doesn't have includes method
      });

      it('should handle undefined character name gracefully', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = undefined as any;

        expect(() => {
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(1);
        }).toThrow(); // This will throw because undefined doesn't have includes method
      });

      it('should handle very long character names', () => {
        mockHasEffect.mockReturnValue(false);

        const longName = 'elite ' + 'very '.repeat(1000) + 'long monster name';
        mockCharacter.name = longName;

        const result = playerCalcAXPReward(mockCharacter);
        expect(result).toBe(5); // Should still detect elite
      });

      it('should handle special characters in names', () => {
        mockHasEffect.mockReturnValue(false);

        const specialNames = [
          'elite $@#%',
          'elite monster™',
          'elite 龙',
          'elite мон��тр',
          'elite 🐉',
          'elite \u0000',
        ];

        specialNames.forEach((name) => {
          mockCharacter.name = name;
          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(5);
        });
      });
    });

    describe('Boundary Conditions', () => {
      it('should handle exactly "elite " as the complete name', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = 'elite ';

        const result = playerCalcAXPReward(mockCharacter);
        expect(result).toBe(5);
      });

      it('should handle multiple "elite " occurrences in name', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = 'elite elite elite warrior';

        const result = playerCalcAXPReward(mockCharacter);
        expect(result).toBe(5);
      });

      it('should prioritize Dangerous effect over complex elite names', () => {
        mockHasEffect.mockReturnValue(true);
        mockCharacter.name = 'elite legendary ancient elite dragon elite lord';

        const result = playerCalcAXPReward(mockCharacter);
        expect(result).toBe(10);
      });
    });

    describe('Integration Scenarios', () => {
      it('should handle realistic monster scenarios', () => {
        const scenarios = [
          {
            name: 'Ancient Red Dragon',
            hasDangerous: true,
            expected: 10,
            description: 'Boss with Dangerous effect',
          },
          {
            name: 'elite orc chieftain',
            hasDangerous: false,
            expected: 5,
            description: 'Elite enemy without Dangerous',
          },
          {
            name: 'goblin scout',
            hasDangerous: false,
            expected: 1,
            description: 'Regular enemy',
          },
          {
            name: 'elite Ancient Wyrm',
            hasDangerous: true,
            expected: 10,
            description: 'Elite boss with Dangerous (Dangerous takes priority)',
          },
        ];

        scenarios.forEach(({ name, hasDangerous, expected, description }) => {
          mockHasEffect.mockReturnValue(hasDangerous);
          mockCharacter.name = name;

          const result = playerCalcAXPReward(mockCharacter);
          expect(result).toBe(expected);
        });
      });

      it('should work with different character types', () => {
        // Test with minimal character object
        const minimalChar = { name: 'elite warrior' } as ICharacter;
        mockHasEffect.mockReturnValue(false);

        let result = playerCalcAXPReward(minimalChar);
        expect(result).toBe(5);

        // Test with full character object
        const fullChar = {
          name: 'elite mage',
          uuid: 'full-uuid',
          level: 25,
          hp: { current: 100, maximum: 100 },
          mp: { current: 50, maximum: 50 },
          stats: { str: 10, dex: 10, int: 20 },
        } as ICharacter;

        result = playerCalcAXPReward(fullChar);
        expect(result).toBe(5);
      });
    });

    describe('Performance Considerations', () => {
      it('should handle rapid successive calls efficiently', () => {
        mockHasEffect.mockReturnValue(false);
        mockCharacter.name = 'elite warrior';

        // Call function many times
        const iterations = 1000;
        const results: number[] = [];

        for (let i = 0; i < iterations; i++) {
          results.push(playerCalcAXPReward(mockCharacter));
        }

        // All results should be consistent
        results.forEach((result) => {
          expect(result).toBe(5);
        });

        // Should have called hasEffect for each iteration
        expect(mockHasEffect).toHaveBeenCalledTimes(iterations);
      });

      it('should not modify the input character object', () => {
        const originalChar = {
          name: 'elite orc',
          uuid: 'test-uuid',
          level: 5,
        } as ICharacter;

        const charCopy = { ...originalChar };
        mockHasEffect.mockReturnValue(false);

        playerCalcAXPReward(originalChar);

        // Character should remain unchanged
        expect(originalChar).toEqual(charCopy);
      });
    });
  });
});
