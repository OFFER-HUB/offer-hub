import {
    Controller,
    Post,
    Body,
    Headers,
    RawBodyRequest,
    Req,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AirtmWebhookService } from '../../providers/airtm';
import type { SvixWebhookHeaders } from '../../providers/airtm';

/**
 * Controller for receiving webhooks from external providers.
 * Handles Airtm and Trustless Work webhook events.
 */
@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly airtmWebhookService: AirtmWebhookService,
    ) {}

    /**
     * Receives webhooks from Airtm.
     *
     * Flow:
     * 1. Verify signature using Svix headers
     * 2. Return 200 OK immediately (before processing)
     * 3. Process event asynchronously
     *
     * @see https://docs.airtm.io/webhooks
     */
    @Post('airtm')
    @HttpCode(HttpStatus.OK)
    async handleAirtmWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('svix-signature') svixSignature: string,
    ): Promise<{ status: string; processed?: boolean; duplicate?: boolean }> {
        this.logger.log(`Received Airtm webhook: svix-id=${svixId}`);

        // Get raw body for signature verification
        const rawBody = req.rawBody?.toString() || JSON.stringify(req.body);

        // Build Svix headers object
        const svixHeaders: SvixWebhookHeaders = {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        };

        // 1. Verify signature (throws 401 if invalid)
        const payload = this.airtmWebhookService.verifySignature(rawBody, svixHeaders);

        // 2. Process the event
        const result = await this.airtmWebhookService.processEvent(payload);

        if (result.duplicate) {
            this.logger.debug(`Duplicate webhook ignored: ${result.eventId}`);
            return { status: 'ok', duplicate: true };
        }

        if (!result.success) {
            this.logger.warn(`Webhook processing failed: ${result.error}`);
            // Still return 200 to prevent retries for business logic errors
            return { status: 'ok', processed: false };
        }

        this.logger.log(
            `Webhook processed: eventId=${result.eventId}, type=${result.eventType}, ` +
            `resource=${result.resourceId}, newStatus=${result.newStatus}`,
        );

        return { status: 'ok', processed: true };
    }

    /**
     * Receives webhooks from Trustless Work.
     * TODO: Implement when Trustless Work integration is ready.
     */
    @Post('trustless-work')
    @HttpCode(HttpStatus.OK)
    async handleTrustlessWorkWebhook(
        @Body() _body: unknown,
    ): Promise<{ status: string }> {
        this.logger.warn('Trustless Work webhook received but not implemented yet');
        return { status: 'ok' };
    }
}
