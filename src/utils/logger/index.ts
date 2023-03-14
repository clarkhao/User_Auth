import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Create logger instance
const logger = createLogger({
  transports: [
    // write log into file with rotating 7 days
    new DailyRotateFile({
      level: 'info',
      filename: 'logger/request-%DATE%.log',
      datePattern: 'YYYY-WW',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '7d',
      format: format.combine(
        format.timestamp(),
        format.printf(info => {
          return `${info.timestamp} [${info.level}]: ${JSON.stringify(info.message)}`;
        })
      )
    }),
    new DailyRotateFile({
      level: 'error',
      filename: 'logger/error-%DATE%.log',
      datePattern: 'YYYY-WW',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '7d',
      format: format.combine(
        format.timestamp(),
        format.printf(info => {
          return `${info.timestamp} [${info.level}]: ${JSON.stringify(info.message)}`;
        })
      )
    })
  ]
});

const debug = createLogger({
  transports: [
    new DailyRotateFile({
      level: 'error',
      filename: 'logger/debug-%DATE%.log',
      datePattern: 'YYYY-WW',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '7d',
      format: format.combine(
        format.timestamp(),
        format.printf(info => {
          return `${info.timestamp} [${info.level}]: ${JSON.stringify(info.message)}`;
        })
      )
    })
  ]
})

export { logger, debug };