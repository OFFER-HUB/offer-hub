import {
    NotFoundException,
    BadRequestException,
    ConflictException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ERROR_CODES } from '@offerhub/shared';

/**
 * Thrown when a dispute is not found.
 */
export class DisputeNotFoundException extends NotFoundException {
    constructor(disputeId: string) {
        super({
            error: {
                code: ERROR_CODES.DISPUTE_NOT_FOUND,
                message: `Dispute ${disputeId} not found`,
            },
        });
    }
}

/**
 * Thrown when attempting to create a dispute for an order that already has one.
 */
export class DisputeAlreadyExistsException extends ConflictException {
    constructor(orderId: string, message?: string) {
        super({
            error: {
                code: ERROR_CODES.DISPUTE_ALREADY_OPEN,
                message: message || `Active dispute already exists for order ${orderId}`,
            },
        });
    }
}

/**
 * Thrown when attempting an operation that is invalid for the current dispute state.
 */
export class InvalidDisputeStateException extends BadRequestException {
    constructor(disputeId: string, currentState: string, attemptedAction: string) {
        super({
            error: {
                code: ERROR_CODES.INVALID_STATE,
                message: `Cannot ${attemptedAction} dispute ${disputeId} in state ${currentState}`,
            },
        });
    }
}

/**
 * Thrown when dispute resolution amounts are invalid.
 */
export class InvalidDisputeResolutionException extends UnprocessableEntityException {
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
 * Thrown when attempting to request release and refund simultaneously.
 */
export class MutuallyExclusiveResolutionException extends ConflictException {
    constructor(orderId: string, message: string) {
        super({
            error: {
                code: ERROR_CODES.INVALID_STATE,
                message: `Order ${orderId}: ${message}`,
            },
        });
    }
}

/**
 * Thrown when attempting resolution operations on an order with active dispute.
 */
export class ActiveDisputeException extends ConflictException {
    constructor(orderId: string, message: string) {
        super({
            error: {
                code: ERROR_CODES.DISPUTE_ALREADY_OPEN,
                message: `Order ${orderId}: ${message}`,
            },
        });
    }
}

/**
 * Thrown when attempting resolution operations on an order in invalid state.
 */
export class InvalidResolutionStateException extends BadRequestException {
    constructor(orderId: string, currentState: string, requiredState: string) {
        super({
            error: {
                code: ERROR_CODES.INVALID_STATE,
                message: `Order ${orderId} is in state ${currentState}, but ${requiredState} is required for this operation`,
            },
        });
    }
}
