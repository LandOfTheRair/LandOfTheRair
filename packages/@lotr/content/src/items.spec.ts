import type { IItemDefinition } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  itemAllGet,
  itemCustomAdd,
  itemCustomClearMap,
  itemExists,
  itemGet,
  itemGetMatchingName,
} from './items';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

vi.mock('lodash', () => ({
  cloneDeep: vi.fn((obj) => JSON.parse(JSON.stringify(obj))), // Simple deep clone for testing
}));

describe('Items Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;
  let mockCloneDeep: any;

  // Sample item definitions for testing
  const sampleItem: IItemDefinition = {
    name: 'Test Sword',
    type: 'Weapon',
    tier: 1,
  } as IItemDefinition;

  const anotherItem: IItemDefinition = {
    name: 'Magic Shield',
    type: 'Armor',
    tier: 2,
  } as IItemDefinition;

  const forestItem: IItemDefinition = {
    name: 'Forest Bow',
    type: 'Weapon',
    tier: 1,
  } as IItemDefinition;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');
    const lodash = await import('lodash');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
    mockCloneDeep = vi.mocked(lodash.cloneDeep);
  });

  describe('itemCustomAdd', () => {
    it('should add a custom item for a map', () => {
      itemCustomAdd('test-map', sampleItem);

      // Verify item was added by checking itemExists
      mockGetContentKey.mockReturnValue({});
      expect(itemExists('Test Sword')).toBe(true);
    });

    it('should add multiple custom items for the same map', () => {
      itemCustomAdd('dungeon-1', sampleItem);
      itemCustomAdd('dungeon-1', anotherItem);

      mockGetContentKey.mockReturnValue({});
      expect(itemExists('Test Sword')).toBe(true);
      expect(itemExists('Magic Shield')).toBe(true);
    });

    it('should add items for different maps independently', () => {
      itemCustomAdd('map1', sampleItem);
      itemCustomAdd('map2', anotherItem);

      mockGetContentKey.mockReturnValue({});
      expect(itemExists('Test Sword')).toBe(true);
      expect(itemExists('Magic Shield')).toBe(true);
    });

    it('should overwrite existing custom item with same name', () => {
      const originalItem: IItemDefinition = {
        name: 'Duplicate Name',
        type: 'Weapon',
        tier: 1,
      } as IItemDefinition;

      const updatedItem: IItemDefinition = {
        name: 'Duplicate Name',
        type: 'Armor',
        tier: 2,
      } as IItemDefinition;

      itemCustomAdd('test-map', originalItem);
      itemCustomAdd('test-map', updatedItem);

      mockGetContentKey.mockReturnValue({});
      const retrieved = itemGet('Duplicate Name');

      expect(retrieved).toEqual(updatedItem);
      expect(retrieved?.type).toBe('Armor');
    });

    it('should handle items with complex properties', () => {
      const complexItem: IItemDefinition = {
        name: 'Complex Item',
        type: 'Weapon',
        tier: 3,
        stats: { str: 10, dex: 5 },
        requirements: { level: 20 },
        enchantments: [{ name: 'fire', level: 2 }],
      } as any;

      itemCustomAdd('complex-map', complexItem);

      mockGetContentKey.mockReturnValue({});
      const retrieved = itemGet('Complex Item');

      expect(retrieved).toEqual(complexItem);
    });
  });

  describe('itemCustomClearMap', () => {
    it('should remove all custom items for a specific map', () => {
      // Add items to multiple maps
      itemCustomAdd('map-to-clear', sampleItem);
      itemCustomAdd('map-to-clear', anotherItem);
      itemCustomAdd('other-map', forestItem);

      mockGetContentKey.mockReturnValue({});

      // Verify items exist before clearing
      expect(itemExists('Test Sword')).toBe(true);
      expect(itemExists('Magic Shield')).toBe(true);
      expect(itemExists('Forest Bow')).toBe(true);

      // Clear one map
      itemCustomClearMap('map-to-clear');

      // Items from cleared map should be gone
      expect(itemExists('Test Sword')).toBe(false);
      expect(itemExists('Magic Shield')).toBe(false);

      // Items from other maps should remain
      expect(itemExists('Forest Bow')).toBe(true);
    });

    it('should handle clearing a map with no custom items', () => {
      itemCustomClearMap('empty-map');

      // Should not throw or cause issues
      mockGetContentKey.mockReturnValue({});
      expect(itemExists('nonexistent-item')).toBe(false);
    });

    it('should handle clearing a nonexistent map', () => {
      itemCustomClearMap('nonexistent-map');

      // Should not throw or cause issues
      expect(() => itemCustomClearMap('nonexistent-map')).not.toThrow();
    });

    it('should only affect the specified map', () => {
      itemCustomAdd('map1', sampleItem);
      itemCustomAdd('map2', anotherItem);
      itemCustomAdd('map3', forestItem);

      mockGetContentKey.mockReturnValue({});

      itemCustomClearMap('map2');

      expect(itemExists('Test Sword')).toBe(true); // map1 item remains
      expect(itemExists('Magic Shield')).toBe(false); // map2 item removed
      expect(itemExists('Forest Bow')).toBe(true); // map3 item remains
    });
  });

  describe('itemAllGet', () => {
    it('should return all base items from content', () => {
      const baseItems = {
        'base-sword': { name: 'Base Sword', type: 'Weapon' },
        'base-armor': { name: 'Base Armor', type: 'Armor' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemAllGet();

      expect(mockGetContentKey).toHaveBeenCalledWith('items');
      expect(result).toEqual(baseItems);
    });

    it('should return empty object when no base items exist', () => {
      mockGetContentKey.mockReturnValue({});

      const result = itemAllGet();

      expect(result).toEqual({});
    });
  });

  describe('itemGet', () => {
    it('should return custom item when available', () => {
      itemCustomAdd('test-map', sampleItem);
      mockGetContentKey.mockReturnValue({});

      const result = itemGet('Test Sword');

      expect(result).toEqual(sampleItem);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return base item when no custom item exists', () => {
      const baseItems = {
        'Base Item': { name: 'Base Item', type: 'Weapon' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemGet('Base Item');

      expect(result).toEqual(baseItems['Base Item']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should prioritize custom items over base items', () => {
      const baseItems = {
        'Conflict Item': { name: 'Conflict Item', type: 'Base', tier: 1 },
      };
      const customItem: IItemDefinition = {
        name: 'Conflict Item',
        type: 'Custom',
        tier: 2,
      } as IItemDefinition;

      itemCustomAdd('test-map', customItem);
      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemGet('Conflict Item');

      expect(result).toEqual(customItem);
      expect(result?.type).toBe('Custom');
    });

    it('should log error and return undefined for nonexistent items', () => {
      mockGetContentKey.mockReturnValue({});

      const result = itemGet('Nonexistent Item');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Item:Nonexistent Item',
        expect.any(Error),
      );
    });

    it('should handle item names with special characters', () => {
      const specialItem: IItemDefinition = {
        name: 'Item-with_special.chars!',
        type: 'Weapon',
        tier: 1,
      } as IItemDefinition;

      itemCustomAdd('test-map', specialItem);
      mockGetContentKey.mockReturnValue({});

      const result = itemGet('Item-with_special.chars!');

      expect(result).toEqual(specialItem);
    });
  });

  describe('itemExists', () => {
    it('should return true for existing custom items', () => {
      itemCustomAdd('test-map', sampleItem);
      mockGetContentKey.mockReturnValue({});

      expect(itemExists('Test Sword')).toBe(true);
    });

    it('should return true for existing base items', () => {
      const baseItems = {
        'Base Item': { name: 'Base Item', type: 'Weapon' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      expect(itemExists('Base Item')).toBe(true);
    });

    it('should return false for nonexistent items', () => {
      mockGetContentKey.mockReturnValue({});

      expect(itemExists('Nonexistent Item')).toBe(false);
    });

    it('should prioritize custom items in existence check', () => {
      const baseItems = {
        Duplicate: { name: 'Duplicate', type: 'Base' },
      };
      const customItem: IItemDefinition = {
        name: 'Duplicate',
        type: 'Custom',
        tier: 1,
      } as IItemDefinition;

      itemCustomAdd('test-map', customItem);
      mockGetContentKey.mockReturnValue(baseItems);

      expect(itemExists('Duplicate')).toBe(true);
    });

    it('should handle empty item collections', () => {
      mockGetContentKey.mockReturnValue({});

      expect(itemExists('Any Item')).toBe(false);
    });
  });

  describe('itemGetMatchingName', () => {
    it('should return items whose names contain the search term', () => {
      const baseItems = {
        'Forest Sword': { name: 'Forest Sword', type: 'Weapon' },
        'Forest Bow': { name: 'Forest Bow', type: 'Weapon' },
        'Desert Shield': { name: 'Desert Shield', type: 'Armor' },
        'Forest Staff': { name: 'Forest Staff', type: 'Weapon' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemGetMatchingName('Forest');

      expect(result).toHaveLength(3);
      expect(result.map((item) => item.name)).toEqual([
        'Forest Sword',
        'Forest Bow',
        'Forest Staff',
      ]);
    });

    it('should return cloned items, not references', () => {
      const baseItems = {
        'Test Item': { name: 'Test Item', type: 'Weapon' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemGetMatchingName('Test');

      expect(mockCloneDeep).toHaveBeenCalledWith(baseItems['Test Item']);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no matches found', () => {
      const baseItems = {
        Sword: { name: 'Sword', type: 'Weapon' },
        Shield: { name: 'Shield', type: 'Armor' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemGetMatchingName('Nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle partial name matches correctly', () => {
      const baseItems = {
        'Fire Sword': { name: 'Fire Sword', type: 'Weapon' },
        Campfire: { name: 'Campfire', type: 'Tool' },
        'Fireproof Armor': { name: 'Fireproof Armor', type: 'Armor' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const result = itemGetMatchingName('Fire');

      expect(result).toHaveLength(2);
      expect(result.map((item) => item.name)).toEqual([
        'Fire Sword',
        'Fireproof Armor',
      ]);
    });

    it('should handle empty base items collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = itemGetMatchingName('anything');

      expect(result).toEqual([]);
    });

    it('should be case sensitive in search', () => {
      const baseItems = {
        'Forest Sword': { name: 'Forest Sword', type: 'Weapon' },
        'forest bow': { name: 'forest bow', type: 'Weapon' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      const upperResult = itemGetMatchingName('Forest');
      const lowerResult = itemGetMatchingName('forest');

      expect(upperResult).toHaveLength(1);
      expect(upperResult[0].name).toBe('Forest Sword');

      expect(lowerResult).toHaveLength(1);
      expect(lowerResult[0].name).toBe('forest bow');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex workflow of adding, retrieving, and clearing items', () => {
      // Add items to different maps
      itemCustomAdd('map1', sampleItem);
      itemCustomAdd('map1', anotherItem);
      itemCustomAdd('map2', forestItem);

      mockGetContentKey.mockReturnValue({
        'Base Item': { name: 'Base Item', type: 'Base' },
      });

      // Check all items exist
      expect(itemExists('Test Sword')).toBe(true);
      expect(itemExists('Magic Shield')).toBe(true);
      expect(itemExists('Forest Bow')).toBe(true);
      expect(itemExists('Base Item')).toBe(true);

      // Clear one map
      itemCustomClearMap('map1');

      // Check correct items are removed
      expect(itemExists('Test Sword')).toBe(false);
      expect(itemExists('Magic Shield')).toBe(false);
      expect(itemExists('Forest Bow')).toBe(true);
      expect(itemExists('Base Item')).toBe(true);
    });

    it('should work correctly with custom and base items mixed', () => {
      const baseItems = {
        'Base Sword': { name: 'Base Sword', type: 'Weapon' },
        'Base Armor': { name: 'Base Armor', type: 'Armor' },
      };

      itemCustomAdd('test-map', sampleItem);
      mockGetContentKey.mockReturnValue(baseItems);

      // Should find both custom and base items
      expect(itemExists('Test Sword')).toBe(true);
      expect(itemExists('Base Sword')).toBe(true);

      // Should retrieve correct items
      expect(itemGet('Test Sword')).toEqual(sampleItem);
      expect(itemGet('Base Sword')).toEqual(baseItems['Base Sword']);

      // Should return all matches for name search
      const swordMatches = itemGetMatchingName('Sword');
      expect(swordMatches).toHaveLength(1);
    });

    it('should maintain data consistency after multiple operations', () => {
      // Complex scenario with overlapping names and operations
      const baseItems = {
        'Common Item': { name: 'Common Item', type: 'Base' },
      };

      mockGetContentKey.mockReturnValue(baseItems);

      // Add custom item with same name
      const customCommon: IItemDefinition = {
        name: 'Common Item',
        type: 'Custom',
        tier: 1,
      } as IItemDefinition;

      itemCustomAdd('override-map', customCommon);

      // Custom should override base
      expect(itemGet('Common Item')).toEqual(customCommon);

      // Clear custom items
      itemCustomClearMap('override-map');

      // Should fall back to base item
      expect(itemGet('Common Item')).toEqual(baseItems['Common Item']);
    });
  });
});
