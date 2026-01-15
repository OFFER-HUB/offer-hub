/** @see docs/architecture/state-machines.md */

import { DisputeStatus, DISPUTE_TRANSITIONS } from '../enums/dispute-status.enum.js';
import { EscrowStatus, ESCROW_TRANSITIONS } from '../enums/escrow-status.enum.js';
import { OrderStatus, ORDER_TRANSITIONS } from '../enums/order-status.enum.js';
import { TopUpStatus, TOPUP_TRANSITIONS } from '../enums/topup-status.enum.js';
import { WithdrawalStatus, WITHDRAWAL_TRANSITIONS } from '../enums/withdrawal-status.enum.js';
import { ERROR_CODES } from '../constants/error-codes.js';

export interface TransitionResult {
    valid: boolean;
    error?: {
        code: string;
        message: string;
        details: {
            currentState: string;
            targetState: string;
            allowedTransitions: string[];
        };
    };
}

export class StateMachine<T extends string> {
    constructor(
        private readonly transitions: Record<T, T[]>,
        private readonly entityName: string,
    ) {}

    canTransition(currentState: T, targetState: T): boolean {
        const allowed = this.transitions[currentState];
        return allowed?.includes(targetState) ?? false;
    }

    validateTransition(currentState: T, targetState: T): TransitionResult {
        const allowed = this.transitions[currentState] ?? [];

        if (allowed.includes(targetState)) {
            return { valid: true };
        }

        return {
            valid: false,
            error: {
                code: ERROR_CODES.INVALID_STATE,
                message: `Invalid ${this.entityName} state transition from ${currentState} to ${targetState}`,
                details: {
                    currentState,
                    targetState,
                    allowedTransitions: allowed,
                },
            },
        };
    }

    assertTransition(currentState: T, targetState: T): void {
        const result = this.validateTransition(currentState, targetState);
        if (!result.valid) {
            throw new InvalidStateTransitionError(
                result.error!.message,
                result.error!.details,
            );
        }
    }

    getAllowedTransitions(currentState: T): T[] {
        return this.transitions[currentState] ?? [];
    }

    isTerminalState(state: T): boolean {
        const allowed = this.transitions[state];
        return !allowed || allowed.length === 0;
    }
}

export class InvalidStateTransitionError extends Error {
    public readonly code = ERROR_CODES.INVALID_STATE;

    constructor(
        message: string,
        public readonly details: {
            currentState: string;
            targetState: string;
            allowedTransitions: string[];
        },
    ) {
        super(message);
        this.name = 'InvalidStateTransitionError';
    }
}

export const OrderStateMachine = new StateMachine<OrderStatus>(
    ORDER_TRANSITIONS,
    'Order',
);

export const TopUpStateMachine = new StateMachine<TopUpStatus>(
    TOPUP_TRANSITIONS,
    'TopUp',
);

export const WithdrawalStateMachine = new StateMachine<WithdrawalStatus>(
    WITHDRAWAL_TRANSITIONS,
    'Withdrawal',
);

export const EscrowStateMachine = new StateMachine<EscrowStatus>(
    ESCROW_TRANSITIONS,
    'Escrow',
);

export const DisputeStateMachine = new StateMachine<DisputeStatus>(
    DISPUTE_TRANSITIONS,
    'Dispute',
);
