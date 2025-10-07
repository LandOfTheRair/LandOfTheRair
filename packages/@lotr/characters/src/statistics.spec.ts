import type { IPlayer, TrackedStatistic } from '@lotr/interfaces';
import { BaseClass } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addStatistic,
  syncBaseStatistics,
  syncSessionStatistics,
} from './statistics';

describe('Statistics Functions', () => {
  const createMockPlayer = (overrides: Partial<IPlayer> = {}): IPlayer =>
    ({
      uuid: 'test-player-uuid',
      name: 'Test Player',
      username: 'testuser',
      baseClass: BaseClass.Warrior,
      level: 10,
      exp: 1000,
      charSlot: 0,
      statistics: {
        statistics: {},
        baseClass: BaseClass.Warrior,
        xp: 0,
        name: '',
        level: 0,
        username: '',
        charSlot: 0,
      },
      sessionStatistics: {
        statistics: {},
        end: 0,
        baseClass: BaseClass.Warrior,
        name: '',
        level: 0,
      },
      ...overrides,
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addStatistic', () => {
    it('should add a statistic to both statistics and sessionStatistics', () => {
      const player = createMockPlayer();
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic, 5);

      expect(player.statistics.statistics[statistic]).toBe(5);
      expect(player.sessionStatistics.statistics[statistic]).toBe(5);
    });

    it('should default to adding 1 when number is not provided', () => {
      const player = createMockPlayer();
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic);

      expect(player.statistics.statistics[statistic]).toBe(1);
      expect(player.sessionStatistics.statistics[statistic]).toBe(1);
    });

    it('should accumulate statistics when called multiple times', () => {
      const player = createMockPlayer();
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic, 3);
      addStatistic(player, statistic, 2);

      expect(player.statistics.statistics[statistic]).toBe(5);
      expect(player.sessionStatistics.statistics[statistic]).toBe(5);
    });

    it('should handle existing statistics', () => {
      const player = createMockPlayer({
        statistics: {
          statistics: { 'Combat/Kill': 10 },
          baseClass: BaseClass.Warrior,
          xp: 0,
          name: '',
          level: 0,
          username: '',
          charSlot: 0,
        } as any,
        sessionStatistics: {
          statistics: { 'Combat/Kill': 5 },
          end: 0,
          baseClass: BaseClass.Warrior,
          name: '',
          level: 0,
        } as any,
      });
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic, 3);

      expect(player.statistics.statistics[statistic]).toBe(13);
      expect(player.sessionStatistics.statistics[statistic]).toBe(8);
    });

    it('should handle zero number', () => {
      const player = createMockPlayer();
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic, 0);

      expect(player.statistics.statistics[statistic]).toBe(0);
      expect(player.sessionStatistics.statistics[statistic]).toBe(0);
    });

    it('should handle negative numbers', () => {
      const player = createMockPlayer();
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic, -5);

      expect(player.statistics.statistics[statistic]).toBe(-5);
      expect(player.sessionStatistics.statistics[statistic]).toBe(-5);
    });

    it('should handle undefined number parameter', () => {
      const player = createMockPlayer();
      const statistic: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;

      addStatistic(player, statistic, undefined as any);

      expect(player.statistics.statistics[statistic]).toBe(1);
      expect(player.sessionStatistics.statistics[statistic]).toBe(1);
    });

    it('should return early when player is null', () => {
      expect(() =>
        addStatistic(null as any, 'Combat/Kill' as TrackedStatistic, 5),
      ).not.toThrow();
    });

    it('should return early when player is undefined', () => {
      expect(() =>
        addStatistic(undefined as any, 'Combat/Kill' as TrackedStatistic, 5),
      ).not.toThrow();
    });

    it('should return early when player.statistics is undefined', () => {
      const player = createMockPlayer({ statistics: undefined as any });

      expect(() =>
        addStatistic(player, 'Combat/Kill' as TrackedStatistic, 5),
      ).not.toThrow();
    });

    it('should handle different statistic types', () => {
      const player = createMockPlayer();
      const stat1: TrackedStatistic = 'Combat/Kill' as TrackedStatistic;
      const stat2: TrackedStatistic = 'Item/Craft' as TrackedStatistic;

      addStatistic(player, stat1, 3);
      addStatistic(player, stat2, 5);

      expect(player.statistics.statistics[stat1]).toBe(3);
      expect(player.statistics.statistics[stat2]).toBe(5);
      expect(player.sessionStatistics.statistics[stat1]).toBe(3);
      expect(player.sessionStatistics.statistics[stat2]).toBe(5);
    });
  });

  describe('syncBaseStatistics', () => {
    it('should sync all base properties to statistics', () => {
      const player = createMockPlayer({
        baseClass: BaseClass.Mage,
        exp: 5000,
        name: 'TestMage',
        level: 25,
        username: 'mageuser',
        charSlot: 2,
      });

      syncBaseStatistics(player);

      expect(player.statistics.baseClass).toBe('Mage');
      expect(player.statistics.xp).toBe(5000);
      expect(player.statistics.name).toBe('TestMage');
      expect(player.statistics.level).toBe(25);
      expect(player.statistics.username).toBe('mageuser');
      expect(player.statistics.charSlot).toBe(2);
    });

    it('should handle updating existing statistics', () => {
      const player = createMockPlayer({
        baseClass: BaseClass.Thief,
        exp: 2000,
        name: 'TestRogue',
        level: 15,
        username: 'rogueuser',
        charSlot: 1,
        statistics: {
          statistics: {},
          baseClass: 'OldClass',
          xp: 100,
          name: 'OldName',
          level: 5,
          username: 'olduser',
          charSlot: 0,
        } as any,
      });

      syncBaseStatistics(player);

      expect(player.statistics.baseClass).toBe(BaseClass.Thief);
      expect(player.statistics.xp).toBe(2000);
      expect(player.statistics.name).toBe('TestRogue');
      expect(player.statistics.level).toBe(15);
      expect(player.statistics.username).toBe('rogueuser');
      expect(player.statistics.charSlot).toBe(1);
    });

    it('should handle zero values', () => {
      const player = createMockPlayer({
        exp: 0,
        level: 0,
        charSlot: 0,
      });

      syncBaseStatistics(player);

      expect(player.statistics.xp).toBe(0);
      expect(player.statistics.level).toBe(0);
      expect(player.statistics.charSlot).toBe(0);
    });

    it('should handle empty string values', () => {
      const player = createMockPlayer({
        name: '',
        username: '',
        baseClass: undefined,
      });

      syncBaseStatistics(player);

      expect(player.statistics.name).toBe('');
      expect(player.statistics.username).toBe('');
      expect(player.statistics.baseClass).toBe(undefined);
    });
  });

  describe('syncSessionStatistics', () => {
    it('should sync session properties and set end time', () => {
      const mockTime = 1234567890123;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);

      const player = createMockPlayer({
        baseClass: BaseClass.Warrior,
        name: 'TestArcher',
        level: 20,
      });

      syncSessionStatistics(player);

      expect(player.sessionStatistics.end).toBe(mockTime);
      expect(player.sessionStatistics.baseClass).toBe(BaseClass.Warrior);
      expect(player.sessionStatistics.name).toBe('TestArcher');
      expect(player.sessionStatistics.level).toBe(20);
    });

    it('should update existing session statistics', () => {
      const mockTime = 9876543210987;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);

      const player = createMockPlayer({
        baseClass: BaseClass.Healer,
        name: 'TestHealer',
        level: 30,
        sessionStatistics: {
          statistics: {},
          end: 1111111111111,
          baseClass: 'OldClass',
          name: 'OldName',
          level: 10,
        } as any,
      });

      syncSessionStatistics(player);

      expect(player.sessionStatistics.end).toBe(mockTime);
      expect(player.sessionStatistics.baseClass).toBe('Healer');
      expect(player.sessionStatistics.name).toBe('TestHealer');
      expect(player.sessionStatistics.level).toBe(30);
    });

    it('should handle zero level', () => {
      const mockTime = 5555555555555;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);

      const player = createMockPlayer({
        level: 0,
      });

      syncSessionStatistics(player);

      expect(player.sessionStatistics.level).toBe(0);
      expect(player.sessionStatistics.end).toBe(mockTime);
    });

    it('should handle empty string values', () => {
      const player = createMockPlayer({
        baseClass: undefined,
        name: '',
      });

      syncSessionStatistics(player);

      expect(player.sessionStatistics.baseClass).toBe(undefined);
      expect(player.sessionStatistics.name).toBe('');
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with all functions together', () => {
      const mockTime = 1600000000000;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);

      const player = createMockPlayer({
        baseClass: BaseClass.Warrior,
        exp: 10000,
        name: 'TestPaladin',
        level: 50,
        username: 'paladinuser',
        charSlot: 3,
      });

      // Add some statistics
      addStatistic(player, 'Combat/Kill' as TrackedStatistic, 10);
      addStatistic(player, 'Item/Craft' as TrackedStatistic, 5);

      // Sync both base and session statistics
      syncBaseStatistics(player);
      syncSessionStatistics(player);

      // Verify statistics were added
      expect(player.statistics.statistics['Combat/Kill']).toBe(10);
      expect(player.sessionStatistics.statistics['Combat/Kill']).toBe(10);
      expect(player.statistics.statistics['Item/Craft']).toBe(5);
      expect(player.sessionStatistics.statistics['Item/Craft']).toBe(5);

      // Verify base sync
      expect(player.statistics.baseClass).toBe(BaseClass.Warrior);
      expect(player.statistics.xp).toBe(10000);
      expect(player.statistics.name).toBe('TestPaladin');
      expect(player.statistics.level).toBe(50);
      expect(player.statistics.username).toBe('paladinuser');
      expect(player.statistics.charSlot).toBe(3);

      // Verify session sync
      expect(player.sessionStatistics.baseClass).toBe(BaseClass.Warrior);
      expect(player.sessionStatistics.name).toBe('TestPaladin');
      expect(player.sessionStatistics.level).toBe(50);
      expect(player.sessionStatistics.end).toBe(mockTime);
    });
  });
});
