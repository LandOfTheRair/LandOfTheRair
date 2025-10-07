import type { ISpawnerData } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  spawnerAllGet,
  spawnerCustomAdd,
  spawnerCustomClearMap,
  spawnerExists,
  spawnerGet,
} from './spawners';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Spawners Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;

  // Sample spawner definitions for testing
  const sampleSpawner: ISpawnerData = {
    tag: 'orc-spawner',
    npcIds: ['orc-warrior', 'orc-archer'],
    maxCreatures: 5,
    respawnRate: 300,
  } as ISpawnerData;

  const anotherSpawner: ISpawnerData = {
    tag: 'goblin-spawner',
    npcIds: ['goblin-scout'],
    maxCreatures: 3,
    respawnRate: 180,
  } as ISpawnerData;

  const bossSpawner: ISpawnerData = {
    tag: 'dragon-boss-spawner',
    npcIds: ['ancient-dragon'],
    maxCreatures: 1,
    respawnRate: 3600,
  } as ISpawnerData;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('spawnerCustomAdd', () => {
    it('should add a custom spawner for a map', () => {
      spawnerCustomAdd('test-map', 'orc-spawner', sampleSpawner);

      // Verify spawner was added by checking spawnerExists
      mockGetContentKey.mockReturnValue({});
      expect(spawnerExists('orc-spawner')).toBe(true);
    });

    it('should add multiple custom spawners for the same map', () => {
      spawnerCustomAdd('dungeon-1', 'orc-spawner', sampleSpawner);
      spawnerCustomAdd('dungeon-1', 'goblin-spawner', anotherSpawner);

      mockGetContentKey.mockReturnValue({});
      expect(spawnerExists('orc-spawner')).toBe(true);
      expect(spawnerExists('goblin-spawner')).toBe(true);
    });

    it('should add spawners for different maps independently', () => {
      spawnerCustomAdd('map1', 'orc-spawner', sampleSpawner);
      spawnerCustomAdd('map2', 'goblin-spawner', anotherSpawner);

      mockGetContentKey.mockReturnValue({});
      expect(spawnerExists('orc-spawner')).toBe(true);
      expect(spawnerExists('goblin-spawner')).toBe(true);
    });

    it('should overwrite existing custom spawner with same tag', () => {
      const originalSpawner: ISpawnerData = {
        tag: 'duplicate-tag',
        npcIds: ['old-npc'],
        maxCreatures: 2,
        respawnRate: 100,
      } as ISpawnerData;

      const updatedSpawner: ISpawnerData = {
        tag: 'duplicate-tag',
        npcIds: ['new-npc'],
        maxCreatures: 5,
        respawnRate: 200,
      } as ISpawnerData;

      spawnerCustomAdd('test-map', 'duplicate-tag', originalSpawner);
      spawnerCustomAdd('test-map', 'duplicate-tag', updatedSpawner);

      mockGetContentKey.mockReturnValue({});
      const retrieved = spawnerGet('duplicate-tag');

      expect(retrieved).toEqual(updatedSpawner);
      expect(retrieved?.maxCreatures).toBe(5);
    });

    it('should handle spawners with complex properties', () => {
      const complexSpawner: ISpawnerData = {
        tag: 'complex-spawner',
        npcIds: ['elite-guard', 'captain'],
        maxCreatures: 10,
        respawnRate: 600,
        requireDeadToRespawn: true,
        shouldSerialize: false,
        x: 100,
        y: 200,
      } as any;

      spawnerCustomAdd('complex-map', 'complex-spawner', complexSpawner);

      mockGetContentKey.mockReturnValue({});
      const retrieved = spawnerGet('complex-spawner');

      expect(retrieved).toEqual(complexSpawner);
    });

    it('should handle spawners with special characters in tag', () => {
      const specialSpawner: ISpawnerData = {
        tag: 'spawner-with_special.chars!',
        npcIds: ['special-npc'],
        maxCreatures: 1,
        respawnRate: 300,
      } as ISpawnerData;

      spawnerCustomAdd(
        'test-map',
        'spawner-with_special.chars!',
        specialSpawner,
      );

      mockGetContentKey.mockReturnValue({});
      expect(spawnerExists('spawner-with_special.chars!')).toBe(true);
    });

    it('should handle spawners with multiple NPCs', () => {
      const multiSpawner: ISpawnerData = {
        tag: 'multi-npc-spawner',
        npcIds: ['warrior', 'archer', 'mage', 'healer'],
        maxCreatures: 8,
        respawnRate: 450,
      } as ISpawnerData;

      spawnerCustomAdd('multi-map', 'multi-npc-spawner', multiSpawner);

      mockGetContentKey.mockReturnValue({});
      const retrieved = spawnerGet('multi-npc-spawner');

      expect(retrieved?.npcIds).toHaveLength(4);
      expect(retrieved?.npcIds).toContain('warrior');
      expect(retrieved?.npcIds).toContain('healer');
    });
  });

  describe('spawnerCustomClearMap', () => {
    it('should remove all custom spawners for a specific map', () => {
      // Add spawners to multiple maps
      spawnerCustomAdd('map-to-clear', 'orc-spawner', sampleSpawner);
      spawnerCustomAdd('map-to-clear', 'goblin-spawner', anotherSpawner);
      spawnerCustomAdd('other-map', 'dragon-boss-spawner', bossSpawner);

      mockGetContentKey.mockReturnValue({});

      // Verify spawners exist before clearing
      expect(spawnerExists('orc-spawner')).toBe(true);
      expect(spawnerExists('goblin-spawner')).toBe(true);
      expect(spawnerExists('dragon-boss-spawner')).toBe(true);

      // Clear one map
      spawnerCustomClearMap('map-to-clear');

      // Spawners from cleared map should be gone
      expect(spawnerExists('orc-spawner')).toBe(false);
      expect(spawnerExists('goblin-spawner')).toBe(false);

      // Spawners from other maps should remain
      expect(spawnerExists('dragon-boss-spawner')).toBe(true);
    });

    it('should handle clearing a map with no custom spawners', () => {
      spawnerCustomClearMap('empty-map');

      // Should not throw or cause issues
      mockGetContentKey.mockReturnValue({});
      expect(spawnerExists('nonexistent-spawner')).toBe(false);
    });

    it('should handle clearing a nonexistent map', () => {
      expect(() => spawnerCustomClearMap('nonexistent-map')).not.toThrow();
    });

    it('should only affect the specified map', () => {
      spawnerCustomAdd('map1', 'spawner1', sampleSpawner);
      spawnerCustomAdd('map2', 'spawner2', anotherSpawner);
      spawnerCustomAdd('map3', 'spawner3', bossSpawner);

      mockGetContentKey.mockReturnValue({});

      spawnerCustomClearMap('map2');

      expect(spawnerExists('spawner1')).toBe(true); // map1 spawner remains
      expect(spawnerExists('spawner2')).toBe(false); // map2 spawner removed
      expect(spawnerExists('spawner3')).toBe(true); // map3 spawner remains
    });

    it('should handle multiple clear operations', () => {
      spawnerCustomAdd('map1', 'spawner1', sampleSpawner);
      spawnerCustomAdd('map2', 'spawner2', anotherSpawner);

      mockGetContentKey.mockReturnValue({});

      spawnerCustomClearMap('map1');
      spawnerCustomClearMap('map2');
      spawnerCustomClearMap('map1'); // Clear already empty map

      expect(spawnerExists('spawner1')).toBe(false);
      expect(spawnerExists('spawner2')).toBe(false);
    });
  });

  describe('spawnerAllGet', () => {
    it('should return all base spawners from content', () => {
      const baseSpawners = {
        'base-orc-spawner': {
          tag: 'base-orc-spawner',
          npcIds: ['base-orc'],
          maxCreatures: 3,
          respawnRate: 300,
        },
        'base-goblin-spawner': {
          tag: 'base-goblin-spawner',
          npcIds: ['base-goblin'],
          maxCreatures: 2,
          respawnRate: 200,
        },
      };

      mockGetContentKey.mockReturnValue(baseSpawners);

      const result = spawnerAllGet();

      expect(mockGetContentKey).toHaveBeenCalledWith('spawners');
      expect(result).toEqual(baseSpawners);
    });

    it('should return empty object when no base spawners exist', () => {
      mockGetContentKey.mockReturnValue({});

      const result = spawnerAllGet();

      expect(result).toEqual({});
    });

    it('should call getContentKey with correct parameter', () => {
      mockGetContentKey.mockReturnValue({});

      spawnerAllGet();

      expect(mockGetContentKey).toHaveBeenCalledWith('spawners');
      expect(mockGetContentKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('spawnerGet', () => {
    it('should return custom spawner when available', () => {
      spawnerCustomAdd('test-map', 'orc-spawner', sampleSpawner);
      mockGetContentKey.mockReturnValue({});

      const result = spawnerGet('orc-spawner');

      expect(result).toEqual(sampleSpawner);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return base spawner when no custom spawner exists', () => {
      const baseSpawners = {
        'base-spawner': {
          tag: 'base-spawner',
          npcIds: ['base-npc'],
          maxCreatures: 5,
          respawnRate: 400,
        },
      };

      mockGetContentKey.mockReturnValue(baseSpawners);

      const result = spawnerGet('base-spawner');

      expect(result).toEqual(baseSpawners['base-spawner']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should prioritize custom spawners over base spawners', () => {
      const baseSpawners = {
        'conflict-spawner': {
          tag: 'conflict-spawner',
          npcIds: ['base-npc'],
          maxCreatures: 3,
          respawnRate: 300,
        },
      };
      const customSpawner: ISpawnerData = {
        tag: 'conflict-spawner',
        npcIds: ['custom-npc'],
        maxCreatures: 7,
        respawnRate: 500,
      } as ISpawnerData;

      spawnerCustomAdd('test-map', 'conflict-spawner', customSpawner);
      mockGetContentKey.mockReturnValue(baseSpawners);

      const result = spawnerGet('conflict-spawner');

      expect(result).toEqual(customSpawner);
      expect(result?.maxCreatures).toBe(7);
    });

    it('should log error and return undefined for nonexistent spawners', () => {
      mockGetContentKey.mockReturnValue({});

      const result = spawnerGet('nonexistent-spawner');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Spawner:nonexistent-spawner',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Spawner not found: nonexistent-spawner',
      );
    });

    it('should handle spawners with edge case configurations', () => {
      const edgeCaseSpawner: ISpawnerData = {
        tag: 'edge-case-spawner',
        npcIds: [], // Empty NPC list
        maxCreatures: 0, // No creatures
        respawnRate: 1, // Very fast respawn
      } as any;

      spawnerCustomAdd('edge-map', 'edge-case-spawner', edgeCaseSpawner);
      mockGetContentKey.mockReturnValue({});

      const result = spawnerGet('edge-case-spawner');

      expect(result).toEqual(edgeCaseSpawner);
      expect(result?.npcIds).toHaveLength(0);
      expect(result?.maxCreatures).toBe(0);
    });
  });

  describe('spawnerExists', () => {
    it('should return true for existing custom spawners', () => {
      spawnerCustomAdd('test-map', 'orc-spawner', sampleSpawner);
      mockGetContentKey.mockReturnValue({});

      expect(spawnerExists('orc-spawner')).toBe(true);
    });

    it('should return true for existing base spawners', () => {
      const baseSpawners = {
        'base-spawner': {
          tag: 'base-spawner',
          npcIds: ['base-npc'],
          maxCreatures: 5,
          respawnRate: 300,
        },
      };

      mockGetContentKey.mockReturnValue(baseSpawners);

      expect(spawnerExists('base-spawner')).toBe(true);
    });

    it('should return false for nonexistent spawners', () => {
      mockGetContentKey.mockReturnValue({});

      expect(spawnerExists('nonexistent-spawner')).toBe(false);
    });

    it('should prioritize custom spawners in existence check', () => {
      const baseSpawners = {
        'duplicate-spawner': {
          tag: 'duplicate-spawner',
          npcIds: ['base-npc'],
          maxCreatures: 3,
          respawnRate: 300,
        },
      };
      const customSpawner: ISpawnerData = {
        tag: 'duplicate-spawner',
        npcIds: ['custom-npc'],
        maxCreatures: 6,
        respawnRate: 400,
      } as ISpawnerData;

      spawnerCustomAdd('test-map', 'duplicate-spawner', customSpawner);
      mockGetContentKey.mockReturnValue(baseSpawners);

      expect(spawnerExists('duplicate-spawner')).toBe(true);
    });

    it('should handle empty spawner collections', () => {
      mockGetContentKey.mockReturnValue({});

      expect(spawnerExists('any-spawner')).toBe(false);
    });

    it('should work with various spawner tag formats', () => {
      const spawnerTags = [
        'simple-tag',
        'SPAWNER_WITH_UNDERSCORES',
        'spawner.with.dots',
        'spawner-123-with-numbers',
        'special!@#$%chars',
      ];

      spawnerTags.forEach((tag) => {
        const testSpawner: ISpawnerData = {
          tag,
          npcIds: ['test-npc'],
          maxCreatures: 1,
          respawnRate: 300,
        } as ISpawnerData;

        spawnerCustomAdd('test-map', tag, testSpawner);
      });

      mockGetContentKey.mockReturnValue({});

      spawnerTags.forEach((tag) => {
        expect(spawnerExists(tag)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex workflow of adding, retrieving, and clearing spawners', () => {
      // Add spawners to different maps
      spawnerCustomAdd('map1', 'spawner1', sampleSpawner);
      spawnerCustomAdd('map1', 'spawner2', anotherSpawner);
      spawnerCustomAdd('map2', 'spawner3', bossSpawner);

      mockGetContentKey.mockReturnValue({
        'base-spawner': {
          tag: 'base-spawner',
          npcIds: ['base-npc'],
          maxCreatures: 5,
          respawnRate: 300,
        },
      });

      // Check all spawners exist
      expect(spawnerExists('spawner1')).toBe(true);
      expect(spawnerExists('spawner2')).toBe(true);
      expect(spawnerExists('spawner3')).toBe(true);
      expect(spawnerExists('base-spawner')).toBe(true);

      // Clear one map
      spawnerCustomClearMap('map1');

      // Check correct spawners are removed
      expect(spawnerExists('spawner1')).toBe(false);
      expect(spawnerExists('spawner2')).toBe(false);
      expect(spawnerExists('spawner3')).toBe(true);
      expect(spawnerExists('base-spawner')).toBe(true);
    });

    it('should work correctly with custom and base spawners mixed', () => {
      const baseSpawners = {
        'base-orc': {
          tag: 'base-orc',
          npcIds: ['base-orc-warrior'],
          maxCreatures: 4,
          respawnRate: 350,
        },
        'base-goblin': {
          tag: 'base-goblin',
          npcIds: ['base-goblin-scout'],
          maxCreatures: 2,
          respawnRate: 250,
        },
      };

      spawnerCustomAdd('test-map', 'orc-spawner', sampleSpawner);
      mockGetContentKey.mockReturnValue(baseSpawners);

      // Should find both custom and base spawners
      expect(spawnerExists('orc-spawner')).toBe(true);
      expect(spawnerExists('base-orc')).toBe(true);

      // Should retrieve correct spawners
      expect(spawnerGet('orc-spawner')).toEqual(sampleSpawner);
      expect(spawnerGet('base-orc')).toEqual(baseSpawners['base-orc']);
    });

    it('should maintain data consistency after multiple operations', () => {
      // Complex scenario with overlapping tags and operations
      const baseSpawners = {
        'common-spawner': {
          tag: 'common-spawner',
          npcIds: ['base-npc'],
          maxCreatures: 3,
          respawnRate: 300,
        },
      };

      mockGetContentKey.mockReturnValue(baseSpawners);

      // Add custom spawner with same tag
      const customCommon: ISpawnerData = {
        tag: 'common-spawner',
        npcIds: ['custom-npc'],
        maxCreatures: 6,
        respawnRate: 400,
      } as ISpawnerData;

      spawnerCustomAdd('override-map', 'common-spawner', customCommon);

      // Custom should override base
      expect(spawnerGet('common-spawner')).toEqual(customCommon);

      // Clear custom spawners
      spawnerCustomClearMap('override-map');

      // Should fall back to base spawner
      expect(spawnerGet('common-spawner')).toEqual(
        baseSpawners['common-spawner'],
      );
    });

    it('should handle error logging correctly', () => {
      mockGetContentKey.mockReturnValue({});

      // Try to get multiple nonexistent spawners
      const nonexistentTags = ['missing1', 'missing2', 'missing3'];

      nonexistentTags.forEach((tag) => {
        spawnerGet(tag);
      });

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(3);

      nonexistentTags.forEach((tag) => {
        expect(mockLogErrorWithContext).toHaveBeenCalledWith(
          `Content:Spawner:${tag}`,
          expect.any(Error),
        );
      });
    });

    it('should handle spawners with various NPC configurations', () => {
      const configurations = [
        {
          tag: 'single-npc',
          npcIds: ['lone-wolf'],
          maxCreatures: 1,
          respawnRate: 600,
        },
        {
          tag: 'duo-npcs',
          npcIds: ['twin1', 'twin2'],
          maxCreatures: 2,
          respawnRate: 400,
        },
        {
          tag: 'many-npcs',
          npcIds: ['soldier1', 'soldier2', 'soldier3', 'captain', 'lieutenant'],
          maxCreatures: 10,
          respawnRate: 800,
        },
      ];

      configurations.forEach((config) => {
        spawnerCustomAdd('army-map', config.tag, config as ISpawnerData);
      });

      mockGetContentKey.mockReturnValue({});

      configurations.forEach((config) => {
        const retrieved = spawnerGet(config.tag);
        expect(retrieved?.npcIds).toEqual(config.npcIds);
        expect(retrieved?.maxCreatures).toBe(config.maxCreatures);
      });
    });
  });
});
