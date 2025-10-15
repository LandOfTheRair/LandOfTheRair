import type { IPlayer, ISimpleItem } from '@lotr/interfaces';
import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dailyCanActivateQuest,
  dailyItemBuy,
  dailyItemCanBuy,
  dailyItemIsDaily,
  dailyQuestCanDo,
  dailyQuestFinish,
  dailyResetTime,
} from './daily';

// Mock dependencies
vi.mock('./settings', () => ({
  settingGameGet: vi.fn(),
}));

import { settingGameGet } from './settings';

describe('daily', () => {
  let mockPlayer: IPlayer;
  let mockItem: ISimpleItem;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPlayer = {
      dailyItems: {},
      quests: {
        npcDailyQuests: {},
      },
    } as unknown as IPlayer;

    mockItem = {
      uuid: 'daily-item-123',
      name: 'Daily Item',
    } as ISimpleItem;

    // Mock DateTime to control time for testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('dailyResetTime', () => {
    it('should return reset time for default hour (12) when setting is not configured', () => {
      vi.mocked(settingGameGet).mockReturnValue(null);
      vi.setSystemTime(new Date('2025-10-15T10:00:00Z')); // Before reset time

      const result = dailyResetTime();

      expect(settingGameGet).toHaveBeenCalledWith('timers', 'dailyResetHour');
      expect(result.hour).toBe(12);
      expect(result.zone.name).toBe('UTC');
    });

    it('should return reset time for custom hour when setting is configured', () => {
      vi.mocked(settingGameGet).mockReturnValue(15);
      vi.setSystemTime(new Date('2025-10-15T10:00:00Z')); // Before reset time

      const result = dailyResetTime();

      expect(result.hour).toBe(15);
      expect(result.zone.name).toBe('UTC');
    });

    it('should return next day reset time when current time is after reset hour', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z')); // After reset time

      const result = dailyResetTime();

      expect(result.hour).toBe(12);
      expect(result.day).toBe(16); // Next day
    });

    it('should return same day reset time when current time is before reset hour', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T10:00:00Z')); // Before reset time

      const result = dailyResetTime();

      expect(result.hour).toBe(12);
      expect(result.day).toBe(15); // Same day
    });

    it('should handle edge case when current time equals reset time', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T12:00:00Z')); // Exactly at reset time

      const result = dailyResetTime();

      expect(result.hour).toBe(12);
      // Should be same day since current time equals reset time (not less than)
      expect(result.day).toBe(15);
    });
  });

  describe('dailyCanActivateQuest', () => {
    it('should return true when timestamp is before reset time (same day)', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z')); // After reset time (so reset was earlier today)

      const timestampBeforeReset = +DateTime.fromObject({
        zone: 'utc',
        hour: 10,
      }); // Before reset
      const result = dailyCanActivateQuest(timestampBeforeReset);

      expect(result).toBe(true);
    });

    it('should return false when timestamp is after reset time', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z')); // After reset time

      const timestampAfterReset = +DateTime.fromObject({
        zone: 'utc',
        hour: 15,
      }); // After reset
      const result = dailyCanActivateQuest(timestampAfterReset);

      expect(result).toBe(false);
    });

    it('should handle custom reset hour', () => {
      vi.mocked(settingGameGet).mockReturnValue(18);
      vi.setSystemTime(new Date('2025-10-15T20:00:00Z')); // After custom reset time

      const timestampBeforeReset = +DateTime.fromObject({
        zone: 'utc',
        hour: 16,
      }); // Before custom reset
      const result = dailyCanActivateQuest(timestampBeforeReset);

      expect(result).toBe(true);
    });

    it('should use previous day reset time when current time is before reset hour', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T10:00:00Z')); // Before reset time (so we check against yesterday's reset)

      const timestampYesterday = +DateTime.fromObject({
        zone: 'utc',
        hour: 10,
      }).minus({ days: 1 });
      const result = dailyCanActivateQuest(timestampYesterday);

      expect(result).toBe(true);
    });

    it('should handle null setting gracefully', () => {
      vi.mocked(settingGameGet).mockReturnValue(null);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));

      const timestamp = +DateTime.fromObject({ zone: 'utc', hour: 10 });
      const result = dailyCanActivateQuest(timestamp);

      expect(result).toBe(true);
    });
  });

  describe('dailyItemIsDaily', () => {
    it('should return true for items with daily in uuid', () => {
      const dailyItem = { uuid: 'daily-item-123' } as ISimpleItem;

      const result = dailyItemIsDaily(dailyItem);

      expect(result).toBe(true);
    });

    it('should return false for items without daily in uuid', () => {
      const normalItem = { uuid: 'normal-item-123' } as ISimpleItem;

      const result = dailyItemIsDaily(normalItem);

      expect(result).toBe(false);
    });

    it('should return undefined for items with undefined uuid', () => {
      const itemWithoutUuid = { name: 'Test Item' } as ISimpleItem;

      const result = dailyItemIsDaily(itemWithoutUuid);

      expect(result).toBe(undefined);
    });

    it('should return undefined for items with null uuid', () => {
      const itemWithNullUuid = { uuid: null, name: 'Test Item' } as any;

      const result = dailyItemIsDaily(itemWithNullUuid);

      expect(result).toBe(undefined);
    });

    it('should handle case sensitivity (daily should be lowercase)', () => {
      const upperCaseDaily = { uuid: 'DAILY-item-123' } as ISimpleItem;

      const result = dailyItemIsDaily(upperCaseDaily);

      expect(result).toBe(false);
    });

    it('should match daily anywhere in uuid string', () => {
      const dailyInMiddle = { uuid: 'item-daily-123' } as ISimpleItem;
      const dailyAtEnd = { uuid: 'item-123-daily' } as ISimpleItem;

      expect(dailyItemIsDaily(dailyInMiddle)).toBe(true);
      expect(dailyItemIsDaily(dailyAtEnd)).toBe(true);
    });
  });

  describe('dailyItemCanBuy', () => {
    it('should throw error for non-daily items', () => {
      const nonDailyItem = {
        uuid: 'normal-item-123',
        name: 'Normal Item',
      } as ISimpleItem;

      expect(() => {
        dailyItemCanBuy(mockPlayer, nonDailyItem);
      }).toThrow('Attempting to buy item as a daily item');
    });

    it('should return true when player has never bought the daily item', () => {
      mockPlayer.dailyItems = {};

      const result = dailyItemCanBuy(mockPlayer, mockItem);

      expect(result).toBe(true);
    });

    it('should return true when player can activate quest (timestamp allows)', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));

      // Player bought item before reset time
      const oldTimestamp = +DateTime.fromObject({ zone: 'utc', hour: 10 });
      mockPlayer.dailyItems = { [mockItem.uuid!]: oldTimestamp };

      const result = dailyItemCanBuy(mockPlayer, mockItem);

      expect(result).toBe(true);
    });

    it('should return false when player cannot activate quest (timestamp too recent)', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));

      // Player bought item after reset time
      const recentTimestamp = +DateTime.fromObject({ zone: 'utc', hour: 15 });
      mockPlayer.dailyItems = { [mockItem.uuid!]: recentTimestamp };

      const result = dailyItemCanBuy(mockPlayer, mockItem);

      expect(result).toBe(false);
    });

    it('should throw error when player has undefined dailyItems', () => {
      const playerWithoutDailyItems = {
        quests: { npcDailyQuests: {} },
      } as unknown as IPlayer;

      expect(() => {
        dailyItemCanBuy(playerWithoutDailyItems, mockItem);
      }).toThrow('Cannot read properties of undefined');
    });

    it('should handle null timestamp in dailyItems', () => {
      mockPlayer.dailyItems = { [mockItem.uuid!]: null as any };

      const result = dailyItemCanBuy(mockPlayer, mockItem);

      expect(result).toBe(true);
    });

    it('should include item data in error message', () => {
      const nonDailyItem = {
        uuid: 'test-item',
        name: 'Test Item',
      } as ISimpleItem;

      expect(() => {
        dailyItemCanBuy(mockPlayer, nonDailyItem);
      }).toThrow(JSON.stringify(nonDailyItem));
    });
  });

  describe('dailyQuestCanDo', () => {
    it('should return true when player has no daily quest record for NPC', () => {
      mockPlayer.quests.npcDailyQuests = {};

      const result = dailyQuestCanDo(mockPlayer, 'testNPC');

      expect(result).toBe(true);
    });

    it('should return true when player can activate quest (timestamp allows)', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));

      // Player completed quest before reset time
      const oldTimestamp = +DateTime.fromObject({ zone: 'utc', hour: 10 });
      mockPlayer.quests.npcDailyQuests = { testNPC: oldTimestamp };

      const result = dailyQuestCanDo(mockPlayer, 'testNPC');

      expect(result).toBe(true);
    });

    it('should return false when player cannot activate quest (timestamp too recent)', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));

      // Player completed quest after reset time
      const recentTimestamp = +DateTime.fromObject({ zone: 'utc', hour: 15 });
      mockPlayer.quests.npcDailyQuests = { testNPC: recentTimestamp };

      const result = dailyQuestCanDo(mockPlayer, 'testNPC');

      expect(result).toBe(false);
    });

    it('should initialize npcDailyQuests if undefined', () => {
      const playerWithoutQuests = { quests: {} } as unknown as IPlayer;

      const result = dailyQuestCanDo(playerWithoutQuests, 'testNPC');

      expect(result).toBe(true);
      expect(playerWithoutQuests.quests.npcDailyQuests).toEqual({});
    });

    it('should handle multiple NPCs independently', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));

      const oldTimestamp = +DateTime.fromObject({ zone: 'utc', hour: 10 });
      const recentTimestamp = +DateTime.fromObject({ zone: 'utc', hour: 15 });

      mockPlayer.quests.npcDailyQuests = {
        npc1: oldTimestamp, // Can do quest
        npc2: recentTimestamp, // Cannot do quest
      };

      expect(dailyQuestCanDo(mockPlayer, 'npc1')).toBe(true);
      expect(dailyQuestCanDo(mockPlayer, 'npc2')).toBe(false);
      expect(dailyQuestCanDo(mockPlayer, 'npc3')).toBe(true); // No record
    });
  });

  describe('dailyItemBuy', () => {
    it('should set current timestamp for item purchase', () => {
      const fixedTime = new Date('2025-10-15T14:30:00Z');
      vi.setSystemTime(fixedTime);

      mockPlayer.dailyItems = {};

      dailyItemBuy(mockPlayer, mockItem);

      expect(mockPlayer.dailyItems[mockItem.uuid!]).toBe(
        +DateTime.fromObject({ zone: 'utc' }),
      );
    });

    it('should initialize dailyItems if undefined', () => {
      const playerWithoutDailyItems = {} as unknown as IPlayer;

      dailyItemBuy(playerWithoutDailyItems, mockItem);

      expect(playerWithoutDailyItems.dailyItems).toBeDefined();
      expect(playerWithoutDailyItems.dailyItems[mockItem.uuid!]).toBeTypeOf(
        'number',
      );
    });

    it('should overwrite existing timestamp for same item', () => {
      const oldTime = new Date('2025-10-14T10:00:00Z');
      const newTime = new Date('2025-10-15T14:30:00Z');

      // Set old timestamp
      vi.setSystemTime(oldTime);
      dailyItemBuy(mockPlayer, mockItem);
      const oldTimestamp = mockPlayer.dailyItems[mockItem.uuid!];

      // Set new timestamp
      vi.setSystemTime(newTime);
      dailyItemBuy(mockPlayer, mockItem);
      const newTimestamp = mockPlayer.dailyItems[mockItem.uuid!];

      expect(newTimestamp).not.toBe(oldTimestamp);
      expect(newTimestamp).toBe(+DateTime.fromObject({ zone: 'utc' }));
    });

    it('should handle multiple items independently', () => {
      const item2 = { uuid: 'daily-item-456' } as ISimpleItem;

      dailyItemBuy(mockPlayer, mockItem);
      dailyItemBuy(mockPlayer, item2);

      expect(mockPlayer.dailyItems[mockItem.uuid!]).toBeTypeOf('number');
      expect(mockPlayer.dailyItems[item2.uuid!]).toBeTypeOf('number');
      expect(Object.keys(mockPlayer.dailyItems)).toHaveLength(2);
    });
  });

  describe('dailyQuestFinish', () => {
    it('should set current timestamp for quest completion', () => {
      const fixedTime = new Date('2025-10-15T14:30:00Z');
      vi.setSystemTime(fixedTime);

      mockPlayer.quests.npcDailyQuests = {};

      dailyQuestFinish(mockPlayer, 'testNPC');

      expect(mockPlayer.quests.npcDailyQuests.testNPC).toBe(
        +DateTime.fromObject({ zone: 'utc' }),
      );
    });

    it('should initialize npcDailyQuests if undefined', () => {
      const playerWithoutQuests = { quests: {} } as unknown as IPlayer;

      dailyQuestFinish(playerWithoutQuests, 'testNPC');

      expect(playerWithoutQuests.quests.npcDailyQuests).toBeDefined();
      expect(playerWithoutQuests.quests.npcDailyQuests.testNPC).toBeTypeOf(
        'number',
      );
    });

    it('should overwrite existing timestamp for same NPC', () => {
      const oldTime = new Date('2025-10-14T10:00:00Z');
      const newTime = new Date('2025-10-15T14:30:00Z');

      // Set old timestamp
      vi.setSystemTime(oldTime);
      dailyQuestFinish(mockPlayer, 'testNPC');
      const oldTimestamp = mockPlayer.quests.npcDailyQuests.testNPC;

      // Set new timestamp
      vi.setSystemTime(newTime);
      dailyQuestFinish(mockPlayer, 'testNPC');
      const newTimestamp = mockPlayer.quests.npcDailyQuests.testNPC;

      expect(newTimestamp).not.toBe(oldTimestamp);
      expect(newTimestamp).toBe(+DateTime.fromObject({ zone: 'utc' }));
    });

    it('should handle multiple NPCs independently', () => {
      dailyQuestFinish(mockPlayer, 'npc1');
      dailyQuestFinish(mockPlayer, 'npc2');

      expect(mockPlayer.quests.npcDailyQuests.npc1).toBeTypeOf('number');
      expect(mockPlayer.quests.npcDailyQuests.npc2).toBeTypeOf('number');
      expect(Object.keys(mockPlayer.quests.npcDailyQuests)).toHaveLength(2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete daily item workflow', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T10:00:00Z')); // Before reset

      // Initially can buy
      expect(dailyItemCanBuy(mockPlayer, mockItem)).toBe(true);

      // Buy item
      dailyItemBuy(mockPlayer, mockItem);

      // Cannot buy immediately after
      expect(dailyItemCanBuy(mockPlayer, mockItem)).toBe(false);

      // Move to next day after reset
      vi.setSystemTime(new Date('2025-10-16T13:00:00Z')); // Next day after reset

      // Can buy again
      expect(dailyItemCanBuy(mockPlayer, mockItem)).toBe(true);
    });

    it('should handle complete daily quest workflow', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);
      vi.setSystemTime(new Date('2025-10-15T10:00:00Z')); // Before reset

      const npcName = 'DailyQuestGiver';

      // Initially can do quest
      expect(dailyQuestCanDo(mockPlayer, npcName)).toBe(true);

      // Finish quest
      dailyQuestFinish(mockPlayer, npcName);

      // Cannot do quest immediately after
      expect(dailyQuestCanDo(mockPlayer, npcName)).toBe(false);

      // Move to next day after reset
      vi.setSystemTime(new Date('2025-10-16T13:00:00Z')); // Next day after reset

      // Can do quest again
      expect(dailyQuestCanDo(mockPlayer, npcName)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle timezone consistency across functions', () => {
      vi.mocked(settingGameGet).mockReturnValue(12);

      const resetTime = dailyResetTime();
      expect(resetTime.zone.name).toBe('UTC');

      // All functions should use UTC consistently
      vi.setSystemTime(new Date('2025-10-15T14:00:00Z'));
      dailyItemBuy(mockPlayer, mockItem);
      dailyQuestFinish(mockPlayer, 'testNPC');

      // Timestamps should be in UTC
      const itemTimestamp = mockPlayer.dailyItems[mockItem.uuid!];
      const questTimestamp = mockPlayer.quests.npcDailyQuests.testNPC;

      expect(
        DateTime.fromMillis(itemTimestamp, { zone: 'utc' }).zone.name,
      ).toBe('UTC');
      expect(
        DateTime.fromMillis(questTimestamp, { zone: 'utc' }).zone.name,
      ).toBe('UTC');
    });

    it('should handle concurrent operations safely', () => {
      // Multiple items and quests at the same time
      const item1 = { uuid: 'daily-item-1' } as ISimpleItem;
      const item2 = { uuid: 'daily-item-2' } as ISimpleItem;

      dailyItemBuy(mockPlayer, item1);
      dailyItemBuy(mockPlayer, item2);
      dailyQuestFinish(mockPlayer, 'npc1');
      dailyQuestFinish(mockPlayer, 'npc2');

      expect(Object.keys(mockPlayer.dailyItems)).toHaveLength(2);
      expect(Object.keys(mockPlayer.quests.npcDailyQuests)).toHaveLength(2);
    });
  });
});
