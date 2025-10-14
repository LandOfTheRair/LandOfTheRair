import { DamageClass, SwimLevel } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { swimLevelGet } from './swimming';

describe('Swimming Functions', () => {
  describe('swimLevelGet', () => {
    describe('Special GID Cases', () => {
      it('should return SpringWater for special GID ranges', () => {
        // Test special GID ranges that return SpringWater
        for (let gid = 2288; gid <= 2296; gid++) {
          const result = swimLevelGet(gid);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.SpringWater,
          });
        }

        // Test individual special GIDs
        expect(swimLevelGet(2200)).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });

        expect(swimLevelGet(2216)).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });

        // Test special GID range 2304-2312
        for (let gid = 2304; gid <= 2312; gid++) {
          const result = swimLevelGet(gid);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.SpringWater,
          });
        }
      });
    });

    describe('Basic Function Behavior', () => {
      it('should return objects with correct properties for valid GIDs', () => {
        const result = swimLevelGet(2200);
        expect(result).toHaveProperty('element');
        expect(result).toHaveProperty('swimLevel');
        expect(typeof result?.element).toBe('string');
        expect(typeof result?.swimLevel).toBe('number');
      });

      it('should handle GID 0', () => {
        const result = swimLevelGet(0);
        // Math.floor((0 - 1) / 48) = Math.floor(-1 / 48) = -1
        // SwimInfo[-1] should be undefined
        expect(result).toBeUndefined();
      });

      it('should handle negative GIDs', () => {
        expect(swimLevelGet(-1)).toBeUndefined();
        expect(swimLevelGet(-10)).toBeUndefined();
      });

      it('should handle very large GIDs', () => {
        expect(swimLevelGet(10000)).toBeUndefined();
        expect(swimLevelGet(50000)).toBeUndefined();
      });
    });

    describe('Row Calculation Math', () => {
      it('should calculate rows correctly', () => {
        expect(Math.floor((1 - 1) / 48)).toBe(0);
        expect(Math.floor((48 - 1) / 48)).toBe(0);
        expect(Math.floor((49 - 1) / 48)).toBe(1);
        expect(Math.floor((96 - 1) / 48)).toBe(1);
        expect(Math.floor((385 - 1) / 48)).toBe(8);
        expect(Math.floor((432 - 1) / 48)).toBe(8);
        expect(Math.floor((433 - 1) / 48)).toBe(9);
        expect(Math.floor((480 - 1) / 48)).toBe(9);
        expect(Math.floor((769 - 1) / 48)).toBe(16);
        expect(Math.floor((816 - 1) / 48)).toBe(16);
      });
    });

    describe('Enum Integration', () => {
      it('should use valid DamageClass values', () => {
        const result = swimLevelGet(2200);
        expect(Object.values(DamageClass)).toContain(result?.element);
      });

      it('should use valid SwimLevel values', () => {
        const result = swimLevelGet(2200);
        expect(Object.values(SwimLevel)).toContain(result?.swimLevel);
      });

      it('should have correct enum value types', () => {
        expect(DamageClass.Water).toBe('water');
        expect(DamageClass.Fire).toBe('fire');
        expect(SwimLevel.SpringWater).toBe(1);
        expect(SwimLevel.NormalWater).toBe(2);
        expect(SwimLevel.ChillWater).toBe(6);
        expect(SwimLevel.Lava).toBe(8);
      });
    });

    describe('Function Consistency', () => {
      it('should be deterministic', () => {
        const gid = 2200;
        const result1 = swimLevelGet(gid);
        const result2 = swimLevelGet(gid);
        expect(result1).toEqual(result2);
      });
    });

    describe('Edge Cases and Boundaries', () => {
      it('should handle GIDs just outside special ranges', () => {
        // These should not return SpringWater since they're outside special ranges
        const result1 = swimLevelGet(2287); // Just before 2288-2296
        const result2 = swimLevelGet(2297); // Just after 2288-2296
        const result3 = swimLevelGet(2199); // Just before 2200
        const result4 = swimLevelGet(2201); // Just after 2200
        const result5 = swimLevelGet(2215); // Just before 2216
        const result6 = swimLevelGet(2217); // Just after 2216

        // These should either be undefined or have different swim levels than SpringWater
        [result1, result2, result3, result4, result5, result6].forEach(
          (result) => {
            if (result) {
              // If not undefined, it should not be SpringWater
              expect(result.swimLevel).not.toBe(SwimLevel.SpringWater);
            }
          },
        );
      });
    });
  });
});
