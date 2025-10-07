import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  coreAllegianceStats,
  coreAttributeStats,
  coreChallenge,
  coreCharSelect,
  coreEvents,
  coreFate,
  coreHideReductions,
  coreHolidayDescs,
  coreMaterialStorage,
  coreNPCNames,
  corePremium,
  coreRareSpawns,
  coreRNGDungeonConfig,
  coreSettings,
  coreSkillDescs,
  coreSpriteInfo,
  coreStatDamageMultipliers,
  coreStaticText,
  coreWeaponTiers,
  coreWeaponTiersNPC,
} from './core';

// Mock the allcontent module
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

describe('Core Functions', () => {
  let mockGetContentKey: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { getContentKey } = await import('./allcontent');
    mockGetContentKey = vi.mocked(getContentKey);
  });

  describe('coreAllegianceStats', () => {
    it('should return allegiance stats from content', () => {
      const mockStats = {
        Royalty: [{ stat: 'str' as any, value: 10 }],
        Adventurers: [{ stat: 'dex' as any, value: 8 }],
      };
      mockGetContentKey.mockReturnValue(mockStats as any);

      const result = coreAllegianceStats();

      expect(mockGetContentKey).toHaveBeenCalledWith('allegianceStats');
      expect(result).toEqual(mockStats);
    });

    it('should handle empty allegiance stats', () => {
      mockGetContentKey.mockReturnValue({});

      const result = coreAllegianceStats();

      expect(result).toEqual({});
    });
  });

  describe('coreAttributeStats', () => {
    it('should return attribute stats from content', () => {
      const mockStats = [
        { attribute: 'strength', stats: [{ stat: 'str' as any, boost: 1 }] },
        { attribute: 'agility', stats: [{ stat: 'dex' as any, boost: 1 }] },
      ];
      mockGetContentKey.mockReturnValue(mockStats as any);

      const result = coreAttributeStats();

      expect(mockGetContentKey).toHaveBeenCalledWith('attributeStats');
      expect(result).toEqual(mockStats);
    });

    it('should handle empty attribute stats array', () => {
      mockGetContentKey.mockReturnValue([]);

      const result = coreAttributeStats();

      expect(result).toEqual([]);
    });
  });

  describe('coreChallenge', () => {
    it('should return challenge data from content', () => {
      const mockChallenge = {
        byClass: { Warrior: { maxLevel: 50 } },
        global: { enabled: true },
        byType: { combat: { difficulty: 3 } },
      };
      mockGetContentKey.mockReturnValue(mockChallenge as any);

      const result = coreChallenge();

      expect(mockGetContentKey).toHaveBeenCalledWith('challenge');
      expect(result).toEqual(mockChallenge);
    });
  });

  describe('coreCharSelect', () => {
    it('should return character selection data from content', () => {
      const mockCharSelect = {
        baseStats: { str: 10, dex: 8, gold: 1000 },
        allegiances: ['Royalty', 'Adventurers'],
        classes: ['Warrior', 'Mage'],
        weapons: ['Sword', 'Staff'],
      };
      mockGetContentKey.mockReturnValue(mockCharSelect as any);

      const result = coreCharSelect();

      expect(mockGetContentKey).toHaveBeenCalledWith('charSelect');
      expect(result).toEqual(mockCharSelect);
    });
  });

  describe('coreEvents', () => {
    it('should return events data from content', () => {
      const mockEvents = {
        'christmas-event': { name: 'Christmas', duration: '2 weeks' },
        'summer-festival': { name: 'Summer Festival', duration: '1 week' },
      };
      mockGetContentKey.mockReturnValue(mockEvents as any);

      const result = coreEvents();

      expect(mockGetContentKey).toHaveBeenCalledWith('events');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('coreFate', () => {
    it('should return fate data from content', () => {
      const mockFate = {
        stat: [{ name: 'Lucky Strike', effect: '+5 luck' }],
        event: [{ name: 'Fortune', description: 'Random good event' }],
      };
      mockGetContentKey.mockReturnValue(mockFate as any);

      const result = coreFate();

      expect(mockGetContentKey).toHaveBeenCalledWith('fate');
      expect(result).toEqual(mockFate);
    });
  });

  describe('coreHideReductions', () => {
    it('should return hide reductions data from content', () => {
      const mockReductions = {
        Sword: 0.8,
        Bow: 0.6,
        Staff: 0.9,
      };
      mockGetContentKey.mockReturnValue(mockReductions as any);

      const result = coreHideReductions();

      expect(mockGetContentKey).toHaveBeenCalledWith('hideReductions');
      expect(result).toEqual(mockReductions);
    });
  });

  describe('coreHolidayDescs', () => {
    it('should return holiday descriptions from content', () => {
      const mockHolidays = {
        Christmas: {
          name: 'Christmas',
          text: 'Merry Christmas!',
          duration: '2 weeks',
          month: 12,
        },
        Easter: {
          name: 'Easter',
          text: 'Happy Easter!',
          duration: '1 week',
          month: 4,
        },
      };
      mockGetContentKey.mockReturnValue(mockHolidays as any);

      const result = coreHolidayDescs();

      expect(mockGetContentKey).toHaveBeenCalledWith('holidayDescs');
      expect(result).toEqual(mockHolidays);
    });
  });

  describe('coreMaterialStorage', () => {
    it('should return material storage layout from content', () => {
      const mockStorage = {
        slots: { wood: 100, stone: 200 },
        layouts: [{ name: 'basic', capacity: 50 }],
      };
      mockGetContentKey.mockReturnValue(mockStorage as any);

      const result = coreMaterialStorage();

      expect(mockGetContentKey).toHaveBeenCalledWith('materialStorage');
      expect(result).toEqual(mockStorage);
    });
  });

  describe('coreNPCNames', () => {
    it('should return NPC names from content', () => {
      const mockNames = ['Gandalf', 'Aragorn', 'Legolas', 'Gimli'];
      mockGetContentKey.mockReturnValue(mockNames);

      const result = coreNPCNames();

      expect(mockGetContentKey).toHaveBeenCalledWith('npcNames');
      expect(result).toEqual(mockNames);
    });

    it('should handle empty NPC names array', () => {
      mockGetContentKey.mockReturnValue([]);

      const result = coreNPCNames();

      expect(result).toEqual([]);
    });
  });

  describe('corePremium', () => {
    it('should return premium data from content', () => {
      const mockPremium = {
        silverPurchases: [{ name: 'Silver Pack', cost: 10 }],
        silverTiers: {
          microtransaction: [{ tier: 1, benefit: 'Extra storage' }],
          subscription: [{ tier: 'Premium', benefit: 'Double XP' }],
        },
      };
      mockGetContentKey.mockReturnValue(mockPremium as any);

      const result = corePremium();

      expect(mockGetContentKey).toHaveBeenCalledWith('premium');
      expect(result).toEqual(mockPremium);
    });
  });

  describe('coreRareSpawns', () => {
    it('should return rare spawns data from content', () => {
      const mockRareSpawns = {
        'forest-map': { spawns: ['Dragon', 'Phoenix'] },
        'desert-map': { spawns: ['Sandworm', 'Mirage'] },
      };
      mockGetContentKey.mockReturnValue(mockRareSpawns as any);

      const result = coreRareSpawns();

      expect(mockGetContentKey).toHaveBeenCalledWith('rarespawns');
      expect(result).toEqual(mockRareSpawns);
    });
  });

  describe('coreSettings', () => {
    it('should return game settings from content', () => {
      const mockSettings = {
        maxPlayers: 1000,
        serverName: 'Test Server',
        motd: 'Welcome to the test server!',
      };
      mockGetContentKey.mockReturnValue(mockSettings as any);

      const result = coreSettings();

      expect(mockGetContentKey).toHaveBeenCalledWith('settings');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('coreSkillDescs', () => {
    it('should return skill descriptions from content', () => {
      const mockSkillDescs = {
        Sword: ['Basic sword combat', 'Advanced techniques'],
        Magic: ['Elementary spells', 'Advanced magic theory'],
      };
      mockGetContentKey.mockReturnValue(mockSkillDescs as any);

      const result = coreSkillDescs();

      expect(mockGetContentKey).toHaveBeenCalledWith('skillDescs');
      expect(result).toEqual(mockSkillDescs);
    });
  });

  describe('coreStatDamageMultipliers', () => {
    it('should return stat damage multipliers from content', () => {
      const mockMultipliers = {
        str: [1.0, 1.1, 1.2],
        dex: [1.0, 1.05, 1.1],
        int: [1.0, 1.15, 1.3],
      };
      mockGetContentKey.mockReturnValue(mockMultipliers as any);

      const result = coreStatDamageMultipliers();

      expect(mockGetContentKey).toHaveBeenCalledWith('statDamageMultipliers');
      expect(result).toEqual(mockMultipliers);
    });
  });

  describe('coreStaticText', () => {
    it('should return static text data from content', () => {
      const mockStaticText = {
        terrain: ['grass', 'stone', 'water'],
        decor: { tree: 'A mighty oak', rock: 'A weathered stone' },
      };
      mockGetContentKey.mockReturnValue(mockStaticText as any);

      const result = coreStaticText();

      expect(mockGetContentKey).toHaveBeenCalledWith('staticText');
      expect(result).toEqual(mockStaticText);
    });
  });

  describe('coreWeaponTiers', () => {
    it('should return weapon tiers from content', () => {
      const mockTiers = {
        Sword: { tier1: { damage: 10 }, tier2: { damage: 20 } },
        Bow: { tier1: { damage: 8 }, tier2: { damage: 16 } },
      };
      mockGetContentKey.mockReturnValue(mockTiers as any);

      const result = coreWeaponTiers();

      expect(mockGetContentKey).toHaveBeenCalledWith('weaponTiers');
      expect(result).toEqual(mockTiers);
    });
  });

  describe('coreWeaponTiersNPC', () => {
    it('should return NPC weapon tiers from content', () => {
      const mockNPCTiers = {
        Sword: { basic: { damage: 15 }, elite: { damage: 30 } },
        Staff: { basic: { damage: 12 }, elite: { damage: 24 } },
      };
      mockGetContentKey.mockReturnValue(mockNPCTiers as any);

      const result = coreWeaponTiersNPC();

      expect(mockGetContentKey).toHaveBeenCalledWith('weaponTiersNPC');
      expect(result).toEqual(mockNPCTiers);
    });
  });

  describe('coreRNGDungeonConfig', () => {
    it('should return RNG dungeon config from content', () => {
      const mockConfig = {
        maxRooms: 20,
        minRooms: 5,
        difficulty: 3,
        lootTables: ['common', 'rare'],
      };
      mockGetContentKey.mockReturnValue(mockConfig as any);

      const result = coreRNGDungeonConfig();

      expect(mockGetContentKey).toHaveBeenCalledWith('rngDungeonConfig');
      expect(result).toEqual(mockConfig);
    });
  });

  describe('coreSpriteInfo', () => {
    it('should return sprite info from content', () => {
      const mockSpriteInfo = {
        doorStates: [
          { state: 'open', sprite: 'door_open.png' },
          { state: 'closed', sprite: 'door_closed.png' },
        ],
      };
      mockGetContentKey.mockReturnValue(mockSpriteInfo as any);

      const result = coreSpriteInfo();

      expect(mockGetContentKey).toHaveBeenCalledWith('spriteinfo');
      expect(result).toEqual(mockSpriteInfo);
    });
  });

  describe('Integration Tests', () => {
    it('should call getContentKey with correct parameters for all functions', () => {
      const functions = [
        { fn: coreAllegianceStats, key: 'allegianceStats' },
        { fn: coreAttributeStats, key: 'attributeStats' },
        { fn: coreChallenge, key: 'challenge' },
        { fn: coreCharSelect, key: 'charSelect' },
        { fn: coreEvents, key: 'events' },
        { fn: coreFate, key: 'fate' },
        { fn: coreHideReductions, key: 'hideReductions' },
        { fn: coreHolidayDescs, key: 'holidayDescs' },
        { fn: coreMaterialStorage, key: 'materialStorage' },
        { fn: coreNPCNames, key: 'npcNames' },
        { fn: corePremium, key: 'premium' },
        { fn: coreRareSpawns, key: 'rarespawns' },
        { fn: coreSettings, key: 'settings' },
        { fn: coreSkillDescs, key: 'skillDescs' },
        { fn: coreStatDamageMultipliers, key: 'statDamageMultipliers' },
        { fn: coreStaticText, key: 'staticText' },
        { fn: coreWeaponTiers, key: 'weaponTiers' },
        { fn: coreWeaponTiersNPC, key: 'weaponTiersNPC' },
        { fn: coreRNGDungeonConfig, key: 'rngDungeonConfig' },
        { fn: coreSpriteInfo, key: 'spriteinfo' },
      ];

      functions.forEach(({ fn, key }) => {
        mockGetContentKey.mockClear();
        mockGetContentKey.mockReturnValue({});

        fn();

        expect(mockGetContentKey).toHaveBeenCalledWith(key);
        expect(mockGetContentKey).toHaveBeenCalledTimes(1);
      });
    });

    it('should return the exact value from getContentKey', () => {
      const testValue = { unique: 'test-data' };
      mockGetContentKey.mockReturnValue(testValue as any);

      const result = coreSettings();

      expect(result).toBe(testValue);
    });
  });
});
