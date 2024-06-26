export default class Logger {
  static #logger: Logger;
  static logLevel: 'debug' | 'info' | 'warn' | 'error' =
    process.env.LOG_LEVEL?.toLowerCase() as 'debug' | 'info' | 'warn' | 'error';

  private constructor() {}

  static format(
    message: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    meta?: Record<string, unknown>,
  ) {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let formattedMessage = `[${timestamp}] [${Logger.colorize(level.toUpperCase(), level)}] ${message}`;

    if (meta) {
      const metaString = Object.entries(meta)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      formattedMessage += ` (${metaString})`;
    }

    return formattedMessage;
  }

  private static colorize(
    message: string,
    level: 'debug' | 'info' | 'warn' | 'error',
  ) {
    const colors = {
      debug: '\x1b[34m', // Blue
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    };

    const resetColor = '\x1b[0m';

    return `${colors[level]}${message}${resetColor}`;
  }

  static debug(message: string, meta?: Record<string, unknown>) {
    if (Logger.shouldLog('debug')) {
      console.log(Logger.format(message, 'debug', meta));
    }
  }

  static info(message: string, meta?: Record<string, unknown>) {
    if (Logger.shouldLog('info')) {
      console.log(Logger.format(message, 'info', meta));
    }
  }

  static warn(message: string, meta?: Record<string, unknown>) {
    if (Logger.shouldLog('warn')) {
      console.log(Logger.format(message, 'warn', meta));
    }
  }

  static error(message: string, meta?: Record<string, unknown>) {
    if (Logger.shouldLog('error')) {
      console.error(Logger.format(message, 'error', meta));
    }
  }

  private static shouldLog(level: 'debug' | 'info' | 'warn' | 'error') {
    const logLevels = ['debug', 'info', 'warn', 'error'];
    const currentLogLevel = Logger.logLevel || 'info';
    const currentLogLevelIndex = logLevels.indexOf(currentLogLevel);
    const levelIndex = logLevels.indexOf(level);

    return levelIndex >= currentLogLevelIndex;
  }
}
