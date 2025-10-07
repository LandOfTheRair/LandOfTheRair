import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isPlayer } from './player';
import { getBaseStat, getStat } from './stats';

// Mock the player module
vi.mock('./player', () => ({
  isPlayer: vi.fn(),
}));

describe('Stats Functions', () => {
  const createMockCharacter = (
    totalStats: Partial<Record<Stat, number>> = {},
    baseStats: Partial<Record<Stat, number>> = {},
  ): ICharacter =>
    ({
      totalStats,
      stats: baseStats,
    }) as unknown as ICharacter;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isPlayer).mockReturnValue(false); // Default to non-player
  });

  describe('getStat', () => {
    it('should return the total stat value when it exists', () => {
      const character = createMockCharacter({ [Stat.STR]: 15 });

      const result = getStat(character, Stat.STR);

      expect(result).toBe(15);
    });

    it('should return 0 when stat does not exist', () => {
      const character = createMockCharacter({});

      const result = getStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should return 0 when stat is undefined', () => {
      const character = createMockCharacter({ [Stat.STR]: undefined as any });

      const result = getStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should return 0 when stat is null', () => {
      const character = createMockCharacter({ [Stat.STR]: null as any });

      const result = getStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should return 0 for negative Mitigation stat', () => {
      const character = createMockCharacter({ [Stat.Mitigation]: -5 });

      const result = getStat(character, Stat.Mitigation);

      expect(result).toBe(0);
    });

    it('should return positive Mitigation stat normally', () => {
      const character = createMockCharacter({ [Stat.Mitigation]: 25 });

      const result = getStat(character, Stat.Mitigation);

      expect(result).toBe(25);
    });

    it('should return 1 for zero DamageFactor stat', () => {
      const character = createMockCharacter({ [Stat.DamageFactor]: 0 });

      const result = getStat(character, Stat.DamageFactor);

      expect(result).toBe(1);
    });

    it('should return 1 + value for non-zero DamageFactor stat when character is player', () => {
      vi.mocked(isPlayer).mockReturnValue(true);
      const character = createMockCharacter({ [Stat.DamageFactor]: 3 });

      const result = getStat(character, Stat.DamageFactor);

      expect(result).toBe(4); // 1 + 3
    });

    it('should return raw value for non-zero DamageFactor stat when character is not player', () => {
      vi.mocked(isPlayer).mockReturnValue(false);
      const character = createMockCharacter({ [Stat.DamageFactor]: 3 });

      const result = getStat(character, Stat.DamageFactor);

      expect(result).toBe(3);
    });

    it('should handle negative DamageFactor for players', () => {
      vi.mocked(isPlayer).mockReturnValue(true);
      const character = createMockCharacter({ [Stat.DamageFactor]: -2 });

      const result = getStat(character, Stat.DamageFactor);

      expect(result).toBe(-1); // 1 + (-2)
    });

    it('should handle fractional stats', () => {
      const character = createMockCharacter({ [Stat.STR]: 15.5 });

      const result = getStat(character, Stat.STR);

      expect(result).toBe(15.5);
    });

    it('should work with all different stat types', () => {
      const character = createMockCharacter({
        [Stat.STR]: 10,
        [Stat.DEX]: 12,
        [Stat.AGI]: 14,
        [Stat.INT]: 16,
        [Stat.WIS]: 18,
        [Stat.HP]: 100,
        [Stat.MP]: 50,
      });

      expect(getStat(character, Stat.STR)).toBe(10);
      expect(getStat(character, Stat.DEX)).toBe(12);
      expect(getStat(character, Stat.AGI)).toBe(14);
      expect(getStat(character, Stat.INT)).toBe(16);
      expect(getStat(character, Stat.WIS)).toBe(18);
      expect(getStat(character, Stat.HP)).toBe(100);
      expect(getStat(character, Stat.MP)).toBe(50);
    });

    it('should handle zero Mitigation correctly', () => {
      const character = createMockCharacter({ [Stat.Mitigation]: 0 });

      const result = getStat(character, Stat.Mitigation);

      expect(result).toBe(0);
    });

    it('should call isPlayer when checking DamageFactor', () => {
      const character = createMockCharacter({ [Stat.DamageFactor]: 5 });

      getStat(character, Stat.DamageFactor);

      expect(vi.mocked(isPlayer)).toHaveBeenCalledWith(character);
    });

    it('should not call isPlayer for non-DamageFactor stats', () => {
      const character = createMockCharacter({ [Stat.STR]: 15 });

      getStat(character, Stat.STR);

      expect(vi.mocked(isPlayer)).not.toHaveBeenCalled();
    });

    it('should handle very large stat values', () => {
      const character = createMockCharacter({ [Stat.STR]: 9999 });

      const result = getStat(character, Stat.STR);

      expect(result).toBe(9999);
    });

    it('should handle very negative stat values', () => {
      const character = createMockCharacter({ [Stat.STR]: -100 });

      const result = getStat(character, Stat.STR);

      expect(result).toBe(-100);
    });
  });

  describe('getBaseStat', () => {
    it('should return the base stat value when it exists', () => {
      const character = createMockCharacter({}, { [Stat.STR]: 10 });

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(10);
    });

    it('should return 0 when base stat does not exist', () => {
      const character = createMockCharacter({}, {});

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should return 0 when base stat is undefined', () => {
      const character = createMockCharacter(
        {},
        { [Stat.STR]: undefined as any },
      );

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should return 0 when base stat is null', () => {
      const character = createMockCharacter({}, { [Stat.STR]: null as any });

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should handle negative base stats', () => {
      const character = createMockCharacter({}, { [Stat.STR]: -5 });

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(-5);
    });

    it('should handle fractional base stats', () => {
      const character = createMockCharacter({}, { [Stat.STR]: 12.5 });

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(12.5);
    });

    it('should work with all different stat types', () => {
      const character = createMockCharacter(
        {},
        {
          [Stat.STR]: 8,
          [Stat.DEX]: 10,
          [Stat.AGI]: 12,
          [Stat.INT]: 14,
          [Stat.WIS]: 16,
          [Stat.HP]: 80,
          [Stat.MP]: 40,
        },
      );

      expect(getBaseStat(character, Stat.STR)).toBe(8);
      expect(getBaseStat(character, Stat.DEX)).toBe(10);
      expect(getBaseStat(character, Stat.AGI)).toBe(12);
      expect(getBaseStat(character, Stat.INT)).toBe(14);
      expect(getBaseStat(character, Stat.WIS)).toBe(16);
      expect(getBaseStat(character, Stat.HP)).toBe(80);
      expect(getBaseStat(character, Stat.MP)).toBe(40);
    });

    it('should not apply any special rules like getStat does', () => {
      const character = createMockCharacter(
        {},
        {
          [Stat.Mitigation]: -10,
          [Stat.DamageFactor]: 0,
        },
      );

      expect(getBaseStat(character, Stat.Mitigation)).toBe(-10); // Should not be clamped to 0
      expect(getBaseStat(character, Stat.DamageFactor)).toBe(0); // Should not be 1
    });

    it('should handle zero base stats', () => {
      const character = createMockCharacter({}, { [Stat.STR]: 0 });

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(0);
    });

    it('should handle very large base stat values', () => {
      const character = createMockCharacter({}, { [Stat.STR]: 9999 });

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(9999);
    });

    it('should be independent of totalStats', () => {
      const character = createMockCharacter(
        { [Stat.STR]: 100 }, // totalStats
        { [Stat.STR]: 10 }, // baseStats
      );

      const result = getBaseStat(character, Stat.STR);

      expect(result).toBe(10); // Should return baseStats, not totalStats
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with both getStat and getBaseStat', () => {
      const character = createMockCharacter(
        { [Stat.STR]: 20, [Stat.DamageFactor]: 3 },
        { [Stat.STR]: 15, [Stat.DamageFactor]: 2 },
      );

      expect(getStat(character, Stat.STR)).toBe(20);
      expect(getBaseStat(character, Stat.STR)).toBe(15);
      expect(getStat(character, Stat.DamageFactor)).toBe(3); // Non-player
      expect(getBaseStat(character, Stat.DamageFactor)).toBe(2);
    });

    it('should handle missing stats consistently', () => {
      const character = createMockCharacter({}, {});

      expect(getStat(character, Stat.STR)).toBe(0);
      expect(getBaseStat(character, Stat.STR)).toBe(0);
    });
  });
});
