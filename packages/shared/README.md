# @offerhub/shared

Shared types, enums, constants, and utilities for OFFER-HUB Orchestrator.

## Structure

```
src/
├── constants/              # Global constants
│   ├── id-prefixes.ts      # ID prefixes (usr_, ord_, etc.)
│   └── error-codes.ts      # Error codes with HTTP status
├── enums/                  # Status enums
│   ├── user.enum.ts        # UserStatus, UserType
│   ├── topup-status.enum.ts
│   ├── order-status.enum.ts
│   ├── escrow-status.enum.ts
│   ├── withdrawal-status.enum.ts
│   └── dispute-status.enum.ts
├── types/                  # TypeScript interfaces
│   ├── pagination.types.ts
│   ├── api-response.types.ts
│   └── balance.types.ts
├── dto/                    # Data Transfer Objects
│   ├── users/
│   ├── orders/
│   ├── topups/
│   └── ...
├── utils/                  # Utility functions
│   ├── id-generator.ts     # nanoid with prefixes
│   ├── amount-formatter.ts # Amount validation/formatting
│   └── date-utils.ts       # ISO 8601 UTC helpers
└── validators/             # Zod validators
```

## Usage

```typescript
import {
  // Enums
  OrderStatus,
  ORDER_TRANSITIONS,
  UserType,
  
  // Constants
  ID_PREFIXES,
  ERROR_CODES,
  
  // Types
  PaginatedResponse,
  ApiErrorResponse,
  
  // Utils
  generateOrderId,
  isValidAmount,
  nowUTC,
} from '@offerhub/shared';

// Generate prefixed IDs
const orderId = generateOrderId(); // 'ord_...'

// Validate amounts
if (isValidAmount('100.00')) {
  // valid
}

// Check state transitions
const canTransition = ORDER_TRANSITIONS[OrderStatus.ORDER_CREATED].includes(
  OrderStatus.FUNDS_RESERVED
);
```

## Documentation

- [Naming Conventions](../../docs/standards/naming-conventions.md)
- [State Machines](../../docs/architecture/state-machines.md)
- [AI.md](../../docs/AI.md) - Development guidelines
