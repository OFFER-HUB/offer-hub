import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Platform configuration response.
 */
interface PlatformConfig {
    currencies: string[];
    limits: {
        topup: { min: string; max: string };
        withdrawal: { min: string; max: string };
        order: { min: string; max: string };
    };
    features: {
        milestones: boolean;
        disputes: boolean;
        sse: boolean;
        airtm: boolean;
        trustlessWork: boolean;
    };
    providers: {
        fiat: string;
        escrow: string;
    };
    version: string;
}

@Controller('config')
export class ConfigController {
    /**
     * Returns platform configuration.
     * This is a public endpoint - no authentication required.
     */
    @Get()
    @Public()
    getConfig(): { data: PlatformConfig } {
        return {
            data: {
                currencies: ['USD'],
                limits: {
                    topup: {
                        min: '1.00',
                        max: '10000.00',
                    },
                    withdrawal: {
                        min: '10.00',
                        max: '5000.00',
                    },
                    order: {
                        min: '1.00',
                        max: '50000.00',
                    },
                },
                features: {
                    milestones: true,
                    disputes: true,
                    sse: false, // Not yet implemented
                    airtm: !!process.env.AIRTM_API_KEY,
                    trustlessWork: !!process.env.TRUSTLESS_API_KEY,
                },
                providers: {
                    fiat: 'airtm',
                    escrow: 'trustless_work',
                },
                version: process.env.npm_package_version || '1.0.0',
            },
        };
    }
}
