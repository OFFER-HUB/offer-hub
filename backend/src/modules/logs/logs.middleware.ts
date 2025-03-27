import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LogginMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction){
        const { method, url } = req;
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            this.logger.log(`${method} ${url} - ${res.statusCode} (${duration}ms)`);
        });
        next();
    }
}