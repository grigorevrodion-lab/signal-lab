import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal } from './metrics.registry';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    res.on('finish', () => {
      const path = (req.route?.path as string | undefined) ?? req.path;
      httpRequestsTotal.inc({
        method: req.method,
        path,
        status_code: String(res.statusCode),
      });
    });
    next();
  }
}
