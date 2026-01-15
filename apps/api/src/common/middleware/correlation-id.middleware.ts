import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const requestId = (req.headers['x-request-id'] as string) || randomUUID();

        req.requestId = requestId;
        req.headers['x-request-id'] = requestId;

        res.setHeader('X-Request-ID', requestId);

        next();
    }
}
