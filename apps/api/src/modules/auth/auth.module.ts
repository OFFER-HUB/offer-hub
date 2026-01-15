import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: process.env.OFFERHUB_JWT_SECRET || 'fallback-secret-for-dev',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, ApiKeyGuard, ScopeGuard],
    exports: [AuthService, ApiKeyGuard, ScopeGuard],
})
export class AuthModule { }
