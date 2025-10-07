import { beforeEach, describe, expect, it, vi } from 'vitest';
import { eventGet } from './events';

// Mock dependencies
vi.mock('./core', () => ({
  coreEvents: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Events Functions', () => {
  let mockCoreEvents: any;
  let mockLogErrorWithContext: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const core = await import('./core');
    const errors = await import('./errors');

    mockCoreEvents = vi.mocked(core.coreEvents);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('eventGet', () => {
    it('should return event when it exists', () => {
      const events = {
        'festival-start': {
          name: 'Festival Start',
          description: 'The annual festival begins',
          duration: 7200000, // 2 hours
          effects: ['celebration', 'increased-exp'],
        },
        'dragon-attack': {
          name: 'Dragon Attack',
          description: 'A dragon attacks the city',
          duration: 3600000, // 1 hour
          effects: ['fear', 'fire-damage'],
          hostileSpawns: ['red-dragon', 'fire-elemental'],
        },
      };

      mockCoreEvents.mockReturnValue(events);

      const result = eventGet('festival-start');

      expect(mockCoreEvents).toHaveBeenCalledTimes(1);
      expect(result).toEqual(events['festival-start']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent event', () => {
      const events = {
        'existing-event': {
          name: 'Existing Event',
          description: 'This event exists',
        },
      };

      mockCoreEvents.mockReturnValue(events);

      const result = eventGet('nonexistent-event');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Event:nonexistent-event',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Event nonexistent-event does not exist.',
      );
    });

    it('should handle empty events collection', () => {
      mockCoreEvents.mockReturnValue({});

      const result = eventGet('any-event');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Event:any-event',
        expect.any(Error),
      );
    });

    it('should handle events with complex data structures', () => {
      const complexEvent = {
        name: 'Seasonal Festival',
        description: 'A grand celebration of the changing seasons',
        type: 'celebration',
        duration: 86400000, // 24 hours
        startConditions: {
          timeOfDay: 'morning',
          weather: 'clear',
          playerCount: { min: 5, max: 50 },
        },
        effects: [
          { type: 'experience-boost', multiplier: 1.5 },
          { type: 'drop-rate-boost', multiplier: 2.0 },
          { type: 'special-vendors', enabled: true },
        ],
        rewards: {
          participation: { exp: 1000, gold: 500 },
          completion: {
            items: ['festival-token', 'celebration-fireworks'],
            titles: ['Festival Participant'],
          },
        },
        phases: [
          {
            name: 'Opening Ceremony',
            duration: 3600000,
            activities: ['parade', 'speeches', 'music'],
          },
          {
            name: 'Main Events',
            duration: 72000000,
            activities: ['contests', 'games', 'trading'],
          },
          {
            name: 'Closing Celebration',
            duration: 10800000,
            activities: ['fireworks', 'final-feast', 'awards'],
          },
        ],
      };

      const events = {
        'seasonal-festival': complexEvent,
      };

      mockCoreEvents.mockReturnValue(events);

      const result = eventGet('seasonal-festival');

      expect(result).toEqual(complexEvent);
      expect((result as any).phases).toHaveLength(3);
      expect((result as any).effects[0].multiplier).toBe(1.5);
      expect((result as any).rewards.completion.titles).toContain(
        'Festival Participant',
      );
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle events with special characters in name', () => {
      const events = {
        'event-with_special.chars!': {
          name: 'Special Event',
          description: 'An event with unusual naming',
        },
      };

      mockCoreEvents.mockReturnValue(events);

      const result = eventGet('event-with_special.chars!');

      expect(result).toEqual(events['event-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should return the exact object reference', () => {
      const eventObject = {
        name: 'Reference Test',
        description: 'Testing object references',
      };

      const events = { 'reference-test': eventObject };
      mockCoreEvents.mockReturnValue(events);

      const result = eventGet('reference-test');

      expect(result).toBe(eventObject); // Same reference
    });

    it('should handle null and undefined event values', () => {
      const events = {
        'null-event': null,
        'undefined-event': undefined,
        'valid-event': { name: 'Valid Event' },
      };

      mockCoreEvents.mockReturnValue(events);

      // Null event should be treated as non-existent
      const nullResult = eventGet('null-event');
      expect(nullResult).toBeNull();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Event:null-event',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Undefined event should be treated as non-existent
      const undefinedResult = eventGet('undefined-event');
      expect(undefinedResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Event:undefined-event',
        expect.any(Error),
      );

      vi.clearAllMocks();

      // Valid event should work normally
      const validResult = eventGet('valid-event');
      expect(validResult).toEqual(events['valid-event']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle realistic event scenarios', () => {
      const realisticEvents = {
        'blood-moon': {
          name: 'Blood Moon Rising',
          description: 'The moon turns red, empowering dark creatures',
          type: 'world-event',
          duration: 7200000, // 2 hours
          rarity: 'rare',
          conditions: {
            timeOfDay: 'night',
            moonPhase: 'full',
          },
          effects: [
            { type: 'monster-spawn-rate', multiplier: 2.5 },
            { type: 'undead-power-boost', percentage: 50 },
            { type: 'darkness-vision', reduced: true },
          ],
          loot: {
            bonusChance: 0.15,
            specialDrops: ['blood-crystal', 'lunar-essence'],
          },
          warnings: [
            { time: 300000, message: 'The moon begins to darken...' },
            { time: 60000, message: 'Dark energy fills the air!' },
            { time: 0, message: 'The Blood Moon rises!' },
          ],
        },
        'merchant-caravan': {
          name: 'Traveling Merchant Caravan',
          description: 'A caravan of exotic merchants arrives',
          type: 'economic-event',
          duration: 14400000, // 4 hours
          rarity: 'common',
          effects: [
            { type: 'special-shop-access', enabled: true },
            { type: 'trade-prices', discount: 0.1 },
          ],
          merchants: [
            {
              name: 'Exotic Goods Trader',
              items: ['rare-spices', 'foreign-textiles', 'ancient-maps'],
              currency: 'gold',
            },
            {
              name: 'Magical Artifact Dealer',
              items: ['enchanted-trinkets', 'spell-scrolls', 'mana-crystals'],
              currency: 'silver',
            },
          ],
        },
      };

      mockCoreEvents.mockReturnValue(realisticEvents);

      const bloodMoon = eventGet('blood-moon');
      expect((bloodMoon as any).rarity).toBe('rare');
      expect((bloodMoon as any).effects).toHaveLength(3);
      expect((bloodMoon as any).warnings[0].time).toBe(300000);

      const caravan = eventGet('merchant-caravan');
      expect((caravan as any).merchants).toHaveLength(2);
      expect((caravan as any).merchants[0].name).toBe('Exotic Goods Trader');
    });

    it('should handle event categories and types', () => {
      const categorizedEvents = {
        'pvp-tournament': {
          name: 'PvP Tournament',
          type: 'competition',
          category: 'player-vs-player',
        },
        'boss-raid': {
          name: 'Ancient Dragon Raid',
          type: 'pve-challenge',
          category: 'group-content',
        },
        'harvest-season': {
          name: 'Harvest Season',
          type: 'economic',
          category: 'crafting-boost',
        },
      };

      mockCoreEvents.mockReturnValue(categorizedEvents);

      const tournament = eventGet('pvp-tournament');
      expect((tournament as any).category).toBe('player-vs-player');

      const raid = eventGet('boss-raid');
      expect((raid as any).type).toBe('pve-challenge');

      const harvest = eventGet('harvest-season');
      expect((harvest as any).category).toBe('crafting-boost');
    });

    it('should maintain performance with large event collections', () => {
      // Simulate a large event database
      const largeEventCollection: any = {};
      for (let i = 0; i < 500; i++) {
        largeEventCollection[`event-${i}`] = {
          name: `Event ${i}`,
          description: `Description for event ${i}`,
          duration: i * 60000 + 300000, // Variable durations
          type: i % 3 === 0 ? 'world' : i % 3 === 1 ? 'economic' : 'social',
        };
      }

      mockCoreEvents.mockReturnValue(largeEventCollection);

      // Should quickly find existing events
      const event250 = eventGet('event-250');
      expect((event250 as any).name).toBe('Event 250');

      // Should quickly determine non-existence
      const nonExistent = eventGet('event-9999');
      expect(nonExistent).toBeUndefined();

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent access patterns', () => {
      const events = {
        'event-1': { name: 'Event 1', type: 'world' },
        'event-2': { name: 'Event 2', type: 'economic' },
        'event-3': { name: 'Event 3', type: 'social' },
      };

      mockCoreEvents.mockReturnValue(events);

      // Simulate concurrent access
      const results = ['event-1', 'event-2', 'event-3'].map((name) => ({
        event: eventGet(name),
      }));

      results.forEach((result, index) => {
        expect(result.event).toEqual(events[`event-${index + 1}`]);
      });

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle events with timing and scheduling data', () => {
      const timedEvent = {
        name: 'Daily Reset Event',
        description: 'Resets various daily mechanics',
        type: 'system',
        schedule: {
          frequency: 'daily',
          time: '00:00:00',
          timezone: 'UTC',
        },
        duration: 60000, // 1 minute
        actions: [
          { type: 'reset-daily-quests' },
          { type: 'reset-dungeon-limits' },
          { type: 'refresh-vendor-stock' },
          { type: 'clear-temporary-buffs' },
        ],
        notifications: {
          warning: { time: 300000, message: 'Daily reset in 5 minutes' },
          start: { message: 'Daily reset in progress...' },
          complete: { message: 'Daily reset complete!' },
        },
      };

      const events = { 'daily-reset': timedEvent };
      mockCoreEvents.mockReturnValue(events);

      const result = eventGet('daily-reset');

      expect(result).toEqual(timedEvent);
      expect((result as any).schedule.frequency).toBe('daily');
      expect((result as any).actions).toHaveLength(4);
      expect((result as any).notifications.warning.time).toBe(300000);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when coreEvents returns null', () => {
      mockCoreEvents.mockReturnValue(null);

      expect(() => eventGet('any')).toThrow();
    });

    it('should handle when coreEvents returns undefined', () => {
      mockCoreEvents.mockReturnValue(undefined);

      expect(() => eventGet('any')).toThrow();
    });

    it('should handle very long event names', () => {
      const longEventName =
        'very-long-event-name-that-exceeds-normal-limits-and-continues-for-a-very-long-time-to-test-edge-cases-with-extended-naming';

      const events = {};
      mockCoreEvents.mockReturnValue(events);

      eventGet(longEventName);

      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        `Content:Event:${longEventName}`,
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toContain(longEventName);
    });

    it('should handle events with numeric and special character names', () => {
      const events = {
        '123-numeric-event': { name: 'Numeric Event' },
        'event@#$%special': { name: 'Special Characters Event' },
        'event.with.dots': { name: 'Dotted Event' },
      };

      mockCoreEvents.mockReturnValue(events);

      expect(eventGet('123-numeric-event')).toEqual(
        events['123-numeric-event'],
      );
      expect(eventGet('event@#$%special')).toEqual(events['event@#$%special']);
      expect(eventGet('event.with.dots')).toEqual(events['event.with.dots']);

      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });
  });
});
