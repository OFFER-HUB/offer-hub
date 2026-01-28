import { Controller, Get, Inject } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

    /**
     * Basic health check - returns immediately.
     * Use this for load balancer probes.
     */
    @Get()
    @Public()
    getHealth() {
        return {
            status: 'healthy',
            version: process.env.npm_package_version || '1.0.0',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Detailed health check - checks all dependencies.
     * Use this for monitoring and debugging.
     * May take up to 5 seconds per dependency.
     */
    @Get('detailed')
    @Public()
    async getDetailedHealth() {
        return this.healthService.check();
    }
}
