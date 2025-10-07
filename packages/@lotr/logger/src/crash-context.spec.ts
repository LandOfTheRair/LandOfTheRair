import type { ICharacter } from '@lotr/interfaces';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Crash Context', () => {
  let mockConsoleDebug: any;
  let mockCharacter: ICharacter;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Mock the logger module to avoid circular dependencies
    mockConsoleDebug = vi.fn();
    vi.doMock('./logger', () => ({
      consoleDebug: mockConsoleDebug,
    }));

    // Create a mock character
    mockCharacter = {
      uuid: 'test-char-uuid',
      name: 'TestCharacter',
      map: 'TestMap',
      x: 10,
      y: 20,
    } as ICharacter;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setShouldLogCrashContext', () => {
    it('should enable crash context logging', async () => {
      const { setShouldLogCrashContext, logCrashContextEntry } = await import(
        './crash-context'
      );

      setShouldLogCrashContext(true);
      logCrashContextEntry(mockCharacter, 'test action');

      expect(mockConsoleDebug).toHaveBeenCalledWith(
        'CrashContext',
        'TestMap:10,20|test action',
      );
    });

    it('should disable crash context logging', async () => {
      const { setShouldLogCrashContext, logCrashContextEntry } = await import(
        './crash-context'
      );

      setShouldLogCrashContext(false);
      logCrashContextEntry(mockCharacter, 'test action');

      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });
  });

  describe('logCrashContextEntry', () => {
    it('should add formatted entry to crash context', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      logCrashContextEntry(mockCharacter, 'performed action');

      const context = currentCrashContext();
      expect(context).toContain('TestMap:10,20|performed action');
    });

    it('should format entry correctly with character position', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      const character = {
        ...mockCharacter,
        map: 'DungeonMap',
        x: 150,
        y: 200,
      } as ICharacter;

      logCrashContextEntry(character, 'cast spell');

      const context = currentCrashContext();
      expect(context).toContain('DungeonMap:150,200|cast spell');
    });

    it('should maintain order of entries', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      logCrashContextEntry(mockCharacter, 'action 1');
      logCrashContextEntry(mockCharacter, 'action 2');
      logCrashContextEntry(mockCharacter, 'action 3');

      const context = currentCrashContext();
      const action1Index = context.findIndex((entry) =>
        entry.includes('action 1'),
      );
      const action2Index = context.findIndex((entry) =>
        entry.includes('action 2'),
      );
      const action3Index = context.findIndex((entry) =>
        entry.includes('action 3'),
      );

      expect(action1Index).toBeLessThan(action2Index);
      expect(action2Index).toBeLessThan(action3Index);
    });

    it('should limit context to 300 entries', async () => {
      vi.resetModules();
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      // Add 305 entries
      for (let i = 0; i < 305; i++) {
        logCrashContextEntry(mockCharacter, `action ${i}`);
      }

      const context = currentCrashContext();
      expect(context).toHaveLength(300);

      // First entries should be removed (action 0-4 should be gone)
      expect(context.some((entry) => entry.endsWith('action 0'))).toBe(false);
      expect(context.some((entry) => entry.endsWith('action 1'))).toBe(false);
      expect(context.some((entry) => entry.endsWith('action 2'))).toBe(false);
      expect(context.some((entry) => entry.endsWith('action 3'))).toBe(false);
      expect(context.some((entry) => entry.endsWith('action 4'))).toBe(false);

      // Entry 5 should still be there (it's the first one that wasn't removed)
      expect(context.some((entry) => entry.endsWith('action 5'))).toBe(true);

      // Recent entries should be present
      expect(context.some((entry) => entry.endsWith('action 304'))).toBe(true);
      expect(context.some((entry) => entry.endsWith('action 303'))).toBe(true);
    });

    it('should handle different character maps and positions', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      const characters = [
        { ...mockCharacter, map: 'Map1', x: 0, y: 0 },
        { ...mockCharacter, map: 'Map2', x: 999, y: 999 },
        { ...mockCharacter, map: 'Map3', x: -10, y: -20 },
      ] as ICharacter[];

      characters.forEach((char, index) => {
        logCrashContextEntry(char, `action ${index}`);
      });

      const context = currentCrashContext();
      expect(context).toContain('Map1:0,0|action 0');
      expect(context).toContain('Map2:999,999|action 1');
      expect(context).toContain('Map3:-10,-20|action 2');
    });

    it('should handle special characters in action strings', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      const specialActions = [
        'action with spaces',
        'action|with|pipes',
        'action:with:colons',
        'action,with,commas',
        'action"with"quotes',
      ];

      specialActions.forEach((action) => {
        logCrashContextEntry(mockCharacter, action);
      });

      const context = currentCrashContext();
      specialActions.forEach((action) => {
        expect(context.some((entry) => entry.includes(action))).toBe(true);
      });
    });

    it('should log to console debug when enabled', async () => {
      const { setShouldLogCrashContext, logCrashContextEntry } = await import(
        './crash-context'
      );

      setShouldLogCrashContext(true);
      logCrashContextEntry(mockCharacter, 'debug test action');

      expect(mockConsoleDebug).toHaveBeenCalledWith(
        'CrashContext',
        'TestMap:10,20|debug test action',
      );
    });

    it('should not log to console debug when disabled', async () => {
      const { setShouldLogCrashContext, logCrashContextEntry } = await import(
        './crash-context'
      );

      setShouldLogCrashContext(false);
      logCrashContextEntry(mockCharacter, 'silent test action');

      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });
  });

  describe('currentCrashContext', () => {
    it('should return empty array initially', async () => {
      const { currentCrashContext } = await import('./crash-context');

      const context = currentCrashContext();
      expect(context).toEqual([]);
    });

    it('should return all logged entries', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      logCrashContextEntry(mockCharacter, 'entry 1');
      logCrashContextEntry(mockCharacter, 'entry 2');

      const context = currentCrashContext();
      expect(context).toHaveLength(2);
      expect(context[0]).toContain('entry 1');
      expect(context[1]).toContain('entry 2');
    });

    it('should return the same array reference (not a copy)', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      logCrashContextEntry(mockCharacter, 'original entry');

      const context1 = currentCrashContext();
      const context2 = currentCrashContext();

      // Should be equal and the same reference (current implementation)
      expect(context1).toEqual(context2);
      expect(context1).toBe(context2);

      // Modifying returned array WILL affect internal state (current behavior)
      context1.push('modified entry');

      const context3 = currentCrashContext();
      expect(context3).toContain('modified entry');
    });
  });

  describe('Integration Tests', () => {
    it('should handle rapid context logging', async () => {
      const {
        logCrashContextEntry,
        currentCrashContext,
        setShouldLogCrashContext,
      } = await import('./crash-context');

      setShouldLogCrashContext(true);

      // Simulate rapid logging
      for (let i = 0; i < 50; i++) {
        logCrashContextEntry(mockCharacter, `rapid action ${i}`);
      }

      const context = currentCrashContext();
      expect(context).toHaveLength(50);
      expect(mockConsoleDebug).toHaveBeenCalledTimes(50);
    });

    it('should work with undefined or null character properties', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      const incompleteCharacter = {
        ...mockCharacter,
        map: undefined,
        x: null,
        y: undefined,
      } as any;

      // Should not throw
      expect(() =>
        logCrashContextEntry(incompleteCharacter, 'incomplete character test'),
      ).not.toThrow();

      const context = currentCrashContext();
      expect(context.length).toBeGreaterThan(0);
    });

    it('should handle concurrent access safely', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      // Simulate concurrent logging (as much as possible in single-threaded JS)
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() =>
          logCrashContextEntry(mockCharacter, `concurrent ${i}`),
        ),
      );

      await Promise.all(promises);

      const context = currentCrashContext();
      expect(context).toHaveLength(10);

      // All entries should be present
      for (let i = 0; i < 10; i++) {
        expect(context.some((entry) => entry.includes(`concurrent ${i}`))).toBe(
          true,
        );
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed character objects gracefully', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      const malformedCharacter = {} as ICharacter;

      // Should not throw even with empty character object
      expect(() =>
        logCrashContextEntry(malformedCharacter, 'malformed test'),
      ).not.toThrow();

      const context = currentCrashContext();
      expect(context.length).toBeGreaterThan(0);
    });

    it('should handle very long action strings', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      const longAction = 'a'.repeat(10000);

      expect(() =>
        logCrashContextEntry(mockCharacter, longAction),
      ).not.toThrow();

      const context = currentCrashContext();
      expect(context.some((entry) => entry.includes(longAction))).toBe(true);
    });

    it('should handle empty action strings', async () => {
      const { logCrashContextEntry, currentCrashContext } = await import(
        './crash-context'
      );

      logCrashContextEntry(mockCharacter, '');

      const context = currentCrashContext();
      expect(context).toContain('TestMap:10,20|');
    });
  });
});
