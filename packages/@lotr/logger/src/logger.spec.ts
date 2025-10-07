import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Logger', () => {
  let mockRollbar: any;
  let mockWinston: any;
  let consoleSpy: any;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();
    vi.resetModules();

    // Mock console methods
    consoleSpy = {
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };

    // Create fresh mock instances for each test
    mockRollbar = {
      error: vi.fn(),
    };

    mockWinston = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    // Mock Rollbar
    vi.doMock('rollbar', () => ({
      default: vi.fn(() => mockRollbar),
    }));

    // Mock Winston
    vi.doMock('winston', () => ({
      default: {
        createLogger: vi.fn(() => mockWinston),
        format: {
          simple: vi.fn(() => 'simple-format'),
          combine: vi.fn(() => 'combined-format'),
          colorize: vi.fn(() => 'colorize-format'),
        },
        config: {
          syslog: {
            levels: { error: 0, warn: 1, info: 2, debug: 3 },
          },
        },
        transports: {
          Console: vi.fn(() => ({})),
        },
      },
    }));

    // Mock crash context module
    vi.doMock('./crash-context', () => ({
      currentCrashContext: vi.fn(() => ['test-context-1', 'test-context-2']),
      logCrashContextEntry: vi.fn(),
      setShouldLogCrashContext: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should import functions without errors', async () => {
      const logger = await import('./logger');

      expect(logger.initializeRollbar).toBeDefined();
      expect(logger.initializeWinston).toBeDefined();
      expect(logger.consoleLog).toBeDefined();
      expect(logger.consoleDebug).toBeDefined();
      expect(logger.consoleWarn).toBeDefined();
      expect(logger.consoleError).toBeDefined();
    });

    it('should fallback to console when winston is not initialized', async () => {
      const { consoleLog } = await import('./logger');

      consoleLog('TEST', 'message');

      expect(consoleSpy.info).toHaveBeenCalledWith('TEST', 'message');
    });

    it('should fallback to console for debug when winston is not initialized', async () => {
      const { consoleDebug } = await import('./logger');

      consoleDebug('DEBUG', 'message');

      expect(consoleSpy.debug).toHaveBeenCalledWith('DEBUG', 'message');
    });

    it('should fallback to console for warn when winston is not initialized', async () => {
      const { consoleWarn } = await import('./logger');

      consoleWarn('WARN', 'message');

      expect(consoleSpy.warn).toHaveBeenCalledWith('WARN', 'message');
    });

    it('should fallback to console for error when winston is not initialized', async () => {
      const { consoleError } = await import('./logger');

      consoleError('ERROR', new Error('test'));

      expect(consoleSpy.error).toHaveBeenCalledWith('ERROR', expect.any(Error));
    });
  });

  describe('Rollbar Initialization', () => {
    it('should initialize Rollbar with correct configuration', async () => {
      const Rollbar = (await import('rollbar')).default;
      const { initializeRollbar } = await import('./logger');

      const token = 'test-token';
      initializeRollbar(token);

      expect(Rollbar).toHaveBeenCalledWith({
        accessToken: token,
        captureUncaught: true,
        captureUnhandledRejections: true,
      });
    });

    it('should throw error if Rollbar is already initialized', async () => {
      const { initializeRollbar } = await import('./logger');

      const token = 'test-token';
      initializeRollbar(token);

      expect(() => initializeRollbar(token)).toThrow(
        'Rollbar already initialized',
      );
    });
  });

  describe('Winston Initialization', () => {
    it('should initialize Winston with correct configuration', async () => {
      const Winston = (await import('winston')).default;
      const { initializeWinston } = await import('./logger');

      initializeWinston();

      expect(Winston.createLogger).toHaveBeenCalledWith({
        format: 'simple-format',
        levels: { error: 0, warn: 1, info: 2, debug: 3 },
        transports: [expect.any(Object)],
        exitOnError: expect.any(Function),
      });
    });

    it('should throw error if Winston is already initialized', async () => {
      const { initializeWinston } = await import('./logger');

      initializeWinston();

      expect(() => initializeWinston()).toThrow('Winston already initialized');
    });
  });

  describe('Winston Integration', () => {
    it('should use winston for logging when initialized', async () => {
      const { initializeWinston, consoleLog } = await import('./logger');

      initializeWinston();
      consoleLog('TEST', 'message');

      expect(mockWinston.info).toHaveBeenCalledWith('[TEST] message');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('should fallback to console when winston throws error', async () => {
      const { initializeWinston, consoleLog } = await import('./logger');

      initializeWinston();
      mockWinston.info.mockImplementation(() => {
        throw new Error('Winston error');
      });

      consoleLog('TEST', 'message');

      expect(consoleSpy.info).toHaveBeenCalledWith('TEST', 'message');
    });
  });

  describe('Rollbar Integration', () => {
    it('should send error to rollbar when initialized', async () => {
      const { initializeRollbar, consoleError } = await import('./logger');

      initializeRollbar('test-token');
      const error = new Error('test error');
      consoleError('ERROR', error, 'extra');

      expect(mockRollbar.error).toHaveBeenCalledWith(error, {
        args: ['extra'],
        context: ['test-context-1', 'test-context-2'],
      });
    });

    it('should not send to rollbar when not initialized', async () => {
      const { consoleError } = await import('./logger');

      const error = new Error('test error');
      consoleError('ERROR', error);

      expect(mockRollbar.error).not.toHaveBeenCalled();
    });

    it('should include crash context in rollbar errors', async () => {
      const { initializeRollbar, consoleError } = await import('./logger');
      const { currentCrashContext } = await import('./crash-context');

      // Mock different context
      vi.mocked(currentCrashContext).mockReturnValue([
        'map1:10,20|action1',
        'map2:30,40|action2',
      ]);

      initializeRollbar('test-token');
      const error = new Error('context test error');
      consoleError('ERROR', error);

      expect(mockRollbar.error).toHaveBeenCalledWith(error, {
        args: [],
        context: ['map1:10,20|action1', 'map2:30,40|action2'],
      });
      expect(currentCrashContext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle multiple arguments', async () => {
      const { consoleLog } = await import('./logger');

      const args = ['arg1', { data: 'object' }, [1, 2, 3]];
      consoleLog('TEST', ...args);

      expect(consoleSpy.info).toHaveBeenCalledWith('TEST', ...args);
    });

    it('should handle empty or null arguments', async () => {
      const { consoleLog } = await import('./logger');

      // Should not throw
      expect(() => consoleLog('TEST')).not.toThrow();
      expect(() => consoleLog('TEST', null)).not.toThrow();
      expect(() => consoleLog('TEST', undefined)).not.toThrow();

      expect(consoleSpy.info).toHaveBeenCalledTimes(3);
    });

    it('should propagate crash context errors', async () => {
      const { initializeRollbar, consoleError } = await import('./logger');
      const { currentCrashContext } = await import('./crash-context');

      // Mock crash context to throw error
      vi.mocked(currentCrashContext).mockImplementation(() => {
        throw new Error('Crash context error');
      });

      initializeRollbar('test-token');
      const error = new Error('test error');

      // Currently the logger lets crash context errors bubble up
      expect(() => consoleError('ERROR', error)).toThrow('Crash context error');
    });
  });
});
