import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logErrorWithContext } from './errors';

// Mock the logger module
vi.mock('@lotr/logger', () => ({
  consoleError: vi.fn(),
}));

describe('Error Functions', () => {
  let mockConsoleError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { consoleError } = await import('@lotr/logger');
    mockConsoleError = vi.mocked(consoleError);
  });

  describe('logErrorWithContext', () => {
    it('should log error with context tag', () => {
      const testError = new Error('Test error message');
      const testTag = 'Content:Test:Error';

      logErrorWithContext(testTag, testError);

      expect(mockConsoleError).toHaveBeenCalledWith(testTag, testError);
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    it('should log different errors with different tags', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      const tag1 = 'Content:Items:NotFound';
      const tag2 = 'Content:NPCs:InvalidData';

      logErrorWithContext(tag1, error1);
      logErrorWithContext(tag2, error2);

      expect(mockConsoleError).toHaveBeenCalledWith(tag1, error1);
      expect(mockConsoleError).toHaveBeenCalledWith(tag2, error2);
      expect(mockConsoleError).toHaveBeenCalledTimes(2);
    });

    it('should handle errors with complex messages', () => {
      const complexError = new Error(
        'Complex error with special characters: !@#$%^&*()',
      );
      const tag = 'Content:Complex:Test';

      logErrorWithContext(tag, complexError);

      expect(mockConsoleError).toHaveBeenCalledWith(tag, complexError);
    });

    it('should handle empty error messages', () => {
      const emptyError = new Error('');
      const tag = 'Content:Empty:Error';

      logErrorWithContext(tag, emptyError);

      expect(mockConsoleError).toHaveBeenCalledWith(tag, emptyError);
    });

    it('should handle errors with stack traces', () => {
      const errorWithStack = new Error('Error with stack');
      errorWithStack.stack =
        'Error: Error with stack\\n    at test (file:///test.js:1:1)';
      const tag = 'Content:Stack:Error';

      logErrorWithContext(tag, errorWithStack);

      expect(mockConsoleError).toHaveBeenCalledWith(tag, errorWithStack);
    });

    it('should skip logging if tag contains "Migrate"', () => {
      const testError = new Error('Migration error');
      const migrateTag = 'Content:Migrate:Database';

      logErrorWithContext(migrateTag, testError);

      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should skip logging for various migrate-related tags', () => {
      const testError = new Error('Test error');
      const migrateTags = [
        'Content:Migrate:Items',
        'System:Migrate:Users',
        'Database:Migrate:Schema',
        'MigrateData:Content',
        'Content:MigrateOldFormat',
      ];

      migrateTags.forEach((tag) => {
        logErrorWithContext(tag, testError);
      });

      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should log normally for tags that contain "migrate" in different cases', () => {
      const testError = new Error('Test error');

      // These should still log since they don't contain exact "Migrate"
      logErrorWithContext('Content:migrate:lowercase', testError);
      logErrorWithContext('Content:MIGRATE:uppercase', testError);
      logErrorWithContext('Content:Migration:similar', testError);

      expect(mockConsoleError).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple errors in sequence', () => {
      const errors = [
        { tag: 'Content:Item:1', error: new Error('Item error 1') },
        { tag: 'Content:Item:2', error: new Error('Item error 2') },
        { tag: 'Content:NPC:1', error: new Error('NPC error 1') },
      ];

      errors.forEach(({ tag, error }) => {
        logErrorWithContext(tag, error);
      });

      expect(mockConsoleError).toHaveBeenCalledTimes(3);
      errors.forEach(({ tag, error }) => {
        expect(mockConsoleError).toHaveBeenCalledWith(tag, error);
      });
    });

    it('should handle tags with special characters', () => {
      const testError = new Error('Special char error');
      const specialTags = [
        'Content:Item:sword-of-flames',
        'Content:NPC:orc_warrior',
        'Content:Map:level.1',
        'Content:Quest:find&destroy',
        'Content:Spell:fire+ice',
      ];

      specialTags.forEach((tag) => {
        logErrorWithContext(tag, testError);
      });

      expect(mockConsoleError).toHaveBeenCalledTimes(5);
      specialTags.forEach((tag) => {
        expect(mockConsoleError).toHaveBeenCalledWith(tag, testError);
      });
    });

    it('should preserve error object properties', () => {
      const customError = new Error('Custom error');
      (customError as any).code = 'CUSTOM_ERROR_CODE';
      (customError as any).details = { item: 'test-item', reason: 'not found' };
      const tag = 'Content:Custom:Error';

      logErrorWithContext(tag, customError);

      expect(mockConsoleError).toHaveBeenCalledWith(tag, customError);
      const calledError = mockConsoleError.mock.calls[0][1];
      expect(calledError.code).toBe('CUSTOM_ERROR_CODE');
      expect(calledError.details).toEqual({
        item: 'test-item',
        reason: 'not found',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined error objects gracefully', () => {
      const tag = 'Content:Null:Error';

      // These might not be typical usage but should not crash
      logErrorWithContext(tag, null as any);
      logErrorWithContext(tag, undefined as any);

      expect(mockConsoleError).toHaveBeenCalledTimes(2);
      expect(mockConsoleError).toHaveBeenCalledWith(tag, null);
      expect(mockConsoleError).toHaveBeenCalledWith(tag, undefined);
    });

    it('should handle very long tag names', () => {
      const longTag = 'Content:' + 'VeryLongTagName'.repeat(50);
      const testError = new Error('Long tag error');

      logErrorWithContext(longTag, testError);

      expect(mockConsoleError).toHaveBeenCalledWith(longTag, testError);
    });

    it('should handle empty tag strings', () => {
      const testError = new Error('Empty tag error');

      logErrorWithContext('', testError);

      expect(mockConsoleError).toHaveBeenCalledWith('', testError);
    });

    it('should handle concurrent error logging', () => {
      const errors = Array.from({ length: 10 }, (_, i) => ({
        tag: `Content:Concurrent:${i}`,
        error: new Error(`Concurrent error ${i}`),
      }));

      // Log all errors simultaneously
      errors.forEach(({ tag, error }) => {
        logErrorWithContext(tag, error);
      });

      expect(mockConsoleError).toHaveBeenCalledTimes(10);
      errors.forEach(({ tag, error }) => {
        expect(mockConsoleError).toHaveBeenCalledWith(tag, error);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with real-world error scenarios', () => {
      // Simulate typical content system errors
      const scenarios = [
        {
          tag: 'Content:Item:sword-of-power',
          error: new Error('Item not found: sword-of-power'),
        },
        {
          tag: 'Content:NPC:dragon-boss',
          error: new Error('NPC script compilation failed'),
        },
        {
          tag: 'Content:Quest:save-princess',
          error: new Error('Invalid quest prerequisites'),
        },
      ];

      scenarios.forEach(({ tag, error }) => {
        logErrorWithContext(tag, error);
      });

      expect(mockConsoleError).toHaveBeenCalledTimes(3);
      scenarios.forEach(({ tag, error }) => {
        expect(mockConsoleError).toHaveBeenCalledWith(tag, error);
      });
    });

    it('should handle mixed migrate and non-migrate errors correctly', () => {
      const mixedScenarios = [
        {
          tag: 'Content:Item:test',
          error: new Error('Should log'),
          shouldLog: true,
        },
        {
          tag: 'Content:Migrate:old-data',
          error: new Error('Should not log'),
          shouldLog: false,
        },
        {
          tag: 'Content:NPC:test',
          error: new Error('Should log'),
          shouldLog: true,
        },
        {
          tag: 'System:Migrate:users',
          error: new Error('Should not log'),
          shouldLog: false,
        },
        {
          tag: 'Content:Quest:test',
          error: new Error('Should log'),
          shouldLog: true,
        },
      ];

      mixedScenarios.forEach(({ tag, error }) => {
        logErrorWithContext(tag, error);
      });

      // Should only log the non-migrate errors (3 out of 5)
      expect(mockConsoleError).toHaveBeenCalledTimes(3);

      mixedScenarios
        .filter((scenario) => scenario.shouldLog)
        .forEach(({ tag, error }) => {
          expect(mockConsoleError).toHaveBeenCalledWith(tag, error);
        });
    });
  });
});
