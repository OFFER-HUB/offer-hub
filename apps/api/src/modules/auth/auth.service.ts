import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { generateApiKey } from '@offerhub/shared';

@Injectable()
export class AuthService {
    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
        @Inject(JwtService) private jwtService: JwtService,
    ) { }

    /**
     * Creates a new API Key.
     * The full key is returned only once.
     */
    async createApiKey(name: string, scopes: string[], marketplaceId?: string) {
        const { key, hashedKey, salt, id } = generateApiKey();

        const apiKey = await this.prisma.apiKey.create({
            data: {
                id,
                name,
                hashedKey,
                salt,
                scopes,
                marketplaceId,
            },
        });

        return {
            id: apiKey.id,
            key, // Plain text key to be shown once
            name: apiKey.name,
            scopes: apiKey.scopes,
        };
    }

    /**
     * Generates a short-lived token (ohk_tok_...) from a valid API Key ID.
     * Designed for frontend-to-orchestrator communication.
     */
    async generateShortLivedToken(apiKeyId: string) {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { id: apiKeyId },
        });

        if (!apiKey) {
            throw new UnauthorizedException('Invalid API Key ID');
        }

        const payload = {
            sub: apiKey.id,
            scopes: apiKey.scopes,
            type: 'short-lived',
        };

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '1h', // Short-lived
        });

        return `ohk_tok_${token}`;
    }

    /**
     * Validates a short-lived token.
     */
    async validateShortLivedToken(token: string) {
        try {
            const jwtPart = token.replace('ohk_tok_', '');
            const payload = await this.jwtService.verifyAsync(jwtPart);
            return payload;
        } catch {
            throw new UnauthorizedException('Invalid or expired short-lived token');
        }
    }

    /**
     * Lists API keys with pagination.
     * API key values are never returned (only shown once at creation).
     */
    async listApiKeys(options: { limit?: number; cursor?: string } = {}) {
        const limit = Math.min(options.limit || 20, 100);

        const apiKeys = await this.prisma.apiKey.findMany({
            take: limit + 1,
            ...(options.cursor && {
                skip: 1,
                cursor: { id: options.cursor },
            }),
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                scopes: true,
                lastUsedAt: true,
                createdAt: true,
            },
        });

        const hasMore = apiKeys.length > limit;
        const data = apiKeys.slice(0, limit);

        return {
            data: data.map((key) => ({
                id: key.id,
                name: key.name,
                scopes: key.scopes,
                lastUsedAt: key.lastUsedAt?.toISOString() || null,
                createdAt: key.createdAt.toISOString(),
            })),
            pagination: {
                hasMore,
                nextCursor: hasMore ? data[data.length - 1].id : null,
            },
        };
    }

    /**
     * Gets API key by ID (for /me endpoint context).
     */
    async getApiKeyById(id: string) {
        return this.prisma.apiKey.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                scopes: true,
            },
        });
    }
}
