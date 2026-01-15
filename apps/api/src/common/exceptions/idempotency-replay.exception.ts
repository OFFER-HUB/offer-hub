import { HttpException } from '@nestjs/common';

export class IdempotencyReplayException extends HttpException {
    constructor(public readonly responseData: { status: number; body: any }) {
        super(responseData.body, responseData.status);
    }
}
