const logLevels = process.env.LOG_LEVEL || 'info,debug,error,log,warn';

const availableLogLevels = {};
logLevels.split(',').forEach((level) => (availableLogLevels[level] = true));

export const _logWithTs = (
  type: 'info' | 'warn' | 'error' | 'debug',
  tag,
  ...args
) => {
  if (!availableLogLevels[type]) return;

  // eslint-disable-next-line no-console
  console[type](new Date().toISOString(), `[${tag}]`, ...args);
};

export const consoleLog = (tag: string, ...args) => {
  _logWithTs('info', tag, ...args);
};

export const consoleWarn = (tag: string, ...args) => {
  _logWithTs('warn', tag, ...args);
};

export const consoleError = (tag: string, ...args) => {
  _logWithTs('error', tag, ...args);
};
