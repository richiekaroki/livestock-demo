import * as Sentry from 'sentry-expo';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatMessage(level: LogLevel, msg: string): string {
  return `[${level.toUpperCase()}] ${msg}`;
}

export const logger = {
  debug: (msg: string, ctx?: unknown) => {
    if (__DEV__) console.debug(formatMessage('debug', msg), ctx);
  },
  info: (msg: string, ctx?: unknown) => {
    if (__DEV__) console.info(formatMessage('info', msg), ctx);
  },
  warn: (msg: string, ctx?: unknown) => {
    console.warn(formatMessage('warn', msg), ctx);
  },
  error: (msg: string, ctx?: unknown) => {
    console.error(formatMessage('error', msg), ctx);
    Sentry.Native.captureMessage(msg, 'error');
  },
};
