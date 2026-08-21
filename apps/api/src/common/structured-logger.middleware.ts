import { NextFunction, Request, Response } from 'express';
import { Logger } from '@nestjs/common';

export function structuredLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const started = Date.now();
  const requestId = req.headers['x-request-id'] || 'unknown';
  const log = new Logger('HTTP');

  res.on('finish', () => {
    const durationMs = Date.now() - started;
    log.log(
      JSON.stringify({
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    );
  });

  next();
}
