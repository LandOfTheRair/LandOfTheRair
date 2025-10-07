import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __AllContentDontUse,
  getContentKey,
  setContentKey,
} from './allcontent';

// Mock deep-freeze to avoid issues with frozen objects in tests
vi.mock('deep-freeze', () => ({
  default: (obj: any) => obj,
}));

describe('All Content', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('__AllContentDontUse', () => {
    it('should have all required content keys initialized', () => {
      expect(__AllContentDontUse).toBeDefined();
      expect(__AllContentDontUse.mapDroptables).toEqual({});
      expect(__AllContentDontUse.regionDroptables).toEqual({});
      expect(__AllContentDontUse.items).toEqual({});
      expect(__AllContentDontUse.npcs).toEqual({});
      expect(__AllContentDontUse.npcScripts).toEqual({});
      expect(__AllContentDontUse.tradeskillRecipes).toEqual({});
      expect(__AllContentDontUse.allRecipes).toEqual({});
      expect(__AllContentDontUse.spawners).toEqual({});
      expect(__AllContentDontUse.quests).toEqual({});
      expect(__AllContentDontUse.traits).toEqual({});
      expect(__AllContentDontUse.traitTrees).toEqual({});
      expect(__AllContentDontUse.effectData).toEqual({});
      expect(__AllContentDontUse.spells).toEqual({});
      expect(__AllContentDontUse.achievements).toEqual({});
    });

    it('should have core game data structures initialized', () => {
      expect(__AllContentDontUse.allegianceStats).toEqual({});
      expect(__AllContentDontUse.attributeStats).toEqual([]);
      expect(__AllContentDontUse.challenge).toEqual({
        byClass: {},
        global: {},
        byType: {},
      });
      expect(__AllContentDontUse.charSelect).toEqual({
        baseStats: {},
        allegiances: [],
        classes: [],
        weapons: [],
      });
      expect(__AllContentDontUse.events).toEqual({});
      expect(__AllContentDontUse.fate).toEqual({ stat: [], event: [] });
    });

    it('should have game mechanics data initialized', () => {
      expect(__AllContentDontUse.hideReductions).toEqual({});
      expect(__AllContentDontUse.holidayDescs).toEqual({});
      expect(__AllContentDontUse.materialStorage).toEqual({
        slots: {},
        layouts: [],
      });
      expect(__AllContentDontUse.npcNames).toEqual([]);
      expect(__AllContentDontUse.premium).toEqual({
        silverPurchases: [],
        silverTiers: { microtransaction: [], subscription: [] },
      });
      expect(__AllContentDontUse.rarespawns).toEqual({});
    });

    it('should have system data structures initialized', () => {
      expect(__AllContentDontUse.settings).toEqual({});
      expect(__AllContentDontUse.skillDescs).toEqual({});
      expect(__AllContentDontUse.statDamageMultipliers).toEqual({});
      expect(__AllContentDontUse.staticText).toEqual({
        terrain: [],
        decor: {},
      });
      expect(__AllContentDontUse.weaponTiers).toEqual({});
      expect(__AllContentDontUse.weaponTiersNPC).toEqual({});
      expect(__AllContentDontUse.rngDungeonConfig).toEqual({});
      expect(__AllContentDontUse.spriteinfo).toEqual({ doorStates: [] });
    });
  });

  describe('setContentKey', () => {
    it('should set a content key with provided value', () => {
      const testItems = {
        'test-sword': { name: 'Test Sword', type: 'Weapon' },
      };

      setContentKey('items', testItems as any);

      expect(__AllContentDontUse.items).toEqual(testItems);
    });

    it('should set multiple different content keys', () => {
      const testNPCs = { 'test-npc': { name: 'Test NPC' } };
      const testSpells = { 'test-spell': { name: 'Test Spell' } };

      setContentKey('npcs', testNPCs as any);
      setContentKey('spells', testSpells as any);

      expect(__AllContentDontUse.npcs).toEqual(testNPCs);
      expect(__AllContentDontUse.spells).toEqual(testSpells);
    });

    it('should overwrite existing content key values', () => {
      const firstValue = { item1: { name: 'Item 1' } };
      const secondValue = { item2: { name: 'Item 2' } };

      setContentKey('items', firstValue as any);
      expect(__AllContentDontUse.items).toEqual(firstValue);

      setContentKey('items', secondValue as any);
      expect(__AllContentDontUse.items).toEqual(secondValue);
    });

    it('should handle setting array values', () => {
      const testArray = ['npc1', 'npc2', 'npc3'];

      setContentKey('npcNames', testArray);

      expect(__AllContentDontUse.npcNames).toEqual(testArray);
    });

    it('should handle setting complex nested objects', () => {
      const complexChallenge = {
        byClass: { Warrior: { level: 10 } },
        global: { maxLevel: 50 },
        byType: { combat: { difficulty: 5 } },
      };

      setContentKey('challenge', complexChallenge as any);

      expect(__AllContentDontUse.challenge).toEqual(complexChallenge);
    });
  });

  describe('getContentKey', () => {
    it('should return the value of a content key', () => {
      const testValue = { 'test-item': { name: 'Test Item' } };
      __AllContentDontUse.items = testValue as any;

      const result = getContentKey('items');

      expect(result).toEqual(testValue);
    });

    it('should return different values for different keys', () => {
      const testItems = { item1: { name: 'Item 1' } };
      const testNPCs = { npc1: { name: 'NPC 1' } };

      __AllContentDontUse.items = testItems as any;
      __AllContentDontUse.npcs = testNPCs as any;

      expect(getContentKey('items')).toEqual(testItems);
      expect(getContentKey('npcs')).toEqual(testNPCs);
    });

    it('should return array values correctly', () => {
      const testArray = ['name1', 'name2', 'name3'];
      __AllContentDontUse.npcNames = testArray;

      const result = getContentKey('npcNames');

      expect(result).toEqual(testArray);
    });

    it('should return empty default values for unset keys', () => {
      // Reset to ensure clean state
      __AllContentDontUse.achievements = {};

      const result = getContentKey('achievements');

      expect(result).toEqual({});
    });

    it('should return the same reference that was set', () => {
      const testObject = { 'unique-key': { data: 'test' } };
      setContentKey('items', testObject as any);

      const retrieved = getContentKey('items');

      expect(retrieved).toBe(testObject);
    });
  });

  describe('Integration Tests', () => {
    it('should work with set and get operations together', () => {
      const testData = {
        spell1: { name: 'Fireball', damage: 100 },
        spell2: { name: 'Heal', healing: 50 },
      };

      setContentKey('spells', testData as any);
      const retrieved = getContentKey('spells');

      expect(retrieved).toEqual(testData);
    });

    it('should maintain data integrity across multiple operations', () => {
      // Set initial data
      setContentKey('items', { sword: { name: 'Sword' } } as any);
      setContentKey('npcs', { guard: { name: 'Guard' } } as any);

      // Verify both are set correctly
      expect(getContentKey('items')).toEqual({ sword: { name: 'Sword' } });
      expect(getContentKey('npcs')).toEqual({ guard: { name: 'Guard' } });

      // Update one, verify the other remains unchanged
      setContentKey('items', { axe: { name: 'Axe' } } as any);
      expect(getContentKey('items')).toEqual({ axe: { name: 'Axe' } });
      expect(getContentKey('npcs')).toEqual({ guard: { name: 'Guard' } });
    });

    it('should handle all content key types correctly', () => {
      // Test a variety of content key types (excluding removed custom keys)
      const keys = [
        'items',
        'npcs',
        'spells',
        'quests',
        'achievements',
        'npcNames',
        'settings',
        'spawners',
      ] as const;

      keys.forEach((key) => {
        const testValue = key === 'npcNames' ? ['test'] : { test: 'data' };
        setContentKey(key, testValue as any);
        expect(getContentKey(key)).toEqual(testValue);
      });
    });
  });
});
