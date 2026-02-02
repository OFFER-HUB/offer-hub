import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopeGuard } from '../scope.guard';

describe('ScopeGuard', () => {
    let guard: ScopeGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        } as any;
        guard = new ScopeGuard(reflector);
    });

    const createMockContext = (apiKey: any, handlerScopes: string[] | undefined): ExecutionContext => {
        reflector.getAllAndOverride.mockReturnValue(handlerScopes);

        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    apiKey,
                }),
            }),
        } as any;
    };

    it('should allow if no scopes are required', () => {
        const context = createMockContext({ scopes: [] }, undefined);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow if user has the master scope "*"', () => {
        const context = createMockContext({ scopes: ['*'] }, ['events.read']);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow if user has all required scopes', () => {
        const context = createMockContext({ scopes: ['events.read', 'users.write'] }, ['events.read']);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user lacks required scope', () => {
        const context = createMockContext({ scopes: ['users.read'] }, ['events.read']);
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no API key is present', () => {
        const context = createMockContext(undefined, ['events.read']);
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
});
