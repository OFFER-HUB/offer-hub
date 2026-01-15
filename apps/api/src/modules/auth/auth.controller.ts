import { Controller, Post, Body, Get, Param, UseGuards, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly authService: AuthService) { }

    @Post('api-keys')
    @UseGuards(ApiKeyGuard, ScopeGuard)
    @Scopes('support')
    async createApiKey(
        @Body('name') name: string,
        @Body('scopes') scopes: string[],
    ) {
        return this.authService.createApiKey(name, scopes);
    }

    @Post('api-keys/:id/token')
    @UseGuards(ApiKeyGuard, ScopeGuard)
    @Scopes('write')
    async generateToken(@Param('id') id: string) {
        const token = await this.authService.generateShortLivedToken(id);
        return { token };
    }
}
