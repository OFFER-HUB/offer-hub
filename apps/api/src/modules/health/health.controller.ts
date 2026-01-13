import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    getHealth() {
        return {
            status: 'healthy',
            version: '0.0.0',
            timestamp: new Date().toISOString(),
        };
    }
}
