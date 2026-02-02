import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ScopeGuard implements CanActivate {
    constructor(@Inject(Reflector) private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredScopes = this.reflector.getAllAndOverride<string[]>('scopes', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredScopes || requiredScopes.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const apiKey = request['apiKey'];

        if (!apiKey || !apiKey.scopes) {
            throw new ForbiddenException('Insufficient scope');
        }

        // '*' scope allows everything
        if (apiKey.scopes.includes('*')) {
            return true;
        }

        const hasScope = requiredScopes.every((scope) =>
            apiKey.scopes.includes(scope),
        );

        if (!hasScope) {
            throw new ForbiddenException('Insufficient scope');
        }

        return true;
    }
}
