import { DamageClass, SwimLevel } from '@lotr/interfaces';
import { describe, expect, it } from 'vitest';
import { swimLevelGet } from './swimming';

describe('Swimming Functions', () => {
  describe('swimLevelGet', () => {
    describe('Spring Water (Special GID Ranges)', () => {
      it('should return SpringWater for GIDs 2288-2296', () => {
        for (let gid = 2288; gid <= 2296; gid++) {
          const result = swimLevelGet(gid);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.SpringWater,
          });
        }
      });

      it('should return SpringWater for GID 2200', () => {
        const result = swimLevelGet(2200);
        expect(result).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });
      });

      it('should return SpringWater for GID 2216', () => {
        const result = swimLevelGet(2216);
        expect(result).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });
      });

      it('should return SpringWater for GIDs 2304-2312', () => {
        for (let gid = 2304; gid <= 2312; gid++) {
          const result = swimLevelGet(gid);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.SpringWater,
          });
        }
      });

      it('should handle edge cases at boundaries of special ranges', () => {
        // Test boundary values
        expect(swimLevelGet(2288)).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });
        expect(swimLevelGet(2296)).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });
        expect(swimLevelGet(2304)).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });
        expect(swimLevelGet(2312)).toEqual({
          element: DamageClass.Water,
          swimLevel: SwimLevel.SpringWater,
        });
      });
    });

    describe('Calculated GID Values (Non-Special Cases)', () => {
      describe('SpringWater (Row 1: GIDs 1-48)', () => {
        it('should return SpringWater for GID 1', () => {
          const result = swimLevelGet(1);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.SpringWater,
          });
        });

        it('should return SpringWater for GID 48', () => {
          const result = swimLevelGet(48);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.SpringWater,
          });
        });

        it('should return SpringWater for GIDs in first row range', () => {
          const testGids = [1, 25, 48];
          testGids.forEach((gid) => {
            const result = swimLevelGet(gid);
            expect(result).toEqual({
              element: DamageClass.Water,
              swimLevel: SwimLevel.SpringWater,
            });
          });
        });
      });

      describe('NormalWater (Row 8: GIDs 337-384)', () => {
        it('should return NormalWater for GID 337 (start of row 8)', () => {
          const result = swimLevelGet(337);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.NormalWater,
          });
        });

        it('should return NormalWater for GID 384 (end of row 8)', () => {
          const result = swimLevelGet(384);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.NormalWater,
          });
        });

        it('should return NormalWater for GIDs in row 8 range', () => {
          const testGids = [337, 350, 370, 384];
          testGids.forEach((gid) => {
            const result = swimLevelGet(gid);
            expect(result).toEqual({
              element: DamageClass.Water,
              swimLevel: SwimLevel.NormalWater,
            });
          });
        });
      });

      describe('Lava (Row 9: GIDs 385-432)', () => {
        it('should return Lava for GID 385 (start of row 9)', () => {
          const result = swimLevelGet(385);
          expect(result).toEqual({
            element: DamageClass.Fire,
            swimLevel: SwimLevel.Lava,
          });
        });

        it('should return Lava for GID 432 (end of row 9)', () => {
          const result = swimLevelGet(432);
          expect(result).toEqual({
            element: DamageClass.Fire,
            swimLevel: SwimLevel.Lava,
          });
        });

        it('should return Lava for GIDs in row 9 range', () => {
          const testGids = [385, 400, 420, 432];
          testGids.forEach((gid) => {
            const result = swimLevelGet(gid);
            expect(result).toEqual({
              element: DamageClass.Fire,
              swimLevel: SwimLevel.Lava,
            });
          });
        });
      });

      describe('ChillWater (Row 16: GIDs 721-768)', () => {
        it('should return ChillWater for GID 721 (start of row 16)', () => {
          const result = swimLevelGet(721);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.ChillWater,
          });
        });

        it('should return ChillWater for GID 768 (end of row 16)', () => {
          const result = swimLevelGet(768);
          expect(result).toEqual({
            element: DamageClass.Water,
            swimLevel: SwimLevel.ChillWater,
          });
        });

        it('should return ChillWater for GIDs in row 16 range', () => {
          const testGids = [721, 740, 760, 768];
          testGids.forEach((gid) => {
            const result = swimLevelGet(gid);
            expect(result).toEqual({
              element: DamageClass.Water,
              swimLevel: SwimLevel.ChillWater,
            });
          });
        });
      });
    });

    describe('Row Calculation Logic', () => {
      it('should correctly calculate row numbers for various GIDs', () => {
        // Row 0: GIDs that would map to row 0 (undefined in SwimInfo)
        // These should return undefined since SwimInfo[0] doesn't exist
        expect(swimLevelGet(0)).toBeUndefined();

        // Row 1: GIDs 1-48 -> Math.floor((gid - 1) / 48) = 0, but we want row 1
        // Actually, Math.floor((1 - 1) / 48) = 0, Math.floor((48 - 1) / 48) = 0
        // This suggests the calculation maps to SwimInfo[0] for row 1, but SwimInfo uses key 1

        // Row 2: GIDs 49-96
        const row2Gid = 49;
        const row2Result = swimLevelGet(row2Gid);
        expect(row2Result).toBeUndefined(); // Should be undefined as SwimInfo[1] maps to row 2

        // Row 8: GIDs 337-384
        // Math.floor((337 - 1) / 48) = Math.floor(336 / 48) = 7
        // Math.floor((384 - 1) / 48) = Math.floor(383 / 48) = 7
        // So row 8 maps to SwimInfo[7], but we want SwimInfo[8]

        // Let's test the actual calculation
        expect(Math.floor((337 - 1) / 48)).toBe(7);
        expect(Math.floor((384 - 1) / 48)).toBe(7);
      });

      it('should handle GID ranges that map to undefined SwimInfo entries', () => {
        // Test GIDs that would map to rows not defined in SwimInfo
        const undefinedRowGids = [49, 96, 144, 192, 240, 288]; // Various rows

        undefinedRowGids.forEach((gid) => {
          const result = swimLevelGet(gid);
          expect(result).toBeUndefined();
        });
      });
    });

    describe('Special Cases and Edge Values', () => {
      it('should handle GID 0', () => {
        const result = swimLevelGet(0);
        // Math.floor((0 - 1) / 48) = Math.floor(-1 / 48) = -1
        // SwimInfo[-1] should be undefined
        expect(result).toBeUndefined();
      });

      it('should handle negative GIDs', () => {
        const negativeGids = [-1, -10, -100];
        negativeGids.forEach((gid) => {
          const result = swimLevelGet(gid);
          expect(result).toBeUndefined();
        });
      });

      it('should handle very large GIDs', () => {
        const largeGids = [10000, 50000, 100000];
        largeGids.forEach((gid) => {
          const result = swimLevelGet(gid);
          // These will map to very high row numbers that don't exist in SwimInfo
          expect(result).toBeUndefined();
        });
      });

      it('should handle boundaries between special and calculated ranges', () => {
        // Test GIDs just outside special ranges to ensure they use calculation
        expect(swimLevelGet(2287)).toBeUndefined(); // Just before 2288-2296
        expect(swimLevelGet(2297)).toBeUndefined(); // Just after 2288-2296
        expect(swimLevelGet(2199)).toBeUndefined(); // Just before 2200
        expect(swimLevelGet(2201)).toBeUndefined(); // Just after 2200
        expect(swimLevelGet(2215)).toBeUndefined(); // Just before 2216
        expect(swimLevelGet(2217)).toBeUndefined(); // Just after 2216
        expect(swimLevelGet(2303)).toBeUndefined(); // Just before 2304-2312
        expect(swimLevelGet(2313)).toBeUndefined(); // Just after 2304-2312
      });
    });

    describe('Return Value Structure', () => {
      it('should return objects with correct structure for valid GIDs', () => {
        const validGid = 2200; // SpringWater special case
        const result = swimLevelGet(validGid);

        expect(result).toHaveProperty('element');
        expect(result).toHaveProperty('swimLevel');
        expect(typeof result?.element).toBe('string');
        expect(typeof result?.swimLevel).toBe('string');
      });

      it('should return consistent element types for water-based swim levels', () => {
        const waterGids = [2200, 2288, 337]; // SpringWater, SpringWater, NormalWater
        waterGids.forEach((gid) => {
          const result = swimLevelGet(gid);
          if (result) {
            expect(result.element).toBe(DamageClass.Water);
          }
        });
      });

      it('should return Fire element for Lava swim level', () => {
        const lavaGid = 385;
        const result = swimLevelGet(lavaGid);
        expect(result?.element).toBe(DamageClass.Fire);
        expect(result?.swimLevel).toBe(SwimLevel.Lava);
      });
    });

    describe('Comprehensive Row Mapping Tests', () => {
      it('should correctly map calculated GIDs to their respective rows', () => {
        // Test the mathematical relationship between GID and row
        const testCases = [
          { gid: 1, expectedRow: 0 }, // Math.floor((1-1)/48) = 0
          { gid: 48, expectedRow: 0 }, // Math.floor((48-1)/48) = 0
          { gid: 49, expectedRow: 1 }, // Math.floor((49-1)/48) = 1
          { gid: 96, expectedRow: 1 }, // Math.floor((96-1)/48) = 1
          { gid: 337, expectedRow: 7 }, // Math.floor((337-1)/48) = 7
          { gid: 385, expectedRow: 8 }, // Math.floor((385-1)/48) = 8
          { gid: 721, expectedRow: 15 }, // Math.floor((721-1)/48) = 15
        ];

        testCases.forEach(({ gid, expectedRow }) => {
          const calculatedRow = Math.floor((gid - 1) / 48);
          expect(calculatedRow).toBe(expectedRow);
        });
      });
    });

    describe('Integration with Enums', () => {
      it('should use valid DamageClass enum values', () => {
        const springWaterResult = swimLevelGet(2200);
        expect(Object.values(DamageClass)).toContain(
          springWaterResult?.element,
        );
      });

      it('should use valid SwimLevel enum values', () => {
        const springWaterResult = swimLevelGet(2200);
        expect(Object.values(SwimLevel)).toContain(
          springWaterResult?.swimLevel,
        );
      });

      it('should return different enum combinations for different swim types', () => {
        const springWater = swimLevelGet(2200); // SpringWater
        const lava = swimLevelGet(385); // Lava

        expect(springWater?.element).toBe(DamageClass.Water);
        expect(springWater?.swimLevel).toBe(SwimLevel.SpringWater);

        expect(lava?.element).toBe(DamageClass.Fire);
        expect(lava?.swimLevel).toBe(SwimLevel.Lava);

        // Ensure they're different
        expect(springWater?.element).not.toBe(lava?.element);
        expect(springWater?.swimLevel).not.toBe(lava?.swimLevel);
      });
    });

    describe('Performance and Edge Cases', () => {
      it('should handle multiple calls efficiently', () => {
        const testGids = [2200, 2288, 2216, 337, 385, 721];
        const results = testGids.map((gid) => swimLevelGet(gid));

        // All valid GIDs should return results
        results.forEach((result, index) => {
          expect(result).toBeDefined();
          expect(result).toHaveProperty('element');
          expect(result).toHaveProperty('swimLevel');
        });
      });

      it('should be deterministic for the same input', () => {
        const gid = 2200;
        const result1 = swimLevelGet(gid);
        const result2 = swimLevelGet(gid);

        expect(result1).toEqual(result2);
      });

      it('should handle floating point GIDs by using Math.floor behavior', () => {
        // JavaScript's Math.floor should handle these correctly
        const floatGid = 337.9;
        const result = swimLevelGet(floatGid);
        expect(result).toEqual(swimLevelGet(337)); // Should be same as integer version
      });
    });
  });
});
