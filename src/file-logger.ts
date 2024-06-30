import ShortUniqueId from 'short-unique-id';
import winston from 'winston';

export const logFileName = `game-${new ShortUniqueId().randomUUID(6)}.log`;

const format = winston.format.printf(
  ({ level, message, label, timestamp, ...meta }) => {
    return `${message}`;
  },
);

const FileLogger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.File({
      filename: logFileName,
      level: 'info',
      format: format,
    }),
  ],
});

export default FileLogger;
