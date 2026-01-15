import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    Logger,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../modules/redis/redis.service';
import { ERROR_CODES, ERROR_HTTP_STATUS, ERROR_MESSAGES } from '@offerhub/shared';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
    limit: number;
    windowSeconds: number;
}

export const RateLimit = (options: RateLimitOptions) => {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        if (propertyKey && descriptor) {
            Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
        } else {
            Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
        }
        return descriptor || target;
    };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly logger = new Logger(RateLimitGuard.name);

    private readonly defaultLimit = 100;
    private readonly defaultWindowSeconds = 60;

    constructor(
        @Inject(RedisService) private readonly redisService: RedisService,
        @Inject(Reflector) private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        const options = this.reflector.getAllAndOverride<RateLimitOptions>(
            RATE_LIMIT_KEY,
            [context.getHandler(), context.getClass()],
        );

        const limit = options?.limit ?? this.defaultLimit;
        const windowSeconds = options?.windowSeconds ?? this.defaultWindowSeconds;

        const identifier = this.getIdentifier(request);
        const key = `rate_limit:${identifier}`;

        try {
            const current = await this.redisService.incr(key);

            if (current === 1) {
                await this.redisService.expire(key, windowSeconds);
            }

            const ttl = await this.redisService.ttl(key);
            const remaining = Math.max(0, limit - current);

            response.setHeader('X-RateLimit-Limit', limit.toString());
            response.setHeader('X-RateLimit-Remaining', remaining.toString());
            response.setHeader('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + ttl).toString());

            if (current > limit) {
                this.logger.warn(`Rate limit exceeded for ${identifier}`);

                throw new HttpException(
                    {
                        error: {
                            code: ERROR_CODES.RATE_LIMITED,
                            message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMITED],
                            details: {
                                limit,
                                windowSeconds,
                                retryAfter: ttl,
                            },
                        },
                    },
                    ERROR_HTTP_STATUS[ERROR_CODES.RATE_LIMITED],
                );
            }

            return true;
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                throw error;
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Rate limit check failed: ${message}`);
            return true;
        }
    }

    private getIdentifier(request: any): string {
        const apiKey = request['apiKey'];
        if (apiKey?.id) {
            return `apikey:${apiKey.id}`;
        }

        const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
        return `ip:${ip}`;
    }
}
