import type { IAccount, IPlayer } from '@lotr/interfaces';
import { SilverPurchase, SubscriptionTier } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  premiumAxpGained,
  premiumBuildSlots,
  premiumDocReduction,
  premiumHolidayTokensGained,
  premiumMarketListingsMax,
  premiumMaxCharacters,
  premiumSkillGained,
  premiumSmithMaxRepair,
  premiumSmithRepairCost,
  premiumSuccorOzMax,
  premiumXpGained,
} from './silverperks';

// Mock dependencies
vi.mock('@lotr/content', () => ({
  settingGameGet: vi.fn(),
}));

describe('Silver Perks Functions', () => {
  let mockSettingGameGet: any;
  let mockPlayer: IPlayer;
  let mockAccount: IAccount;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const contentModule = await import('@lotr/content');
    mockSettingGameGet = vi.mocked(contentModule.settingGameGet);

    // Create mock player with basic properties
    mockPlayer = {
      subscriptionTier: SubscriptionTier.Trial,
    } as IPlayer;

    // Create mock account with premium data
    mockAccount = {
      premium: {
        silverPurchases: {
          [SilverPurchase.MoreCharacters]: 2,
        },
      },
    } as IAccount;

    // Set default mock return values
    mockSettingGameGet.mockReturnValue(undefined);
  });

  describe('premiumDocReduction', () => {
    it('should reduce doc cost based on subscription tier and multiplier', () => {
      mockSettingGameGet.mockReturnValue(0.1); // 10% reduction per tier
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumDocReduction(mockPlayer, 100);

      expect(mockSettingGameGet).toHaveBeenCalledWith('subscriber', 'statDoc');
      expect(result).toBe(80); // 100 - (100 * 0.1 * 2) = 80
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(0.05);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      const result = premiumDocReduction(mockPlayer);

      expect(result).toBe(9); // 10 - (10 * 0.05 * 1) = 9.5, floored to 9
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumDocReduction(mockPlayer, 20);

      expect(result).toBe(18); // 20 - (20 * 0.05 * 2) = 18
    });

    it('should never return less than 1', () => {
      mockSettingGameGet.mockReturnValue(0.5); // 50% reduction per tier
      mockPlayer.subscriptionTier = SubscriptionTier.Basic;

      const result = premiumDocReduction(mockPlayer, 10);

      expect(result).toBe(1); // Would be -15, but clamped to 1
    });

    it('should handle zero subscription tier', () => {
      mockSettingGameGet.mockReturnValue(0.1);
      mockPlayer.subscriptionTier = SubscriptionTier.None;

      const result = premiumDocReduction(mockPlayer, 50);

      expect(result).toBe(50); // No reduction for tier 0
    });

    it('should handle fractional results correctly', () => {
      mockSettingGameGet.mockReturnValue(0.07);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumDocReduction(mockPlayer, 100);

      expect(result).toBe(65); // 100 - (100 * 0.07 * 5) = 65, floored
    });
  });

  describe('premiumMaxCharacters', () => {
    it('should calculate max characters with silver purchases', () => {
      mockSettingGameGet.mockReturnValue(2); // 2 characters per purchase
      mockAccount.premium.silverPurchases[SilverPurchase.MoreCharacters] = 3;

      const result = premiumMaxCharacters(mockAccount, 5);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'characters',
      );
      expect(result).toBe(11); // 5 + (2 * 3) = 11
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(1);
      mockAccount.premium.silverPurchases[SilverPurchase.MoreCharacters] = 2;

      const result = premiumMaxCharacters(mockAccount);

      expect(result).toBe(6); // 4 + (1 * 2) = 6
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockAccount.premium.silverPurchases[SilverPurchase.MoreCharacters] = 2;

      const result = premiumMaxCharacters(mockAccount, 8);

      expect(result).toBe(10); // 8 + (1 * 2) = 10
    });
  });

  describe('premiumSmithMaxRepair', () => {
    it('should calculate max repair based on subscription tier', () => {
      mockSettingGameGet.mockReturnValue(2000);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumSmithMaxRepair(mockPlayer, 15000);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'smithRepair',
      );
      expect(result).toBe(25000); // 15000 + (5 * 2000) = 25000
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(1500);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumSmithMaxRepair(mockPlayer);

      expect(result).toBe(23000); // 20000 + (2 * 1500) = 23000
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumSmithMaxRepair(mockPlayer, 10000);

      expect(result).toBe(12000); // 10000 + (2 * 1000) = 12000
    });

    it('should handle zero subscription tier', () => {
      mockSettingGameGet.mockReturnValue(1000);
      mockPlayer.subscriptionTier = SubscriptionTier.None;

      const result = premiumSmithMaxRepair(mockPlayer, 5000);

      expect(result).toBe(5000); // 5000 + (0 * 1000) = 5000
    });
  });

  describe('premiumSmithRepairCost', () => {
    it('should reduce repair cost based on subscription tier', () => {
      mockSettingGameGet.mockReturnValue(0.1); // 10% reduction per tier
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumSmithRepairCost(mockPlayer, 1000);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'smithCost',
      );
      expect(result).toBe(800); // 1000 - (1000 * 0.1 * 2) = 800
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      const result = premiumSmithRepairCost(mockPlayer, 2000);

      expect(result).toBe(1900); // 2000 - (2000 * 0.05 * 1) = 1900
    });

    it('should handle zero subscription tier', () => {
      mockSettingGameGet.mockReturnValue(0.1);
      mockPlayer.subscriptionTier = SubscriptionTier.None;

      const result = premiumSmithRepairCost(mockPlayer, 500);

      expect(result).toBe(500); // No reduction for tier 0
    });

    it('should floor the result', () => {
      mockSettingGameGet.mockReturnValue(0.07);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumSmithRepairCost(mockPlayer, 1000);

      expect(result).toBe(650); // 1000 - (1000 * 0.07 * 5) = 650
    });

    it('should handle large reduction values', () => {
      mockSettingGameGet.mockReturnValue(0.3);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic;

      const result = premiumSmithRepairCost(mockPlayer, 100);

      expect(result).toBe(-50); // 100 - (100 * 0.3 * 5) = -50 (negative allowed)
    });
  });

  describe('premiumSuccorOzMax', () => {
    it('should calculate max succor oz based on subscription tier', () => {
      mockSettingGameGet.mockReturnValue(2);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumSuccorOzMax(mockPlayer, 5);

      expect(mockSettingGameGet).toHaveBeenCalledWith('subscriber', 'succorOz');
      expect(result).toBe(15); // 5 + (5 * 2) = 15
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(3);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumSuccorOzMax(mockPlayer);

      expect(result).toBe(7); // 1 + (2 * 3) = 7
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumSuccorOzMax(mockPlayer, 2);

      expect(result).toBe(7); // 2 + (5 * 1) = 7
    });
  });

  describe('premiumMarketListingsMax', () => {
    it('should calculate max market listings based on subscription tier', () => {
      mockSettingGameGet.mockReturnValue(10);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumMarketListingsMax(mockPlayer, 20);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'marketListings',
      );
      expect(result).toBe(40); // 20 + (2 * 10) = 40
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(8);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumMarketListingsMax(mockPlayer);

      expect(result).toBe(65); // 25 + (5 * 8) = 65
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumMarketListingsMax(mockPlayer, 15);

      expect(result).toBe(25); // 15 + (2 * 5) = 25
    });
  });

  describe('premiumAxpGained', () => {
    it('should multiply AXP when subscription tier is greater than 0', () => {
      mockSettingGameGet.mockReturnValue(2);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      const result = premiumAxpGained(mockPlayer, 10);

      expect(mockSettingGameGet).toHaveBeenCalledWith('subscriber', 'axpGain');
      expect(result).toBe(30); // 10 * (1 + 2) = 30
    });

    it('should not multiply AXP when subscription tier is 0', () => {
      mockSettingGameGet.mockReturnValue(2);
      mockPlayer.subscriptionTier = SubscriptionTier.None;

      const result = premiumAxpGained(mockPlayer, 10);

      expect(result).toBe(10); // 10 * 1 = 10
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(3);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumAxpGained(mockPlayer);

      expect(result).toBe(4); // 1 * (1 + 3) = 4
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      const result = premiumAxpGained(mockPlayer, 5);

      expect(result).toBe(10); // 5 * (1 + 1) = 10
    });
  });

  describe('premiumXpGained', () => {
    it('should calculate XP bonus based on subscription tier', () => {
      mockSettingGameGet.mockReturnValue(0.1);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumXpGained(mockPlayer, 100);

      expect(mockSettingGameGet).toHaveBeenCalledWith('subscriber', 'xpGain');
      expect(result).toBe(101.5); // 100 + (1 + 5 * 0.1) = 101.5
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(0.08);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumXpGained(mockPlayer);

      expect(result).toBe(2.16); // 1 + (1 + 2 * 0.08) = 2.16
    });

    it('should handle zero subscription tier', () => {
      mockSettingGameGet.mockReturnValue(0.1);
      mockPlayer.subscriptionTier = SubscriptionTier.None;

      const result = premiumXpGained(mockPlayer, 25);

      expect(result).toBe(26); // 25 + (1 + 0 * 0.1) = 26
    });
  });

  describe('premiumSkillGained', () => {
    it('should calculate skill bonus based on subscription tier', () => {
      mockSettingGameGet.mockReturnValue(0.1);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumSkillGained(mockPlayer, 10);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'skillGain',
      );
      expect(result).toBe(11.2); // 10 + (1 + 2 * 0.1) = 11.2
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(0.08);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // Value 5

      const result = premiumSkillGained(mockPlayer);

      expect(result).toBe(2.4); // 1 + (1 + 5 * 0.08) = 2.4
    });
  });

  describe('premiumBuildSlots', () => {
    it('should add bonus build slots to base value', () => {
      mockSettingGameGet.mockReturnValue(5);

      const result = premiumBuildSlots(mockPlayer, 2);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'buildSlots',
      );
      expect(result).toBe(7); // 2 + 5 = 7
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(4);

      const result = premiumBuildSlots(mockPlayer);

      expect(result).toBe(7); // 3 + 4 = 7
    });

    it('should use default bonus when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);

      const result = premiumBuildSlots(mockPlayer, 5);

      expect(result).toBe(8); // 5 + 3 = 8
    });
  });

  describe('premiumHolidayTokensGained', () => {
    it('should multiply holiday tokens when subscription tier is greater than 0', () => {
      mockSettingGameGet.mockReturnValue(3);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      const result = premiumHolidayTokensGained(mockPlayer, 5);

      expect(mockSettingGameGet).toHaveBeenCalledWith(
        'subscriber',
        'holidayTokenGain',
      );
      expect(result).toBe(15); // 5 * 3 = 15
    });

    it('should not multiply tokens when subscription tier is 0', () => {
      mockSettingGameGet.mockReturnValue(4);
      mockPlayer.subscriptionTier = SubscriptionTier.None;

      const result = premiumHolidayTokensGained(mockPlayer, 8);

      expect(result).toBe(8); // 8 * 1 = 8
    });

    it('should use default base value when not provided', () => {
      mockSettingGameGet.mockReturnValue(2.5);
      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const result = premiumHolidayTokensGained(mockPlayer);

      expect(result).toBe(2.5); // 1 * 2.5 = 2.5
    });

    it('should use default multiplier when setting is unavailable', () => {
      mockSettingGameGet.mockReturnValue(null);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      const result = premiumHolidayTokensGained(mockPlayer, 10);

      expect(result).toBe(20); // 10 * 2 = 20
    });

    it('should handle high subscription tiers consistently', () => {
      mockSettingGameGet.mockReturnValue(3);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic; // High tier should still use multiplier

      const result = premiumHolidayTokensGained(mockPlayer, 7);

      expect(result).toBe(21); // 7 * 3 = 21
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined setting values gracefully', () => {
      mockSettingGameGet.mockReturnValue(undefined);
      mockPlayer.subscriptionTier = SubscriptionTier.Trial;

      expect(() => {
        premiumDocReduction(mockPlayer, 10);
        premiumSmithMaxRepair(mockPlayer, 1000);
        premiumAxpGained(mockPlayer, 5);
        premiumXpGained(mockPlayer, 10);
      }).not.toThrow();
    });

    it('should handle zero base values', () => {
      mockSettingGameGet.mockReturnValue(2);
      mockPlayer.subscriptionTier = SubscriptionTier.Basic;

      const results = [
        premiumDocReduction(mockPlayer, 0),
        premiumMaxCharacters(mockAccount, 0),
        premiumSmithMaxRepair(mockPlayer, 0),
        premiumAxpGained(mockPlayer, 0),
        premiumXpGained(mockPlayer, 0),
      ];

      results.forEach((result) => {
        expect(typeof result).toBe('number');
        expect(result).not.toBeNaN();
      });
    });

    it('should handle very large numbers', () => {
      mockSettingGameGet.mockReturnValue(1000000);
      mockPlayer.subscriptionTier = SubscriptionTier.GM; // Value 10

      const result = premiumSmithMaxRepair(mockPlayer, 1000000);

      expect(result).toBe(11000000); // 1000000 + (10 * 1000000)
      expect(Number.isFinite(result)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency across related functions', () => {
      mockSettingGameGet.mockImplementation((category, setting) => {
        const settings = {
          statDoc: 0.1,
          smithRepair: 2000,
          smithCost: 0.08,
          xpGain: 0.05,
          skillGain: 0.05,
        };
        return settings[setting as keyof typeof settings] ?? 1;
      });

      mockPlayer.subscriptionTier = SubscriptionTier.Tester;

      const docReduction = premiumDocReduction(mockPlayer, 100);
      const smithMax = premiumSmithMaxRepair(mockPlayer, 10000);
      const smithCost = premiumSmithRepairCost(mockPlayer, 1000);
      const xpGain = premiumXpGained(mockPlayer, 50);
      const skillGain = premiumSkillGained(mockPlayer, 25);

      expect(docReduction).toBe(80); // Reduced by 20%
      expect(smithMax).toBe(14000); // Increased by 4000
      expect(smithCost).toBe(840); // Reduced by 16%
      expect(xpGain).toBe(51.1); // Increased by 10%
      expect(skillGain).toBe(26.1); // Increased by 10%
    });
  });
});
