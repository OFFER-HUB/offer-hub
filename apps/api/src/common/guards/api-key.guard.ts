import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../modules/database/prisma.service';
import { AuthService } from '../../modules/auth/auth.service';
import { hashApiKey } from '@offerhub/shared';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
        @Inject(AuthService) private authService: AuthService,
        @Inject(Reflector) private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if endpoint is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('Missing Authorization header');
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization format');
        }

        // Handle short-lived tokens
        if (token.startsWith('ohk_tok_')) {
            const payload = await this.authService.validateShortLivedToken(token);
            request['apiKey'] = { id: payload.sub, scopes: payload.scopes };
            return true;
        }

        if (!token.startsWith('ohk_')) {
            throw new UnauthorizedException('Invalid API Key format');
        }

        const parts = token.split('_');
        // Format: ohk_{env}_{id}_{random}
        // Example: ohk_live_key_V1StGXR8Z5jdHi6B3mEv0_random
        // parts: ['ohk', 'live', 'key', 'V1StGXR8Z5jdHi6B3mEv0', 'random']
        if (parts.length < 5) {
            throw new UnauthorizedException('Invalid API Key format');
        }

        const keyId = `${parts[2]}_${parts[3]}`;
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { id: keyId },
        });

        if (!apiKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        // Hash provided token and compare
        const hashed = hashApiKey(token, apiKey.salt);

        if (hashed !== apiKey.hashedKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        // Attach api key info to request
        request['apiKey'] = apiKey;

        return true;
    }
}
