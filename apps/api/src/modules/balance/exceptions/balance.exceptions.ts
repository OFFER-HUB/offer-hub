import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '@offerhub/shared';

/**
 * Exception thrown when a user has insufficient available balance
 * for the requested operation.
 */
export class InsufficientFundsException extends HttpException {
    constructor(
        requested: string,
        available: string,
        currency: string = 'USD',
    ) {
        super(
            {
                error: {
                    code: ERROR_CODES.INSUFFICIENT_FUNDS,
                    message: 'Insufficient available balance for this operation',
                    details: {
                        requested,
                        available,
                        currency,
                    },
                },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

/**
 * Exception thrown when there's a discrepancy between local balance
 * and provider balance during synchronization.
 */
export class BalanceDiscrepancyException extends HttpException {
    constructor(
        userId: string,
        localBalance: string,
        providerBalance: string,
        currency: string = 'USD',
    ) {
        super(
            {
                error: {
                    code: 'BALANCE_DISCREPANCY',
                    message: 'Balance discrepancy detected between local and provider',
                    details: {
                        userId,
                        localBalance,
                        providerBalance,
                        currency,
                        difference: (parseFloat(providerBalance) - parseFloat(localBalance)).toFixed(2),
                    },
                },
            },
            HttpStatus.CONFLICT,
        );
    }
}

/**
 * Exception thrown when there are insufficient reserved funds
 * for a release or deduction operation.
 */
export class InsufficientReservedFundsException extends HttpException {
    constructor(
        requested: string,
        reserved: string,
        currency: string = 'USD',
    ) {
        super(
            {
                error: {
                    code: ERROR_CODES.RESERVE_NOT_FOUND,
                    message: 'Insufficient reserved balance for this operation',
                    details: {
                        requested,
                        reserved,
                        currency,
                    },
                },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

/**
 * Exception thrown when a balance operation fails due to concurrent access
 * or optimistic locking conflict.
 */
export class BalanceConcurrencyException extends HttpException {
    constructor(userId: string, operation: string) {
        super(
            {
                error: {
                    code: 'BALANCE_CONCURRENCY_CONFLICT',
                    message: 'Balance operation failed due to concurrent modification',
                    details: {
                        userId,
                        operation,
                        suggestion: 'Please retry the operation',
                    },
                },
            },
            HttpStatus.CONFLICT,
        );
    }
}

/**
 * Exception thrown when the amount format is invalid.
 */
export class InvalidAmountException extends HttpException {
    constructor(amount: string) {
        super(
            {
                error: {
                    code: ERROR_CODES.INVALID_AMOUNT_FORMAT,
                    message: 'Amount must be a positive decimal string with exactly 2 decimal places',
                    details: {
                        provided: amount,
                        expectedFormat: 'X.XX (e.g., "100.00", "0.50")',
                    },
                },
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

/**
 * Exception thrown when balance record is not found for a user.
 */
export class BalanceNotFoundException extends HttpException {
    constructor(userId: string) {
        super(
            {
                error: {
                    code: 'BALANCE_NOT_FOUND',
                    message: 'Balance record not found for user',
                    details: {
                        userId,
                    },
                },
            },
            HttpStatus.NOT_FOUND,
        );
    }
}
