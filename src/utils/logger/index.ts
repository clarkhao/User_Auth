import { createLogger, transports, format } from 'winston';
const DailyRotateFile = require('winston-daily-rotate-file');
import path from 'path';

// Create logger instance
const logger = createLogger({
  transports: [
    // write log into file with rotating 7 days
    new DailyRotateFile({
      level: 'info',
      filename: path.join(__dirname, '../../logger/request-%DATE%.log'),
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
      filename: path.join(__dirname, '../../logger/error-%DATE%.log'),
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
  ]
});

const debugLogger = createLogger({
  transports: [
    // Write debug logs to console
    new transports.Console({
      level: 'debug',
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

export { logger, debugLogger };