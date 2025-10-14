import type { IPlayer } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { playerCalcRequiredGoldForNextHPMP } from './player.statbuys';

// Mock dependencies
vi.mock('@lotr/content', () => ({
  settingGameGet: vi.fn(),
}));

vi.mock('@lotr/premium', () => ({
  premiumDocReduction: vi.fn(),
}));

vi.mock('./stats', () => ({
  getBaseStat: vi.fn(),
  getStat: vi.fn(),
}));

describe('Player Stat Buys Functions', () => {
  let mockSettingGameGet: any;
  let mockPremiumDocReduction: any;
  let mockGetBaseStat: any;
  let mockGetStat: any;
  let mockPlayer: IPlayer;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const contentModule = await import('@lotr/content');
    const premiumModule = await import('@lotr/premium');
    const statsModule = await import('./stats');

    mockSettingGameGet = vi.mocked(contentModule.settingGameGet);
    mockPremiumDocReduction = vi.mocked(premiumModule.premiumDocReduction);
    mockGetBaseStat = vi.mocked(statsModule.getBaseStat);
    mockGetStat = vi.mocked(statsModule.getStat);

    // Create mock player
    mockPlayer = {
      uuid: 'test-player-uuid',
      name: 'Test Player',
    } as IPlayer;

    // Set default mock return values
    mockSettingGameGet.mockImplementation((category, setting) => {
      if (category === 'character' && setting === 'chaSlidingDiscount') {
        return 7;
      }
      if (category === 'character' && setting === 'chaMaxForDiscount') {
        return 50;
      }

      return undefined;
    });

    mockGetBaseStat.mockReturnValue(10); // Default current stat
    mockGetStat.mockReturnValue(15); // Default CHA
    mockPremiumDocReduction.mockImplementation((player, cost) => cost); // No reduction by default
  });

  describe('playerCalcRequiredGoldForNextHPMP', () => {
    const defaultParams = {
      stat: Stat.HP,
      maxForTier: 100,
      normalizer: 10,
      costsAtTier: { min: 100, max: 1000 },
    };

    describe('Basic Cost Calculation', () => {
      it('should calculate gold cost based on current stat progression', () => {
        mockGetBaseStat.mockReturnValue(55); // Halfway between normalizer and max
        mockGetStat.mockReturnValue(7); // No CHA discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // At 55/100 (halfway), cost should be 550 (halfway between min/max)
        expect(mockGetBaseStat).toHaveBeenCalledWith(mockPlayer, Stat.HP);
        expect(mockGetStat).toHaveBeenCalledWith(mockPlayer, Stat.CHA);
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 550);
      });

      it('should use maximum cost when at max tier', () => {
        mockGetBaseStat.mockReturnValue(100); // At max tier
        mockGetStat.mockReturnValue(7); // No CHA discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 1000);
      });
    });

    describe('Charisma Discount System', () => {
      it('should apply CHA discount correctly', () => {
        mockGetBaseStat.mockReturnValue(55); // Halfway progression
        mockGetStat.mockReturnValue(17); // CHA 17 = 10% discount (17 - 7 = 10)

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Base cost: 550, Discount: 55 (10%), Final: 495
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 495);
      });

      it('should cap CHA discount at maximum allowed', () => {
        mockGetBaseStat.mockReturnValue(55); // Halfway progression
        mockGetStat.mockReturnValue(100); // Very high CHA, should be capped at 50%

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Base cost: 550, Max discount: 50%, Discount amount: 275, Final: 275
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 275);
      });

      it('should not apply discount when CHA is at or below sliding discount threshold', () => {
        mockGetBaseStat.mockReturnValue(55); // Halfway progression
        mockGetStat.mockReturnValue(7); // CHA 7 = 0% discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // No discount applied, cost remains 550
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 550);
      });
    });

    describe('Custom Settings Integration', () => {
      it('should use custom sliding discount threshold', () => {
        mockSettingGameGet.mockImplementation((category, setting) => {
          if (category === 'character' && setting === 'chaSlidingDiscount') {
            return 10;
          }
          if (category === 'character' && setting === 'chaMaxForDiscount') {
            return 50;
          }
          return undefined;
        });

        mockGetBaseStat.mockReturnValue(55);
        mockGetStat.mockReturnValue(15); // CHA 15 with threshold 10 = 5% discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Base cost: 550, Discount: 27.5 (5%), Final: 522.5 rounded to 523
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 523);
      });

      it('should use custom maximum discount cap', () => {
        mockSettingGameGet.mockImplementation((category, setting) => {
          if (category === 'character' && setting === 'chaSlidingDiscount') {
            return 7;
          }
          if (category === 'character' && setting === 'chaMaxForDiscount') {
            return 25;
          }
          return undefined;
        });

        mockGetBaseStat.mockReturnValue(55);
        mockGetStat.mockReturnValue(100); // Very high CHA, capped at 25%

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Base cost: 550, Max discount: 25%, Discount amount: 137.5, Final: 412.5 rounded to 413
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 413);
      });

      it('should use default values when settings are unavailable', () => {
        mockSettingGameGet.mockReturnValue(undefined);

        mockGetBaseStat.mockReturnValue(55);
        mockGetStat.mockReturnValue(17);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Should use default values (7 for sliding discount, 50 for max)
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 495);
      });
    });

    describe('Cost Floor Protection', () => {
      it('should never return cost below minimum even with high discounts', () => {
        mockGetBaseStat.mockReturnValue(20); // Low stat for small base cost
        mockGetStat.mockReturnValue(100); // Maximum CHA for 50% discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Should not go below minimum cost of 100
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 100);
      });

      it('should apply Math.max to ensure minimum cost is respected', () => {
        // Test scenario where discount would bring cost below minimum
        mockGetBaseStat.mockReturnValue(12); // Very close to normalizer
        mockGetStat.mockReturnValue(50); // High CHA for significant discount

        const smallCostTier = { min: 50, max: 200 };

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          smallCostTier,
        );

        // Even with discount, should not go below min cost of 50
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 50);
      });
    });

    describe('Premium Integration', () => {
      it('should pass calculated cost to premium reduction function', () => {
        mockPremiumDocReduction.mockReturnValue(400); // Premium reduces cost

        mockGetBaseStat.mockReturnValue(55);
        mockGetStat.mockReturnValue(17);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 495);
        expect(result).toBe(400); // Should return premium-adjusted value
      });

      it('should handle premium function returning different values', () => {
        const testCases = [
          { premiumResult: 100, expected: 100 },
          { premiumResult: 1, expected: 1 },
          { premiumResult: 0, expected: 0 },
        ];

        testCases.forEach(({ premiumResult, expected }) => {
          mockPremiumDocReduction.mockReturnValue(premiumResult);

          const result = playerCalcRequiredGoldForNextHPMP(
            mockPlayer,
            defaultParams.stat,
            defaultParams.maxForTier,
            defaultParams.normalizer,
            defaultParams.costsAtTier,
          );

          expect(result).toBe(expected);
        });
      });
    });

    describe('Different Stats', () => {
      it('should work with HP stat', () => {
        mockGetBaseStat.mockReturnValue(50);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          Stat.HP,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockGetBaseStat).toHaveBeenCalledWith(mockPlayer, Stat.HP);
      });

      it('should work with MP stat', () => {
        mockGetBaseStat.mockReturnValue(50);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          Stat.MP,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockGetBaseStat).toHaveBeenCalledWith(mockPlayer, Stat.MP);
      });

      it('should work with other stats', () => {
        mockGetBaseStat.mockReturnValue(50);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          Stat.STR,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockGetBaseStat).toHaveBeenCalledWith(mockPlayer, Stat.STR);
      });
    });

    describe('Edge Cases and Boundary Conditions', () => {
      it('should handle stat below normalizer value', () => {
        mockGetBaseStat.mockReturnValue(5); // Below normalizer
        mockGetStat.mockReturnValue(7);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // percentThere should be clamped to 0.01 minimum
        // (5 - 10) / (100 - 10) = -5/90 = negative, clamped to 0.01
        const expectedCost = 100 + 900 * 0.01; // 109
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(
          mockPlayer,
          Math.round(expectedCost),
        );
      });

      it('should handle stat above max tier', () => {
        mockGetBaseStat.mockReturnValue(150); // Above max tier
        mockGetStat.mockReturnValue(7);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // percentThere = (150 - 10) / (100 - 10) = 140/90 > 1
        // Should still calculate based on this ratio
        const percentThere = (150 - 10) / (100 - 10); // 140/90 ≈ 1.56
        const expectedCost = 100 + 900 * percentThere;
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(
          mockPlayer,
          Math.round(expectedCost),
        );
      });

      it('should handle zero cost tier', () => {
        const zeroCostTier = { min: 0, max: 0 };

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          zeroCostTier,
        );

        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 0);
      });

      it('should handle identical min and max costs', () => {
        const flatCostTier = { min: 500, max: 500 };

        mockGetBaseStat.mockReturnValue(55); // Any progression
        mockGetStat.mockReturnValue(7); // No discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          flatCostTier,
        );

        // Cost should always be 500 regardless of progression
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 500);
      });

      it('should handle very large numbers', () => {
        const largeCostTier = { min: 1000000, max: 10000000 };

        mockGetBaseStat.mockReturnValue(55);
        mockGetStat.mockReturnValue(7);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          largeCostTier,
        );

        // Should handle large numbers correctly
        const expectedCost = 1000000 + 9000000 * 0.5; // 5500000
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(
          mockPlayer,
          expectedCost,
        );
      });
    });

    describe('Mathematical Precision', () => {
      it('should round costs to nearest integer', () => {
        mockGetBaseStat.mockReturnValue(33); // Creates fractional percentage
        mockGetStat.mockReturnValue(10); // 3% discount

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // percentThere = (33 - 10) / (100 - 10) = 23/90 ≈ 0.2556
        // baseCost = 100 + (900 * 0.2556) ≈ 330
        // discount = (330 * 3) / 100 = 9.9
        // finalCost = 330 - 9.9 = 320.1, rounded to 320
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(mockPlayer, 320);
      });

      it('should handle fractional charisma discounts correctly', () => {
        mockGetBaseStat.mockReturnValue(45);
        mockGetStat.mockReturnValue(14); // 7% discount (14 - 7 = 7)

        const oddCostTier = { min: 133, max: 777 };

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          oddCostTier,
        );

        // Should handle fractional calculations and rounding properly
        const percentThere = (45 - 10) / (100 - 10); // 35/90 ≈ 0.3889
        const baseCost = 133 + 644 * percentThere; // ≈ 383.4
        const discount = (baseCost * 7) / 100; // ≈ 26.84
        const finalCost = Math.max(133, Math.round(baseCost - discount));
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(
          mockPlayer,
          finalCost,
        );
      });
    });

    describe('Function Parameter Validation', () => {
      it('should pass all parameters correctly to dependent functions', () => {
        const testStat = Stat.CON;
        const testPlayer = {
          ...mockPlayer,
          name: 'Specific Test Player',
        } as IPlayer;

        const result = playerCalcRequiredGoldForNextHPMP(
          testPlayer,
          testStat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockGetBaseStat).toHaveBeenCalledWith(testPlayer, testStat);
        expect(mockGetStat).toHaveBeenCalledWith(testPlayer, Stat.CHA);
        expect(mockPremiumDocReduction).toHaveBeenCalledWith(
          testPlayer,
          expect.any(Number),
        );
      });

      it('should handle different cost tier configurations', () => {
        const costConfigs = [
          { min: 50, max: 500 },
          { min: 1000, max: 5000 },
          { min: 10, max: 100 },
        ];

        costConfigs.forEach((costTier) => {
          mockGetBaseStat.mockReturnValue(55);
          mockGetStat.mockReturnValue(7);

          const result = playerCalcRequiredGoldForNextHPMP(
            mockPlayer,
            defaultParams.stat,
            defaultParams.maxForTier,
            defaultParams.normalizer,
            costTier,
          );

          const expectedCost =
            costTier.min + (costTier.max - costTier.min) * 0.5;
          expect(mockPremiumDocReduction).toHaveBeenCalledWith(
            mockPlayer,
            expectedCost,
          );
        });
      });
    });

    describe('Integration with Game Settings', () => {
      it('should call settingGameGet for both CHA settings', () => {
        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        expect(mockSettingGameGet).toHaveBeenCalledWith(
          'character',
          'chaSlidingDiscount',
        );
        expect(mockSettingGameGet).toHaveBeenCalledWith(
          'character',
          'chaMaxForDiscount',
        );
      });

      it('should handle null settings gracefully', () => {
        mockSettingGameGet.mockReturnValue(null);

        const result = playerCalcRequiredGoldForNextHPMP(
          mockPlayer,
          defaultParams.stat,
          defaultParams.maxForTier,
          defaultParams.normalizer,
          defaultParams.costsAtTier,
        );

        // Should use default values when settings return null
        expect(result).toBeDefined();
        expect(typeof result).toBe('number');
      });
    });
  });
});
