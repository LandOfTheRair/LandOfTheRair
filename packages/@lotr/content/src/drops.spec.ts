import type { Rollable } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  droptableCustomMapAdd,
  droptableCustomRegionAdd,
  droptableMapGet,
  droptableRegionGet,
} from './drops';

// Mock the allcontent module
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

describe('Drops Functions', () => {
  let mockGetContentKey: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const { getContentKey } = await import('./allcontent');
    mockGetContentKey = vi.mocked(getContentKey);
  });

  describe('droptableCustomRegionAdd', () => {
    it('should add custom drops for a region', () => {
      const testDrops: Rollable[] = [
        { result: 'Gold Coin', chance: 1, maxChance: 100 },
        { result: 'Silver Ring', chance: 5, maxChance: 100 },
      ];

      droptableCustomRegionAdd('forest-region', testDrops);

      // Test that the custom region is added by trying to get it
      mockGetContentKey.mockReturnValue({});
      const result = droptableRegionGet('forest-region');

      expect(result.drops).toEqual(testDrops);
    });

    it('should replace existing custom region drops', () => {
      const firstDrops: Rollable[] = [
        { result: 'Old Item', chance: 1, maxChance: 100 },
      ];
      const secondDrops: Rollable[] = [
        { result: 'New Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomRegionAdd('test-region', firstDrops);
      droptableCustomRegionAdd('test-region', secondDrops);

      mockGetContentKey.mockReturnValue({});
      const result = droptableRegionGet('test-region');

      expect(result.drops).toEqual(secondDrops);
    });

    it('should handle empty drops array', () => {
      droptableCustomRegionAdd('empty-region', []);

      mockGetContentKey.mockReturnValue({});
      const result = droptableRegionGet('empty-region');

      expect(result.drops).toEqual([]);
    });

    it('should handle multiple regions independently', () => {
      const forestDrops: Rollable[] = [
        { result: 'Wood', chance: 1, maxChance: 10 },
      ];
      const desertDrops: Rollable[] = [
        { result: 'Sand', chance: 1, maxChance: 10 },
      ];

      droptableCustomRegionAdd('forest', forestDrops);
      droptableCustomRegionAdd('desert', desertDrops);

      mockGetContentKey.mockReturnValue({});

      expect(droptableRegionGet('forest').drops).toEqual(forestDrops);
      expect(droptableRegionGet('desert').drops).toEqual(desertDrops);
    });
  });

  describe('droptableCustomMapAdd', () => {
    it('should add custom drops for a map', () => {
      const testDrops: Rollable[] = [
        { result: 'Map Specific Item', chance: 1, maxChance: 50 },
        { result: 'Rare Gem', chance: 10, maxChance: 100 },
      ];

      droptableCustomMapAdd('dungeon-level-1', testDrops);

      mockGetContentKey.mockReturnValue({});
      const result = droptableMapGet('dungeon-level-1');

      expect(result.drops).toEqual(testDrops);
    });

    it('should replace existing custom map drops', () => {
      const firstDrops: Rollable[] = [
        { result: 'Old Map Item', chance: 1, maxChance: 100 },
      ];
      const secondDrops: Rollable[] = [
        { result: 'New Map Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomMapAdd('test-map', firstDrops);
      droptableCustomMapAdd('test-map', secondDrops);

      mockGetContentKey.mockReturnValue({});
      const result = droptableMapGet('test-map');

      expect(result.drops).toEqual(secondDrops);
    });

    it('should handle empty drops array for maps', () => {
      droptableCustomMapAdd('empty-map', []);

      mockGetContentKey.mockReturnValue({});
      const result = droptableMapGet('empty-map');

      expect(result.drops).toEqual([]);
    });

    it('should handle multiple maps independently', () => {
      const map1Drops: Rollable[] = [
        { result: 'Map1 Item', chance: 1, maxChance: 10 },
      ];
      const map2Drops: Rollable[] = [
        { result: 'Map2 Item', chance: 1, maxChance: 10 },
      ];

      droptableCustomMapAdd('map1', map1Drops);
      droptableCustomMapAdd('map2', map2Drops);

      mockGetContentKey.mockReturnValue({});

      expect(droptableMapGet('map1').drops).toEqual(map1Drops);
      expect(droptableMapGet('map2').drops).toEqual(map2Drops);
    });
  });

  describe('droptableRegionGet', () => {
    it('should return custom region drops when available', () => {
      const customDrops: Rollable[] = [
        { result: 'Custom Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomRegionAdd('custom-region', customDrops);
      mockGetContentKey.mockReturnValue({});

      const result = droptableRegionGet('custom-region');

      expect(result.drops).toEqual(customDrops);
      expect(mockGetContentKey).toHaveBeenCalledWith('regionDroptables');
    });

    it('should return base region drops when no custom drops exist', () => {
      const baseDrops = {
        'base-region': {
          drops: [{ result: 'Base Item', chance: 1, maxChance: 100 }],
        },
      };

      mockGetContentKey.mockReturnValue(baseDrops);

      const result = droptableRegionGet('base-region');

      expect(result.drops).toEqual(baseDrops['base-region'].drops);
      expect(mockGetContentKey).toHaveBeenCalledWith('regionDroptables');
    });

    it('should prioritize custom drops over base drops', () => {
      const baseDrops = {
        'conflict-region': {
          drops: [{ result: 'Base Item', chance: 1, maxChance: 100 }],
        },
      };
      const customDrops: Rollable[] = [
        { result: 'Custom Override Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomRegionAdd('conflict-region', customDrops);
      mockGetContentKey.mockReturnValue(baseDrops);

      const result = droptableRegionGet('conflict-region');

      expect(result.drops).toEqual(customDrops);
    });

    it('should return empty drops for unknown regions', () => {
      mockGetContentKey.mockReturnValue({});

      const result = droptableRegionGet('nonexistent-region');

      expect(result.drops).toEqual([]);
    });

    it('should handle regions with complex drop structures', () => {
      const complexDrops: Rollable[] = [
        { result: 'Common Item', chance: 70, maxChance: 100 },
        { result: 'Uncommon Item', chance: 25, maxChance: 100 },
        { result: 'Rare Item', chance: 5, maxChance: 100 },
      ];

      droptableCustomRegionAdd('complex-region', complexDrops);
      mockGetContentKey.mockReturnValue({});

      const result = droptableRegionGet('complex-region');

      expect(result.drops).toHaveLength(3);
      expect(result.drops).toEqual(complexDrops);
    });
  });

  describe('droptableMapGet', () => {
    it('should return custom map drops when available', () => {
      const customDrops: Rollable[] = [
        { result: 'Custom Map Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomMapAdd('custom-map', customDrops);
      mockGetContentKey.mockReturnValue({});

      const result = droptableMapGet('custom-map');

      expect(result.drops).toEqual(customDrops);
      expect(mockGetContentKey).toHaveBeenCalledWith('mapDroptables');
    });

    it('should return base map drops when no custom drops exist', () => {
      const baseDrops = {
        'base-map': {
          drops: [{ result: 'Base Map Item', chance: 1, maxChance: 100 }],
        },
      };

      mockGetContentKey.mockReturnValue(baseDrops);

      const result = droptableMapGet('base-map');

      expect(result.drops).toEqual(baseDrops['base-map'].drops);
      expect(mockGetContentKey).toHaveBeenCalledWith('mapDroptables');
    });

    it('should prioritize custom drops over base drops for maps', () => {
      const baseDrops = {
        'conflict-map': {
          drops: [{ result: 'Base Map Item', chance: 1, maxChance: 100 }],
        },
      };
      const customDrops: Rollable[] = [
        { result: 'Custom Override Map Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomMapAdd('conflict-map', customDrops);
      mockGetContentKey.mockReturnValue(baseDrops);

      const result = droptableMapGet('conflict-map');

      expect(result.drops).toEqual(customDrops);
    });

    it('should return empty drops for unknown maps', () => {
      mockGetContentKey.mockReturnValue({});

      const result = droptableMapGet('nonexistent-map');

      expect(result.drops).toEqual([]);
    });

    it('should handle maps with multiple drop types', () => {
      const multiDrops: Rollable[] = [
        { result: 'Gold', chance: 50, maxChance: 100 },
        { result: 'Equipment', chance: 30, maxChance: 100 },
        { result: 'Consumable', chance: 15, maxChance: 100 },
        { result: 'Rare Material', chance: 5, maxChance: 100 },
      ];

      droptableCustomMapAdd('multi-drop-map', multiDrops);
      mockGetContentKey.mockReturnValue({});

      const result = droptableMapGet('multi-drop-map');

      expect(result.drops).toHaveLength(4);
      expect(result.drops).toEqual(multiDrops);
    });
  });

  describe('Integration Tests', () => {
    it('should handle both region and map drops independently', () => {
      const regionDrops: Rollable[] = [
        { result: 'Region Item', chance: 1, maxChance: 100 },
      ];
      const mapDrops: Rollable[] = [
        { result: 'Map Item', chance: 1, maxChance: 100 },
      ];

      droptableCustomRegionAdd('test-region', regionDrops);
      droptableCustomMapAdd('test-map', mapDrops);

      mockGetContentKey.mockReturnValue({});

      expect(droptableRegionGet('test-region').drops).toEqual(regionDrops);
      expect(droptableMapGet('test-map').drops).toEqual(mapDrops);
    });

    it('should maintain separate state for regions vs maps with same name', () => {
      const regionDrops: Rollable[] = [
        { result: 'Region Version', chance: 1, maxChance: 100 },
      ];
      const mapDrops: Rollable[] = [
        { result: 'Map Version', chance: 1, maxChance: 100 },
      ];

      droptableCustomRegionAdd('same-name', regionDrops);
      droptableCustomMapAdd('same-name', mapDrops);

      mockGetContentKey.mockReturnValue({});

      const regionResult = droptableRegionGet('same-name');
      const mapResult = droptableMapGet('same-name');

      expect(regionResult.drops).toEqual(regionDrops);
      expect(mapResult.drops).toEqual(mapDrops);
      expect(regionResult.drops).not.toEqual(mapResult.drops);
    });

    it('should work correctly after multiple operations', () => {
      // Add initial drops
      droptableCustomRegionAdd('region1', [
        { result: 'Initial', chance: 1, maxChance: 100 },
      ]);
      droptableCustomMapAdd('map1', [
        { result: 'Initial', chance: 1, maxChance: 100 },
      ]);

      // Update drops
      const newRegionDrops: Rollable[] = [
        { result: 'Updated Region', chance: 1, maxChance: 100 },
      ];
      const newMapDrops: Rollable[] = [
        { result: 'Updated Map', chance: 1, maxChance: 100 },
      ];

      droptableCustomRegionAdd('region1', newRegionDrops);
      droptableCustomMapAdd('map1', newMapDrops);

      mockGetContentKey.mockReturnValue({});

      expect(droptableRegionGet('region1').drops).toEqual(newRegionDrops);
      expect(droptableMapGet('map1').drops).toEqual(newMapDrops);
    });
  });
});
