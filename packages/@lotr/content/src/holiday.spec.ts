import { Holiday } from '@lotr/interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  currentHoliday,
  holidaysLoadForGame,
  isAnyHoliday,
  isHoliday,
} from './holiday';

// Mock dependencies
vi.mock('./core', () => ({
  coreHolidayDescs: vi.fn(),
}));

describe('Holiday Functions', () => {
  let mockCoreHolidayDescs: any;
  let mockDate: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Mock core holiday descriptions
    const coreModule = await import('./core');
    mockCoreHolidayDescs = vi.mocked(coreModule.coreHolidayDescs);

    // Mock Date constructor and methods
    mockDate = {
      getMonth: vi.fn(),
    };
    vi.stubGlobal(
      'Date',
      vi.fn(() => mockDate),
    );
  });

  describe('holidaysLoadForGame', () => {
    it('should load holiday descriptions from core', () => {
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 11,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);

      holidaysLoadForGame();

      expect(mockCoreHolidayDescs).toHaveBeenCalledTimes(1);
    });

    it('should handle empty holiday data', () => {
      mockCoreHolidayDescs.mockReturnValue({});

      expect(() => holidaysLoadForGame()).not.toThrow();
      expect(mockCoreHolidayDescs).toHaveBeenCalledTimes(1);
    });

    it('should handle null holiday data', () => {
      mockCoreHolidayDescs.mockReturnValue(null);

      expect(() => holidaysLoadForGame()).not.toThrow();
      expect(mockCoreHolidayDescs).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined holiday data', () => {
      mockCoreHolidayDescs.mockReturnValue(undefined);

      expect(() => holidaysLoadForGame()).not.toThrow();
      expect(mockCoreHolidayDescs).toHaveBeenCalledTimes(1);
    });
  });

  describe('isHoliday', () => {
    beforeEach(() => {
      // Setup holiday data for tests
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9, // October (0-indexed)
        },
        [Holiday.Thanksgiving]: {
          name: 'Thanksgiving',
          text: 'Thanksgiving celebration',
          duration: 'November',
          month: 10, // November (0-indexed)
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 11, // December (0-indexed)
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
    });

    it('should return true when current month matches holiday month', () => {
      mockDate.getMonth.mockReturnValue(9); // October

      const result = isHoliday(Holiday.Halloween);

      expect(result).toBe(true);
      expect(mockDate.getMonth).toHaveBeenCalledTimes(1);
    });

    it('should return false when current month does not match holiday month', () => {
      mockDate.getMonth.mockReturnValue(8); // September

      const result = isHoliday(Holiday.Halloween);

      expect(result).toBe(false);
      expect(mockDate.getMonth).toHaveBeenCalledTimes(1);
    });

    it('should return false when holiday does not exist in hash', () => {
      mockDate.getMonth.mockReturnValue(9);

      // Test with a holiday that doesn't exist in our mock data
      const result = isHoliday('NonExistentHoliday' as Holiday);

      expect(result).toBe(false);
    });

    it('should return false when holidayHash is empty', () => {
      mockCoreHolidayDescs.mockReturnValue({});
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = isHoliday(Holiday.Halloween);

      expect(result).toBe(false);
    });

    it('should return false when holidayHash is null', () => {
      mockCoreHolidayDescs.mockReturnValue(null);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = isHoliday(Holiday.Halloween);

      expect(result).toBe(false);
    });

    it('should handle all defined holidays correctly', () => {
      // Test Halloween (October - month 9)
      mockDate.getMonth.mockReturnValue(9);
      expect(isHoliday(Holiday.Halloween)).toBe(true);
      expect(isHoliday(Holiday.Thanksgiving)).toBe(false);
      expect(isHoliday(Holiday.Christmas)).toBe(false);

      // Test Thanksgiving (November - month 10)
      mockDate.getMonth.mockReturnValue(10);
      expect(isHoliday(Holiday.Halloween)).toBe(false);
      expect(isHoliday(Holiday.Thanksgiving)).toBe(true);
      expect(isHoliday(Holiday.Christmas)).toBe(false);

      // Test Christmas (December - month 11)
      mockDate.getMonth.mockReturnValue(11);
      expect(isHoliday(Holiday.Halloween)).toBe(false);
      expect(isHoliday(Holiday.Thanksgiving)).toBe(false);
      expect(isHoliday(Holiday.Christmas)).toBe(true);
    });
  });

  describe('isAnyHoliday', () => {
    beforeEach(() => {
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 11,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
    });

    it('should return true when at least one holiday is active', () => {
      mockDate.getMonth.mockReturnValue(9); // October - Halloween

      const result = isAnyHoliday();

      expect(result).toBe(true);
    });

    it('should return false when no holidays are active', () => {
      mockDate.getMonth.mockReturnValue(8); // September - no holidays

      const result = isAnyHoliday();

      expect(result).toBe(false);
    });

    it('should return true when multiple holidays are active (same month)', () => {
      // Add another holiday in the same month
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 9, // Same month as Halloween for testing
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = isAnyHoliday();

      expect(result).toBe(true);
    });

    it('should return false when holidayHash is empty', () => {
      mockCoreHolidayDescs.mockReturnValue({});
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = isAnyHoliday();

      expect(result).toBe(false);
    });

    it('should handle all months correctly', () => {
      // Test each month from 0-11
      for (let month = 0; month < 12; month++) {
        mockDate.getMonth.mockReturnValue(month);
        const result = isAnyHoliday();

        // Should be true for October (9) and December (11) based on our mock data
        if (month === 9 || month === 11) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }
    });
  });

  describe('currentHoliday', () => {
    beforeEach(() => {
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
        [Holiday.Thanksgiving]: {
          name: 'Thanksgiving',
          text: 'Thanksgiving celebration',
          duration: 'November',
          month: 10,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 11,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
    });

    it('should return the current active holiday', () => {
      mockDate.getMonth.mockReturnValue(9); // October

      const result = currentHoliday();

      expect(result).toBe(Holiday.Halloween);
    });

    it('should return empty string when no holiday is active', () => {
      mockDate.getMonth.mockReturnValue(8); // September

      const result = currentHoliday();

      expect(result).toBe('');
    });

    it('should handle multiple holidays in the same month', () => {
      // Create a scenario where two holidays are in the same month
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'October', // Same month for testing
          month: 9,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = currentHoliday();

      // Should return one of the holidays (the last one processed)
      expect([Holiday.Halloween, Holiday.Christmas]).toContain(result);
      expect(result).not.toBe('');
    });

    it('should return the last matching holiday when multiple exist', () => {
      // Test that it returns the last holiday in iteration order
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
        [Holiday.Thanksgiving]: {
          name: 'Thanksgiving',
          text: 'Thanksgiving celebration',
          duration: 'October', // Same month for testing
          month: 9,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'October', // Same month for testing
          month: 9,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = currentHoliday();

      // The function iterates through Object.keys(), so result depends on key order
      expect(result).toBeTruthy();
      expect([
        Holiday.Halloween,
        Holiday.Thanksgiving,
        Holiday.Christmas,
      ]).toContain(result);
    });

    it('should return correct holiday for each month', () => {
      // Test October
      mockDate.getMonth.mockReturnValue(9);
      expect(currentHoliday()).toBe(Holiday.Halloween);

      // Test November
      mockDate.getMonth.mockReturnValue(10);
      expect(currentHoliday()).toBe(Holiday.Thanksgiving);

      // Test December
      mockDate.getMonth.mockReturnValue(11);
      expect(currentHoliday()).toBe(Holiday.Christmas);
    });

    it('should handle empty holidayHash', () => {
      mockCoreHolidayDescs.mockReturnValue({});
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      const result = currentHoliday();

      expect(result).toBe('');
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with real holiday data structure', () => {
      const realHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'A spooky time of year when the dead rise from their graves to walk among the living.',
          duration: 'All of October',
          month: 9,
        },
        [Holiday.Thanksgiving]: {
          name: 'Thanksgiving',
          text: 'A time to be thankful for what you have.',
          duration: 'All of November',
          month: 10,
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'A joyous time of year when people give gifts and spend time with family.',
          duration: 'All of December',
          month: 11,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(realHolidayData);
      holidaysLoadForGame();

      // Test October
      mockDate.getMonth.mockReturnValue(9);
      expect(isHoliday(Holiday.Halloween)).toBe(true);
      expect(isAnyHoliday()).toBe(true);
      expect(currentHoliday()).toBe(Holiday.Halloween);

      // Test a non-holiday month
      mockDate.getMonth.mockReturnValue(5); // June
      expect(isHoliday(Holiday.Halloween)).toBe(false);
      expect(isHoliday(Holiday.Thanksgiving)).toBe(false);
      expect(isHoliday(Holiday.Christmas)).toBe(false);
      expect(isAnyHoliday()).toBe(false);
      expect(currentHoliday()).toBe('');
    });

    it('should maintain state between function calls', () => {
      const mockHolidayData = {
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 11,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(11);

      // Multiple calls should return consistent results
      expect(isHoliday(Holiday.Christmas)).toBe(true);
      expect(isHoliday(Holiday.Christmas)).toBe(true);
      expect(isAnyHoliday()).toBe(true);
      expect(isAnyHoliday()).toBe(true);
      expect(currentHoliday()).toBe(Holiday.Christmas);
      expect(currentHoliday()).toBe(Holiday.Christmas);
    });

    it('should handle reloading holiday data', () => {
      // Load initial data
      const initialData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky',
          duration: 'October',
          month: 9,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(initialData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      expect(isHoliday(Holiday.Halloween)).toBe(true);
      expect(isHoliday(Holiday.Christmas)).toBe(false);

      // Reload with different data
      const newData = {
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Festive',
          duration: 'December',
          month: 9, // Same month for testing
        },
      };

      mockCoreHolidayDescs.mockReturnValue(newData);
      holidaysLoadForGame();

      expect(isHoliday(Holiday.Halloween)).toBe(false);
      expect(isHoliday(Holiday.Christmas)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing month property in holiday data', () => {
      const malformedData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          // month property missing
        },
      };

      mockCoreHolidayDescs.mockReturnValue(malformedData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      // Should not throw and should return false
      expect(() => isHoliday(Holiday.Halloween)).not.toThrow();
      expect(isHoliday(Holiday.Halloween)).toBe(false);
    });

    it('should handle null values in holiday data', () => {
      const dataWithNull = {
        [Holiday.Halloween]: null,
      };

      mockCoreHolidayDescs.mockReturnValue(dataWithNull);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      expect(() => isHoliday(Holiday.Halloween)).not.toThrow();
      expect(isHoliday(Holiday.Halloween)).toBe(false);
    });

    it('should handle Date.getMonth() returning edge values', () => {
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 0, // January
        },
        [Holiday.Christmas]: {
          name: 'Christmas',
          text: 'Holiday season',
          duration: 'December',
          month: 11, // December
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();

      // Test month 0 (January)
      mockDate.getMonth.mockReturnValue(0);
      expect(isHoliday(Holiday.Halloween)).toBe(true);
      expect(isHoliday(Holiday.Christmas)).toBe(false);

      // Test month 11 (December)
      mockDate.getMonth.mockReturnValue(11);
      expect(isHoliday(Holiday.Halloween)).toBe(false);
      expect(isHoliday(Holiday.Christmas)).toBe(true);
    });

    it('should handle when Date constructor throws', () => {
      // Mock Date to throw an error
      vi.stubGlobal(
        'Date',
        vi.fn(() => {
          throw new Error('Date construction failed');
        }),
      );

      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();

      // Should throw when trying to create Date
      expect(() => isHoliday(Holiday.Halloween)).toThrow(
        'Date construction failed',
      );
    });

    it('should handle invalid holiday enum values', () => {
      const mockHolidayData = {
        [Holiday.Halloween]: {
          name: 'Halloween',
          text: 'Spooky season',
          duration: 'October',
          month: 9,
        },
      };

      mockCoreHolidayDescs.mockReturnValue(mockHolidayData);
      holidaysLoadForGame();
      mockDate.getMonth.mockReturnValue(9);

      // Test with invalid holiday values
      expect(isHoliday(null as any)).toBe(false);
      expect(isHoliday(undefined as any)).toBe(false);
      expect(isHoliday('' as Holiday)).toBe(false);
      expect(isHoliday('InvalidHoliday' as Holiday)).toBe(false);
    });
  });
});
