import type { ISimpleItem } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  itemCanBeUpgraded,
  itemCanBeUsedForUpgrade,
  itemMarkIdentified,
  itemSetEncrust,
} from './items.upgrades';

// Mock dependencies
vi.mock('./items.properties', () => ({
  itemPropertiesGet: vi.fn(),
  itemPropertyGet: vi.fn(),
  itemPropertySet: vi.fn(),
}));

describe('Items Upgrades Functions', () => {
  let mockItemPropertiesGet: any;
  let mockItemPropertyGet: any;
  let mockItemPropertySet: any;
  let mockBaseItem: ISimpleItem;
  let mockUpgradeItem: ISimpleItem;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const itemPropertiesModule = await import('./items.properties');
    mockItemPropertiesGet = vi.mocked(itemPropertiesModule.itemPropertiesGet);
    mockItemPropertyGet = vi.mocked(itemPropertiesModule.itemPropertyGet);
    mockItemPropertySet = vi.mocked(itemPropertiesModule.itemPropertySet);

    // Create mock items
    mockBaseItem = {
      uuid: 'base-item-uuid',
      name: 'Base Sword',
      mods: {
        upgrades: [],
        identifyTier: 0,
      },
    } as ISimpleItem;

    mockUpgradeItem = {
      uuid: 'upgrade-item-uuid',
      name: 'Upgrade Stone',
      mods: {},
    } as ISimpleItem;
  });

  describe('itemSetEncrust', () => {
    it('should set encrust item property with the item name', () => {
      const encrustItem = {
        uuid: 'encrust-item-uuid',
        name: 'Ruby Gem',
        mods: {},
      } as ISimpleItem;

      itemSetEncrust(mockBaseItem, encrustItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockBaseItem,
        'encrustItem',
        'Ruby Gem',
      );
    });

    it('should handle items with special characters in name', () => {
      const specialItem = {
        uuid: 'special-item-uuid',
        name: "Dragon's Eye Crystal",
        mods: {},
      } as ISimpleItem;

      itemSetEncrust(mockBaseItem, specialItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockBaseItem,
        'encrustItem',
        "Dragon's Eye Crystal",
      );
    });

    it('should handle items with empty names', () => {
      const emptyNameItem = {
        uuid: 'empty-name-item-uuid',
        name: '',
        mods: {},
      } as ISimpleItem;

      itemSetEncrust(mockBaseItem, emptyNameItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockBaseItem,
        'encrustItem',
        '',
      );
    });

    it('should handle items with very long names', () => {
      const longNameItem = {
        uuid: 'long-name-item-uuid',
        name: 'Extraordinarily Long Name For An Item That Exceeds Normal Expectations',
        mods: {},
      } as ISimpleItem;

      itemSetEncrust(mockBaseItem, longNameItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        mockBaseItem,
        'encrustItem',
        'Extraordinarily Long Name For An Item That Exceeds Normal Expectations',
      );
    });

    it('should call itemPropertySet exactly once', () => {
      itemSetEncrust(mockBaseItem, mockUpgradeItem);

      expect(mockItemPropertySet).toHaveBeenCalledTimes(1);
    });

    it('should work with different base items', () => {
      const differentBase = {
        uuid: 'different-base-uuid',
        name: 'Magic Staff',
        mods: {},
      } as ISimpleItem;

      itemSetEncrust(differentBase, mockUpgradeItem);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        differentBase,
        'encrustItem',
        'Upgrade Stone',
      );
    });
  });

  describe('itemCanBeUsedForUpgrade', () => {
    it('should return true when item has canUpgradeWith property set to truthy value', () => {
      mockItemPropertyGet.mockReturnValue(true);

      const result = itemCanBeUsedForUpgrade(mockUpgradeItem);

      expect(mockItemPropertyGet).toHaveBeenCalledWith(
        mockUpgradeItem,
        'canUpgradeWith',
      );
      expect(result).toBe(true);
    });

    it('should return false when item has canUpgradeWith property set to false', () => {
      mockItemPropertyGet.mockReturnValue(false);

      const result = itemCanBeUsedForUpgrade(mockUpgradeItem);

      expect(mockItemPropertyGet).toHaveBeenCalledWith(
        mockUpgradeItem,
        'canUpgradeWith',
      );
      expect(result).toBe(false);
    });

    it('should return false when item has canUpgradeWith property set to null', () => {
      mockItemPropertyGet.mockReturnValue(null);

      const result = itemCanBeUsedForUpgrade(mockUpgradeItem);

      expect(result).toBe(false);
    });

    it('should return false when item has canUpgradeWith property set to undefined', () => {
      mockItemPropertyGet.mockReturnValue(undefined);

      const result = itemCanBeUsedForUpgrade(mockUpgradeItem);

      expect(result).toBe(false);
    });

    it('should return truthy values as true', () => {
      const truthyValues = [1, 'yes', {}, [], 'canUpgrade'];

      truthyValues.forEach((value) => {
        mockItemPropertyGet.mockReturnValue(value);

        const result = itemCanBeUsedForUpgrade(mockUpgradeItem);

        expect(result).toBe(true);
      });
    });

    it('should return falsy values as false', () => {
      const falsyValues = [0, '', null, undefined, false];

      falsyValues.forEach((value) => {
        mockItemPropertyGet.mockReturnValue(value);

        const result = itemCanBeUsedForUpgrade(mockUpgradeItem);

        expect(result).toBe(false);
      });
    });

    it('should call itemPropertyGet exactly once', () => {
      mockItemPropertyGet.mockReturnValue(true);

      itemCanBeUsedForUpgrade(mockUpgradeItem);

      expect(mockItemPropertyGet).toHaveBeenCalledTimes(1);
    });

    it('should work with different upgrade items', () => {
      const differentUpgrade = {
        uuid: 'different-upgrade-uuid',
        name: 'Different Stone',
        mods: {},
      } as ISimpleItem;

      mockItemPropertyGet.mockReturnValue(true);

      const result = itemCanBeUsedForUpgrade(differentUpgrade);

      expect(mockItemPropertyGet).toHaveBeenCalledWith(
        differentUpgrade,
        'canUpgradeWith',
      );
      expect(result).toBe(true);
    });
  });

  describe('itemCanBeUpgraded', () => {
    describe('with bypassLimit = true', () => {
      it('should return true regardless of upgrade count or max upgrades', () => {
        const itemWithMaxUpgrades = {
          uuid: 'full-item-uuid',
          name: 'Full Item',
          mods: {
            upgrades: ['upgrade1', 'upgrade2', 'upgrade3'],
          },
        } as ISimpleItem;

        mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 2 });

        const result = itemCanBeUpgraded(itemWithMaxUpgrades, true);

        expect(result).toBe(true);
        // Should not call itemPropertiesGet when bypassing
        expect(mockItemPropertiesGet).not.toHaveBeenCalled();
      });

      it('should return true for items with no upgrades', () => {
        const result = itemCanBeUpgraded(mockBaseItem, true);

        expect(result).toBe(true);
        expect(mockItemPropertiesGet).not.toHaveBeenCalled();
      });

      it('should return true when maxUpgrades is 0', () => {
        mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 0 });

        const result = itemCanBeUpgraded(mockBaseItem, true);

        expect(result).toBe(true);
        expect(mockItemPropertiesGet).not.toHaveBeenCalled();
      });
    });

    describe('with bypassLimit = false (default)', () => {
      it('should return true when current upgrades less than max upgrades', () => {
        const itemWithSomeUpgrades = {
          uuid: 'partial-item-uuid',
          name: 'Partial Item',
          mods: {
            upgrades: ['upgrade1'],
          },
        } as ISimpleItem;

        mockItemPropertyGet.mockReturnValue(3);

        const result = itemCanBeUpgraded(itemWithSomeUpgrades);

        expect(mockItemPropertyGet).toHaveBeenCalledWith(
          itemWithSomeUpgrades,
          'maxUpgrades',
        );
        expect(result).toBe(true);
      });

      it('should return false when current upgrades equal max upgrades', () => {
        const itemWithMaxUpgrades = {
          uuid: 'full-item-2-uuid',
          name: 'Full Item',
          mods: {
            upgrades: ['upgrade1', 'upgrade2'],
          },
        } as ISimpleItem;

        mockItemPropertyGet.mockReturnValue(2);

        const result = itemCanBeUpgraded(itemWithMaxUpgrades);

        expect(result).toBe(false);
      });

      it('should return false when current upgrades exceed max upgrades', () => {
        const itemWithTooManyUpgrades = {
          uuid: 'overfull-item-uuid',
          name: 'Overfull Item',
          mods: {
            upgrades: ['upgrade1', 'upgrade2', 'upgrade3'],
          },
        } as ISimpleItem;

        mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 2 });

        const result = itemCanBeUpgraded(itemWithTooManyUpgrades);

        expect(result).toBe(false);
      });

      it('should handle items with no upgrades array', () => {
        const itemWithoutUpgrades = {
          uuid: 'fresh-item-uuid',
          name: 'Fresh Item',
          mods: {},
        } as ISimpleItem;

        mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 2 });

        const result = itemCanBeUpgraded(itemWithoutUpgrades);

        expect(result).toBe(true);
      });

      it('should handle items with null upgrades', () => {
        const itemWithNullUpgrades = {
          uuid: 'null-upgrades-uuid',
          name: 'Null Upgrades Item',
          mods: {
            upgrades: null,
          },
        } as any;

        mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 2 });

        const result = itemCanBeUpgraded(itemWithNullUpgrades);

        expect(result).toBe(true);
      });

      it('should handle items with undefined upgrades', () => {
        const itemWithUndefinedUpgrades = {
          uuid: 'undefined-upgrades-uuid',
          name: 'Undefined Upgrades Item',
          mods: {
            upgrades: undefined,
          },
        } as any;

        mockItemPropertyGet.mockReturnValue(2);

        const result = itemCanBeUpgraded(itemWithUndefinedUpgrades);

        expect(result).toBe(true);
      });

      it('should handle when maxUpgrades is null', () => {
        mockItemPropertyGet.mockReturnValue(null);

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(false); // 0 < (null ?? 0) = 0 < 0 = false
      });

      it('should handle when maxUpgrades is undefined', () => {
        mockItemPropertyGet.mockReturnValue(undefined);

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(false);
      });

      it('should handle when itemPropertyGet returns null', () => {
        mockItemPropertyGet.mockReturnValue(null);

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(false);
      });

      it('should handle when itemPropertyGet returns empty object', () => {
        mockItemPropertyGet.mockReturnValue({});

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(false);
      });

      it('should return true when maxUpgrades is greater than 0 and no upgrades exist', () => {
        mockItemPropertyGet.mockReturnValue(5);

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(true);
      });

      it('should handle zero maxUpgrades', () => {
        mockItemPropertyGet.mockReturnValue(0);

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(false);
      });

      it('should handle negative maxUpgrades', () => {
        mockItemPropertyGet.mockReturnValue(-1);

        const result = itemCanBeUpgraded(mockBaseItem);

        expect(result).toBe(false);
      });
    });

    describe('default parameter behavior', () => {
      it('should default to bypassLimit = false when not provided', () => {
        mockItemPropertyGet.mockReturnValue(1);

        const result = itemCanBeUpgraded(mockBaseItem); // No second parameter

        expect(mockItemPropertyGet).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should treat explicit false same as default', () => {
        mockItemPropertyGet.mockReturnValue(1);

        const resultDefault = itemCanBeUpgraded(mockBaseItem);
        const resultExplicit = itemCanBeUpgraded(mockBaseItem, false);

        expect(resultDefault).toBe(resultExplicit);
        expect(mockItemPropertyGet).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('itemMarkIdentified', () => {
    it('should set identifyTier to the provided tier when current tier is lower', () => {
      const itemWithLowTier = {
        uuid: 'low-tier-uuid',
        name: 'Low Tier Item',
        mods: {
          identifyTier: 1,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithLowTier, 3);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithLowTier,
        'identifyTier',
        3,
      );
    });

    it('should keep current identifyTier when provided tier is lower', () => {
      const itemWithHighTier = {
        uuid: 'high-tier-uuid',
        name: 'High Tier Item',
        mods: {
          identifyTier: 5,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithHighTier, 3);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithHighTier,
        'identifyTier',
        5,
      );
    });

    it('should set identifyTier to the provided tier when both tiers are equal', () => {
      const itemWithEqualTier = {
        uuid: 'equal-tier-uuid',
        name: 'Equal Tier Item',
        mods: {
          identifyTier: 3,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithEqualTier, 3);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithEqualTier,
        'identifyTier',
        3,
      );
    });

    it('should handle items with no identifyTier (undefined)', () => {
      const itemWithoutTier = {
        uuid: 'no-tier-uuid',
        name: 'No Tier Item',
        mods: {},
      } as ISimpleItem;

      itemMarkIdentified(itemWithoutTier, 2);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithoutTier,
        'identifyTier',
        2,
      );
    });

    it('should handle items with null identifyTier', () => {
      const itemWithNullTier = {
        uuid: 'null-tier-uuid',
        name: 'Null Tier Item',
        mods: {
          identifyTier: null,
        },
      } as any;

      itemMarkIdentified(itemWithNullTier, 4);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithNullTier,
        'identifyTier',
        4,
      );
    });

    it('should handle zero identifyTier', () => {
      const itemWithZeroTier = {
        uuid: 'zero-tier-uuid',
        name: 'Zero Tier Item',
        mods: {
          identifyTier: 0,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithZeroTier, 1);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithZeroTier,
        'identifyTier',
        1,
      );
    });

    it('should handle negative identifyTier', () => {
      const itemWithNegativeTier = {
        uuid: 'negative-tier-uuid',
        name: 'Negative Tier Item',
        mods: {
          identifyTier: -2,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithNegativeTier, 1);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithNegativeTier,
        'identifyTier',
        1,
      );
    });

    it('should handle zero tier parameter', () => {
      const itemWithTier = {
        uuid: 'some-item-uuid',
        name: 'Some Item',
        mods: {
          identifyTier: 2,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithTier, 0);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithTier,
        'identifyTier',
        2,
      );
    });

    it('should handle negative tier parameter', () => {
      const itemWithTier = {
        name: 'Some Item',
        mods: {
          identifyTier: 1,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithTier, -1);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithTier,
        'identifyTier',
        1,
      );
    });

    it('should handle large tier values', () => {
      const itemWithTier = {
        name: 'Some Item',
        mods: {
          identifyTier: 100,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithTier, 999);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithTier,
        'identifyTier',
        999,
      );
    });

    it('should handle fractional tier values', () => {
      const itemWithTier = {
        name: 'Some Item',
        mods: {
          identifyTier: 1.5,
        },
      } as ISimpleItem;

      itemMarkIdentified(itemWithTier, 2.7);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        itemWithTier,
        'identifyTier',
        2.7,
      );
    });

    it('should call itemPropertySet exactly once', () => {
      itemMarkIdentified(mockBaseItem, 1);

      expect(mockItemPropertySet).toHaveBeenCalledTimes(1);
    });

    it('should work with different items', () => {
      const differentItem = {
        name: 'Different Item',
        mods: {
          identifyTier: 0,
        },
      } as ISimpleItem;

      itemMarkIdentified(differentItem, 3);

      expect(mockItemPropertySet).toHaveBeenCalledWith(
        differentItem,
        'identifyTier',
        3,
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle all functions working together', () => {
      // Test a complete upgrade workflow
      const baseWeapon = {
        uuid: 'base-weapon-uuid',
        name: 'Iron Sword',
        mods: {
          upgrades: [],
          identifyTier: 0,
        },
      } as ISimpleItem;

      const upgradeGem = {
        uuid: 'upgrade-gem-uuid',
        name: 'Power Crystal',
        mods: {},
      } as ISimpleItem;

      // Setup mocks
      mockItemPropertyGet.mockReturnValue(true); // Can be used for upgrade
      mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 3 }); // Max 3 upgrades

      // Test upgrade capability
      expect(itemCanBeUsedForUpgrade(upgradeGem)).toBe(true);
      expect(itemCanBeUpgraded(baseWeapon)).toBe(true);

      // Test encrusting
      itemSetEncrust(baseWeapon, upgradeGem);
      expect(mockItemPropertySet).toHaveBeenCalledWith(
        baseWeapon,
        'encrustItem',
        'Power Crystal',
      );

      // Test identification
      itemMarkIdentified(baseWeapon, 2);
      expect(mockItemPropertySet).toHaveBeenCalledWith(
        baseWeapon,
        'identifyTier',
        2,
      );
    });

    it('should handle edge cases in workflow', () => {
      const corruptedItem = {
        name: '',
        mods: {
          upgrades: null,
          identifyTier: undefined,
        },
      } as any;

      const brokenUpgrade = {
        name: 'Broken Stone',
        mods: {},
      } as ISimpleItem;

      // Setup mocks for failure cases
      mockItemPropertyGet.mockReturnValue(false);
      mockItemPropertiesGet.mockReturnValue({ maxUpgrades: 0 });

      // Test with problematic items
      expect(itemCanBeUsedForUpgrade(brokenUpgrade)).toBe(false);
      expect(itemCanBeUpgraded(corruptedItem)).toBe(false);

      // These should still work despite problematic input
      itemSetEncrust(corruptedItem, brokenUpgrade);
      itemMarkIdentified(corruptedItem, 1);

      expect(mockItemPropertySet).toHaveBeenCalledTimes(2);
    });
  });
});
