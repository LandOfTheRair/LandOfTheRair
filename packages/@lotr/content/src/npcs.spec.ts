import type { Allegiance, Hostility, INPCDefinition } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  npcAllGet,
  npcCustomAdd,
  npcCustomClearMap,
  npcExists,
  npcGet,
} from './npcs';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('NPCs Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;

  // Sample NPC definitions for testing
  const sampleNPC: INPCDefinition = {
    npcId: 'test-guard',
    sprite: 100,
    name: ['Test Guard'],
    allegiance: 'Neutral' as Allegiance,
    hostility: 'Never' as Hostility,
    level: 10,
    hp: { min: 100, max: 150 },
    mp: { min: 50, max: 75 },
    gold: { min: 10, max: 20 },
    giveXp: { min: 25, max: 50 },
    repMod: [],
    skillOnKill: 1,
    usableSkills: [],
    skills: {},
    stats: {},
  };

  const bossMob: INPCDefinition = {
    npcId: 'dragon-boss',
    sprite: 200,
    name: ['Ancient Dragon'],
    allegiance: 'Evil' as Allegiance,
    hostility: 'OnSight' as Hostility,
    level: 50,
    hp: { min: 1000, max: 1500 },
    mp: { min: 500, max: 750 },
    gold: { min: 100, max: 200 },
    giveXp: { min: 500, max: 1000 },
    repMod: [{ allegiance: 'Evil' as Allegiance, delta: -10 }],
    skillOnKill: 10,
    usableSkills: [{ result: 'FireBreath', chance: 1 }],
    skills: { conjuration: 50 },
    stats: { str: 25, dex: 15, int: 20 },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('npcCustomAdd', () => {
    it('should add a custom NPC for a map', () => {
      npcCustomAdd('test-map', sampleNPC);

      mockGetContentKey.mockReturnValue({});
      expect(npcExists('test-guard')).toBe(true);
    });

    it('should add multiple custom NPCs for the same map', () => {
      npcCustomAdd('dungeon-1', sampleNPC);
      npcCustomAdd('dungeon-1', bossMob);

      mockGetContentKey.mockReturnValue({});
      expect(npcExists('test-guard')).toBe(true);
      expect(npcExists('dragon-boss')).toBe(true);
    });

    it('should overwrite existing custom NPC with same ID', () => {
      const originalNPC: INPCDefinition = {
        npcId: 'duplicate-id',
        sprite: 150,
        name: ['Original Name'],
        allegiance: 'Neutral' as Allegiance,
        hostility: 'Never' as Hostility,
        level: 5,
        hp: { min: 50, max: 75 },
        mp: { min: 25, max: 40 },
        gold: { min: 5, max: 10 },
        giveXp: { min: 10, max: 20 },
        repMod: [],
        skillOnKill: 1,
        usableSkills: [],
        skills: {},
        stats: {},
      };

      const updatedNPC: INPCDefinition = {
        npcId: 'duplicate-id',
        sprite: 151,
        name: ['Updated Name'],
        allegiance: 'Evil' as Allegiance,
        hostility: 'OnSight' as Hostility,
        level: 15,
        hp: { min: 100, max: 125 },
        mp: { min: 50, max: 65 },
        gold: { min: 15, max: 25 },
        giveXp: { min: 30, max: 50 },
        repMod: [{ allegiance: 'Evil' as Allegiance, delta: -5 }],
        skillOnKill: 2,
        usableSkills: [],
        skills: {},
        stats: {},
      };

      npcCustomAdd('test-map', originalNPC);
      npcCustomAdd('test-map', updatedNPC);

      mockGetContentKey.mockReturnValue({});
      const retrieved = npcGet('duplicate-id');

      expect(retrieved).toEqual(updatedNPC);
      expect(retrieved?.name).toEqual(['Updated Name']);
    });

    it('should handle NPCs with complex properties', () => {
      const complexNPC: INPCDefinition = {
        npcId: 'complex-npc',
        sprite: 300,
        name: ['Complex NPC'],
        allegiance: 'Royalty' as Allegiance,
        hostility: 'Faction' as Hostility,
        level: 25,
        hp: { min: 800, max: 1200 },
        mp: { min: 400, max: 600 },
        gold: { min: 50, max: 100 },
        giveXp: { min: 100, max: 200 },
        repMod: [{ allegiance: 'Royalty' as Allegiance, delta: 5 }],
        skillOnKill: 5,
        usableSkills: [{ result: 'royalCommand', chance: 1 }],
        skills: { restoration: 30, conjuration: 25 },
        stats: { str: 15, int: 20, wis: 18 },
        items: {
          equipment: {},
          sack: [{ result: 'royal-seal', chance: 0.1 }],
          belt: [],
        },
      };

      npcCustomAdd('complex-map', complexNPC);

      mockGetContentKey.mockReturnValue({});
      const retrieved = npcGet('complex-npc');

      expect(retrieved).toEqual(complexNPC);
    });
  });

  describe('npcCustomClearMap', () => {
    it('should remove all custom NPCs for a specific map', () => {
      npcCustomAdd('map-to-clear', sampleNPC);
      npcCustomAdd('map-to-clear', bossMob);
      npcCustomAdd('other-map', {
        npcId: 'other-npc',
        sprite: 75,
        name: ['Other NPC'],
        allegiance: 'Neutral' as Allegiance,
        hostility: 'Never' as Hostility,
        level: 3,
        hp: { min: 30, max: 45 },
        mp: { min: 15, max: 25 },
        gold: { min: 2, max: 5 },
        giveXp: { min: 5, max: 10 },
        repMod: [],
        skillOnKill: 1,
        usableSkills: [],
        skills: {},
        stats: {},
      });

      mockGetContentKey.mockReturnValue({});

      // Verify NPCs exist before clearing
      expect(npcExists('test-guard')).toBe(true);
      expect(npcExists('dragon-boss')).toBe(true);
      expect(npcExists('other-npc')).toBe(true);

      // Clear one map
      npcCustomClearMap('map-to-clear');

      // NPCs from cleared map should be gone
      expect(npcExists('test-guard')).toBe(false);
      expect(npcExists('dragon-boss')).toBe(false);

      // NPCs from other maps should remain
      expect(npcExists('other-npc')).toBe(true);
    });

    it('should handle clearing a map with no custom NPCs', () => {
      npcCustomClearMap('empty-map');

      mockGetContentKey.mockReturnValue({});
      expect(npcExists('nonexistent-npc')).toBe(false);
    });
  });

  describe('npcAllGet', () => {
    it('should return all base NPCs from content', () => {
      const baseNPCs = {
        'base-guard': { npcId: 'base-guard', name: 'Base Guard' },
        'base-merchant': { npcId: 'base-merchant', name: 'Base Merchant' },
      };

      mockGetContentKey.mockReturnValue(baseNPCs);

      const result = npcAllGet();

      expect(mockGetContentKey).toHaveBeenCalledWith('npcs');
      expect(result).toEqual(baseNPCs);
    });
  });

  describe('npcGet', () => {
    it('should return custom NPC when available', () => {
      npcCustomAdd('test-map', sampleNPC);
      mockGetContentKey.mockReturnValue({});

      const result = npcGet('test-guard');

      expect(result).toEqual(sampleNPC);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return base NPC when no custom NPC exists', () => {
      const baseNPCs = {
        'base-npc': { npcId: 'base-npc', name: 'Base NPC' },
      };

      mockGetContentKey.mockReturnValue(baseNPCs);

      const result = npcGet('base-npc');

      expect(result).toEqual(baseNPCs['base-npc']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent NPCs', () => {
      mockGetContentKey.mockReturnValue({});

      const result = npcGet('nonexistent-npc');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:NPC:nonexistent-npc',
        expect.any(Error),
      );
    });
  });

  describe('npcExists', () => {
    it('should return true for existing custom NPCs', () => {
      npcCustomAdd('test-map', sampleNPC);
      mockGetContentKey.mockReturnValue({});

      expect(npcExists('test-guard')).toBe(true);
    });

    it('should return true for existing base NPCs', () => {
      const baseNPCs = {
        'base-npc': { npcId: 'base-npc', name: 'Base NPC' },
      };

      mockGetContentKey.mockReturnValue(baseNPCs);

      expect(npcExists('base-npc')).toBe(true);
    });

    it('should return false for nonexistent NPCs', () => {
      mockGetContentKey.mockReturnValue({});

      expect(npcExists('nonexistent-npc')).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow of adding, retrieving, and clearing NPCs', () => {
      npcCustomAdd('map1', sampleNPC);
      npcCustomAdd('map1', bossMob);

      mockGetContentKey.mockReturnValue({
        'base-npc': { npcId: 'base-npc', name: 'Base NPC' },
      });

      // Check all NPCs exist
      expect(npcExists('test-guard')).toBe(true);
      expect(npcExists('dragon-boss')).toBe(true);
      expect(npcExists('base-npc')).toBe(true);

      // Clear custom NPCs
      npcCustomClearMap('map1');

      // Check correct NPCs are removed
      expect(npcExists('test-guard')).toBe(false);
      expect(npcExists('dragon-boss')).toBe(false);
      expect(npcExists('base-npc')).toBe(true);
    });
  });
});
