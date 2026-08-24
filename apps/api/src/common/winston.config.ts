import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(
    ({
      timestamp,
      level,
      message,
      context,
    }: {
      timestamp?: string;
      level: string;
      message: string;
      context?: string;
    }) => {
      return `${timestamp} [${context || 'App'}] ${level}: ${message}`;
    },
  ),
);

const prodFormat = combine(timestamp(), json());

export function createWinstonLogger() {
  const isProd = process.env.NODE_ENV === 'production';

  return WinstonModule.createLogger({
    level: isProd ? 'info' : 'debug',
    format: isProd ? prodFormat : devFormat,
    transports: [
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
      }),
      ...(isProd
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 5242880,
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              maxsize: 5242880,
              maxFiles: 5,
            }),
          ]
        : []),
    ],
  });
}
