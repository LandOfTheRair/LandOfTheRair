import { beforeEach, describe, expect, it, vi } from 'vitest';
import { npcScriptGet } from './npcscripts';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('NPC Scripts Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('npcScriptGet', () => {
    it('should return NPC script when it exists', () => {
      const npcScripts = {
        'merchant-basic': {
          name: 'Basic Merchant',
          type: 'shop',
          dialogue: {
            greeting: 'Welcome to my shop!',
            farewell: 'Come back soon!',
          },
          actions: [
            { type: 'open-shop', shopId: 'general-goods' },
            { type: 'repair-items', cost: 'variable' },
          ],
        },
        'guard-patrol': {
          name: 'City Guard Patrol',
          type: 'patrol',
          behavior: {
            patrolPath: ['gate', 'square', 'market', 'gate'],
            speed: 'walking',
            alertLevel: 'normal',
          },
          combat: {
            aggressive: false,
            helpAllies: true,
            pursuitDistance: 10,
          },
        },
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('merchant-basic');

      expect(mockGetContentKey).toHaveBeenCalledWith('npcScripts');
      expect(result).toEqual(npcScripts['merchant-basic']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent NPC script', () => {
      const npcScripts = {
        'existing-script': {
          name: 'Existing Script',
          type: 'basic',
        },
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('nonexistent-script');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:NPCScript:nonexistent-script',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'NPC Script nonexistent-script does not exist.',
      );
    });

    it('should handle empty NPC scripts collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = npcScriptGet('any-script');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:NPCScript:any-script',
        expect.any(Error),
      );
    });

    it('should handle complex NPC scripts with behaviors and AI', () => {
      const complexScript = {
        name: 'Advanced Dragon AI',
        type: 'boss',
        aiType: 'advanced-combat',
        phases: [
          {
            name: 'Ground Phase',
            healthRange: { min: 50, max: 100 },
            abilities: ['fire-breath', 'claw-swipe', 'tail-whip'],
            movement: {
              type: 'ground-based',
              speed: 'normal',
              aggroRange: 15,
            },
          },
          {
            name: 'Flight Phase',
            healthRange: { min: 0, max: 50 },
            abilities: ['aerial-fire-blast', 'dive-bomb', 'wing-buffet'],
            movement: {
              type: 'flying',
              speed: 'fast',
              altitude: 'high',
            },
          },
        ],
        loot: {
          guaranteed: ['dragon-scale', 'dragon-heart'],
          rare: [
            { item: 'dragon-tooth', chance: 0.3 },
            { item: 'ancient-gold', chance: 0.1 },
          ],
        },
        dialogue: {
          spawn: 'You dare challenge me, mortal?',
          phase2: 'Feel the fury of my wings!',
          death: 'I... am... defeated...',
        },
        mechanics: {
          enrageTimer: 300000, // 5 minutes
          immunities: ['poison', 'fear', 'charm'],
          resistances: { fire: 90, ice: -50 },
        },
      };

      const npcScripts = {
        'dragon-boss-ai': complexScript,
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('dragon-boss-ai');

      expect(result).toEqual(complexScript);
      expect((result as any).phases).toHaveLength(2);
      expect((result as any).phases[0].abilities).toContain('fire-breath');
      expect((result as any).mechanics.immunities).toContain('poison');
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle dialogue-heavy NPC scripts', () => {
      const dialogueScript = {
        name: 'Quest Giver NPC',
        type: 'quest-giver',
        dialogue: {
          initial: {
            text: 'Greetings, traveler! I have urgent need of your help.',
            options: [
              { text: 'What do you need?', action: 'show-quest' },
              { text: 'Not interested.', action: 'dismiss' },
            ],
          },
          questAvailable: {
            text: 'The ancient ruins hold dangerous secrets. Will you investigate?',
            requirements: {
              level: 10,
              completed: ['tutorial-quest'],
            },
            rewards: {
              experience: 1500,
              gold: 250,
              items: ['investigation-scroll'],
            },
          },
          questInProgress: {
            text: 'Have you discovered anything in the ruins yet?',
            hints: [
              'Look for the stone tablets in the deepest chamber.',
              'Beware the guardian spirits that protect the secrets.',
            ],
          },
          questComplete: {
            text: 'Excellent work! This information is most valuable.',
            followUp: 'ancient-mystery-part-2',
          },
        },
        behavior: {
          idleAnimation: 'reading-scroll',
          interactionRange: 3,
          availabilityHours: { start: 6, end: 22 },
        },
      };

      const npcScripts = {
        'quest-giver-ancient': dialogueScript,
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('quest-giver-ancient');

      expect(result).toEqual(dialogueScript);
      expect((result as any).dialogue.initial.options).toHaveLength(2);
      expect((result as any).dialogue.questAvailable.requirements.level).toBe(
        10,
      );
      expect((result as any).behavior.availabilityHours.start).toBe(6);
    });

    it('should handle merchant and shop NPC scripts', () => {
      const merchantScript = {
        name: 'Weapon Shop Owner',
        type: 'merchant',
        shop: {
          id: 'weapons-and-armor',
          categories: ['weapons', 'armor', 'shields'],
          restockInterval: 86400000, // 24 hours
          priceModifier: 1.0,
          buyback: {
            enabled: true,
            percentage: 0.6,
            timeLimit: 3600000, // 1 hour
          },
        },
        inventory: {
          always: [
            { item: 'iron-sword', quantity: 5, price: 100 },
            { item: 'leather-armor', quantity: 3, price: 150 },
            { item: 'wooden-shield', quantity: 4, price: 75 },
          ],
          rare: [
            { item: 'steel-sword', quantity: 1, price: 500, chance: 0.1 },
            {
              item: 'mithril-chainmail',
              quantity: 1,
              price: 2000,
              chance: 0.05,
            },
          ],
        },
        dialogue: {
          greeting: 'Welcome to the finest weapons in the kingdom!',
          noMoney: 'Come back when you have more coin.',
          successful: 'A wise choice! May it serve you well.',
          farewell: 'Safe travels, and remember us for your next upgrade!',
        },
        specialServices: [
          {
            name: 'weapon-sharpening',
            description: 'Improve weapon damage for 24 hours',
            cost: 50,
            duration: 86400000,
          },
          {
            name: 'armor-reinforcement',
            description: 'Increase armor durability',
            cost: 100,
            permanent: true,
          },
        ],
      };

      const npcScripts = {
        'merchant-weapons': merchantScript,
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('merchant-weapons');

      expect(result).toEqual(merchantScript);
      expect((result as any).shop.categories).toContain('weapons');
      expect((result as any).inventory.always).toHaveLength(3);
      expect((result as any).specialServices[0].cost).toBe(50);
    });

    it('should handle NPC scripts with conditional behaviors', () => {
      const conditionalScript = {
        name: 'Weather-Dependent NPC',
        type: 'conditional',
        behaviors: {
          sunny: {
            location: 'town-square',
            activity: 'street-performance',
            dialogue: 'What a beautiful day for music!',
          },
          rainy: {
            location: 'tavern-interior',
            activity: 'storytelling',
            dialogue: 'Perfect weather for tales by the fire.',
          },
          night: {
            location: 'home',
            activity: 'sleeping',
            dialogue: null,
            interactable: false,
          },
        },
        conditions: [
          {
            type: 'weather',
            values: ['sunny', 'rainy'],
            behavior: 'match',
          },
          {
            type: 'time-of-day',
            range: { start: 20, end: 6 },
            behavior: 'night',
          },
        ],
        schedule: {
          defaultBehavior: 'sunny',
          checkInterval: 600000, // 10 minutes
        },
      };

      const npcScripts = {
        'weather-npc': conditionalScript,
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('weather-npc');

      expect(result).toEqual(conditionalScript);
      expect((result as any).behaviors.sunny.location).toBe('town-square');
      expect((result as any).behaviors.night.interactable).toBe(false);
      expect((result as any).conditions).toHaveLength(2);
    });

    it('should handle combat AI scripts', () => {
      const combatScript = {
        name: 'Elite Guard AI',
        type: 'combat-ai',
        combat: {
          aggroRange: 12,
          pursuitRange: 20,
          resetRange: 30,
          attackPatterns: [
            {
              name: 'basic-combo',
              sequence: ['slash', 'parry', 'thrust'],
              cooldown: 3000,
              priority: 'high',
            },
            {
              name: 'power-attack',
              sequence: ['charge', 'heavy-strike'],
              cooldown: 8000,
              priority: 'medium',
              conditions: ['enemy-health-above-50'],
            },
          ],
          defensive: {
            blockChance: 0.4,
            dodgeChance: 0.2,
            parryChance: 0.3,
            counterAttackChance: 0.15,
          },
          formations: {
            enabled: true,
            preferredRole: 'frontline',
            supportAllies: true,
            retreatThreshold: 0.25,
          },
        },
        ai: {
          intelligence: 'high',
          adaptability: 0.7,
          memoryDuration: 30000,
          tacticalAwareness: true,
        },
        equipment: {
          weapon: 'elite-guard-sword',
          armor: 'guard-chainmail',
          shield: 'tower-shield',
        },
      };

      const npcScripts = {
        'elite-guard-combat': combatScript,
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('elite-guard-combat');

      expect(result).toEqual(combatScript);
      expect((result as any).combat.attackPatterns).toHaveLength(2);
      expect((result as any).combat.defensive.blockChance).toBe(0.4);
      expect((result as any).ai.intelligence).toBe('high');
    });

    it('should return exact object reference from content', () => {
      const scriptObject = {
        name: 'Reference Test',
        type: 'test',
      };

      const npcScripts = { 'reference-test': scriptObject };
      mockGetContentKey.mockReturnValue(npcScripts);

      const result = npcScriptGet('reference-test');

      expect(result).toBe(scriptObject); // Same reference
    });

    it('should handle null and undefined script values', () => {
      const npcScripts = {
        'null-script': null,
        'undefined-script': undefined,
        'valid-script': { name: 'Valid Script' },
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      // Null script should log error
      const nullResult = npcScriptGet('null-script');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:NPCScript:null-script',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Undefined script should log error
      const undefinedResult = npcScriptGet('undefined-script');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:NPCScript:undefined-script',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Valid script should work normally
      const validResult = npcScriptGet('valid-script');
      expect(validResult).toEqual(npcScripts['valid-script']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle scripts with special characters in names', () => {
      const npcScripts = {
        'script-with_special.chars!': {
          name: 'Special Script',
          type: 'special',
        },
        'script@#$%test': {
          name: 'Another Special',
          type: 'test',
        },
      };

      mockGetContentKey.mockReturnValue(npcScripts);

      const result1 = npcScriptGet('script-with_special.chars!');
      const result2 = npcScriptGet('script@#$%test');

      expect(result1).toEqual(npcScripts['script-with_special.chars!']);
      expect(result2).toEqual(npcScripts['script@#$%test']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle large script collections efficiently', () => {
      const largeScriptCollection: any = {};

      for (let i = 0; i < 1000; i++) {
        largeScriptCollection[`script-${i}`] = {
          name: `Script ${i}`,
          type:
            i % 5 === 0
              ? 'merchant'
              : i % 5 === 1
                ? 'combat'
                : i % 5 === 2
                  ? 'quest'
                  : i % 5 === 3
                    ? 'dialogue'
                    : 'utility',
          complexity: i % 3,
        };
      }

      mockGetContentKey.mockReturnValue(largeScriptCollection);

      // Should efficiently find existing scripts
      const script500 = npcScriptGet('script-500');
      expect((script500 as any).name).toBe('Script 500');

      // Should efficiently determine non-existence
      const nonExistent = npcScriptGet('script-9999');
      expect(nonExistent).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should call getContentKey with correct parameter', () => {
      mockGetContentKey.mockReturnValue({});

      npcScriptGet('test-script');

      expect(mockGetContentKey).toHaveBeenCalledWith('npcScripts');
      expect(mockGetContentKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => npcScriptGet('any')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => npcScriptGet('any')).toThrow();
    });

    it('should handle very long script names', () => {
      const longScriptName =
        'very-long-npc-script-name-that-exceeds-normal-limits-and-continues-for-a-very-long-time-to-test-edge-cases';

      mockGetContentKey.mockReturnValue({});

      npcScriptGet(longScriptName);

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        `Content:NPCScript:${longScriptName}`,
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain(longScriptName);
    });
  });
});
