import Rollbar from 'rollbar';
import Winston from 'winston';
import { currentCrashContext } from './crash-context';

let rollbar: Rollbar | undefined;
let winston: Winston.Logger | undefined;

function _logWithTs(type: 'info' | 'warn' | 'error' | 'debug', tag, ...args) {
  const fallback = () => console[type](tag, ...args);

  if (!winston) {
    fallback();
    return;
  }

  try {
    winston?.[type]?.(`[${tag}] ${args}`);

    // who logs the logger?
  } catch {
    fallback();
  }
}

export function initializeRollbar(token: string) {
  if (rollbar) throw new Error('Rollbar already initialized');

  rollbar = new Rollbar({
    accessToken: token,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });
}

export function initializeWinston() {
  if (winston) throw new Error('Winston already initialized');

  winston = Winston.createLogger({
    format: Winston.format.simple(),
    levels: Winston.config.syslog.levels,
    transports: [
      new Winston.transports.Console({
        level: 'info',
        format: Winston.format.combine(
          Winston.format.colorize(),
          Winston.format.simple(),
        ),
      }),
    ],
    exitOnError: (err) => err.code !== 'EPIPE',
  });
}

export function consoleLog(tag: string, ...args) {
  _logWithTs('info', tag, ...args);
}

export function consoleDebug(tag: string, ...args) {
  _logWithTs('debug', tag, ...args);
}

export function consoleWarn(tag: string, ...args) {
  _logWithTs('warn', tag, ...args);
}

export function consoleError(tag: string, error: Error, ...args) {
  _logWithTs('error', tag, error, ...args);

  rollbar?.error(error, {
    args,
    context: currentCrashContext(),
  });
}
