import {
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { ERROR_CODES } from '@offerhub/shared';
import type { OrderStatus } from '@offerhub/shared';

/**
 * Thrown when an order is not found.
 */
export class OrderNotFoundException extends NotFoundException {
    constructor(orderId: string) {
        super({
            error: {
                code: ERROR_CODES.ORDER_NOT_FOUND,
                message: `Order ${orderId} not found`,
            },
        });
    }
}

/**
 * Thrown when attempting an operation that is invalid for the current order state.
 */
export class InvalidOrderStateException extends BadRequestException {
    constructor(orderId: string, currentState: OrderStatus, attemptedAction: string) {
        super({
            error: {
                code: ERROR_CODES.INVALID_STATE,
                message: `Cannot ${attemptedAction} order ${orderId} in state ${currentState}`,
            },
        });
    }
}

/**
 * Thrown when milestone validation fails.
 */
export class MilestoneValidationException extends BadRequestException {
    constructor(message: string) {
        super({
            error: {
                code: ERROR_CODES.INVALID_AMOUNT,
                message,
            },
        });
    }
}

/**
 * Thrown when attempting to create an escrow for an order that already has one.
 */
export class EscrowAlreadyExistsException extends ConflictException {
    constructor(orderId: string) {
        super({
            error: {
                code: ERROR_CODES.ESCROW_ALREADY_EXISTS,
                message: `Escrow already exists for order ${orderId}`,
            },
        });
    }
}

/**
 * Thrown when buyer and seller are the same user.
 */
export class SameUserException extends BadRequestException {
    constructor() {
        super({
            error: {
                code: ERROR_CODES.INVALID_REQUEST,
                message: 'Buyer and seller cannot be the same user',
            },
        });
    }
}

/**
 * Thrown when escrow funding fails.
 */
export class EscrowFundingFailedException extends BadRequestException {
    constructor(originalError: Error) {
        super({
            error: {
                code: ERROR_CODES.ESCROW_FUNDING_FAILED,
                message: `Escrow funding failed: ${originalError.message}`,
            },
        });
    }
}

/**
 * Thrown when milestone is not found.
 */
export class MilestoneNotFoundException extends NotFoundException {
    constructor(orderId: string, milestoneRef: string) {
        super({
            error: {
                code: ERROR_CODES.MILESTONE_NOT_FOUND,
                message: `Milestone ${milestoneRef} not found in order ${orderId}`,
            },
        });
    }
}

/**
 * Thrown when milestone is already completed.
 */
export class MilestoneAlreadyCompletedException extends BadRequestException {
    constructor(milestoneRef: string) {
        super({
            error: {
                code: ERROR_CODES.INVALID_STATE,
                message: `Milestone ${milestoneRef} is already completed`,
            },
        });
    }
}
