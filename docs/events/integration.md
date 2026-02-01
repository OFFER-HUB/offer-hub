# Event System Integration Guide

This guide shows how to integrate the Event Bus into existing services.

## Overview

The Event Bus should emit events at key state transitions to enable:
- Real-time SSE streaming (Issue 6.2)
- Audit trail persistence (Issue 6.3)
- Future integrations (webhooks, analytics)

## Integration Pattern

### 1. Import Dependencies

```typescript
import { EventBusService, EVENT_CATALOG } from '../events';
import type { 
  TopUpCreatedPayload, 
  TopUpSucceededPayload 
} from '../events/types';
```

### 2. Inject EventBusService

```typescript
@Injectable()
export class TopUpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService, // Add this
    // ... other dependencies
  ) {}
}
```

### 3. Emit Events on State Changes

```typescript
async createTopUp(userId: string, dto: CreateTopUpDto): Promise<CreateTopUpResponse> {
  // ... existing logic ...
  
  const topup = await this.prisma.topUp.create({
    data: { /* ... */ }
  });

  // ✅ Emit event after successful creation
  this.eventBus.emit<TopUpCreatedPayload>({
    eventType: EVENT_CATALOG.TOPUP_CREATED,
    aggregateId: topup.id,
    aggregateType: 'TopUp',
    payload: {
      userId: topup.userId,
      amount: topup.amount,
      currency: topup.currency,
    },
    metadata: EventBusService.createMetadata({
      userId,
      correlationId: requestContext?.correlationId,
    }),
  });

  // ... rest of logic ...
}
```

## Example: TopUpsService Integration

Here's a complete example showing where to emit events in TopUpsService:

### Event Emission Points

1. **TOPUP_CREATED** - After creating top-up in DB (line ~124)
2. **TOPUP_CONFIRMATION_REQUIRED** - After getting confirmation URI from Airtm (line ~154)
3. **TOPUP_SUCCEEDED** - When balance is credited (line ~361)
4. **TOPUP_FAILED** - When Airtm call fails (line ~170)
5. **TOPUP_CANCELED** - After canceling top-up (line ~443)

### Code Example

```typescript
// In createTopUp() - after DB creation
const topup = await this.prisma.topUp.create({ /* ... */ });

this.eventBus.emit<TopUpCreatedPayload>({
  eventType: EVENT_CATALOG.TOPUP_CREATED,
  aggregateId: topup.id,
  aggregateType: 'TopUp',
  payload: {
    userId: topup.userId,
    amount: topup.amount,
    currency: topup.currency,
  },
  metadata: EventBusService.createMetadata({ userId }),
});

// In refreshTopUp() - when status changes to SUCCEEDED
if (newStatus === TopUpStatus.TOPUP_SUCCEEDED) {
  await this.balanceService.creditAvailable(userId, { /* ... */ });
  
  this.eventBus.emit<TopUpSucceededPayload>({
    eventType: EVENT_CATALOG.TOPUP_SUCCEEDED,
    aggregateId: topupId,
    aggregateType: 'TopUp',
    payload: {
      topupId,
      userId,
      amount: topup.amount,
      currency: topup.currency,
      newAvailableBalance: balance.available,
      airtmPayinId: topup.airtmPayinId,
    },
    metadata: EventBusService.createMetadata({ userId }),
  });
}
```

## Services to Integrate

### Priority 1: Core Services
- [x] EventBusService (implemented)
- [ ] TopUpsService
- [ ] OrdersService
- [ ] WithdrawalsService
- [ ] BalanceService

### Priority 2: Supporting Services
- [ ] ResolutionService (disputes)
- [ ] UsersService
- [ ] EscrowService (if exists)

## Event Emission Checklist

For each service method that changes state:

- [ ] Identify the state transition
- [ ] Choose the appropriate event from EVENT_CATALOG
- [ ] Create the typed payload
- [ ] Include relevant metadata (userId, correlationId)
- [ ] Emit the event AFTER the database transaction succeeds
- [ ] Handle errors gracefully (event emission should not break the main flow)

## Best Practices

### 1. Emit After Success
Always emit events AFTER the database transaction succeeds:

```typescript
// ✅ CORRECT
const order = await this.prisma.order.create({ /* ... */ });
this.eventBus.emit({ /* ... */ }); // After success

// ❌ INCORRECT
this.eventBus.emit({ /* ... */ }); // Before DB operation
const order = await this.prisma.order.create({ /* ... */ });
```

### 2. Use Type-Safe Payloads
Always specify the payload type for better IDE support:

```typescript
// ✅ CORRECT
this.eventBus.emit<OrderCreatedPayload>({
  eventType: EVENT_CATALOG.ORDER_CREATED,
  // TypeScript will validate the payload structure
  payload: { orderId, buyerId, sellerId, amount, currency, title },
  // ...
});

// ❌ INCORRECT (no type safety)
this.eventBus.emit({
  eventType: EVENT_CATALOG.ORDER_CREATED,
  payload: { /* anything goes */ },
  // ...
});
```

### 3. Propagate Correlation IDs
Always propagate correlation IDs for traceability:

```typescript
this.eventBus.emit({
  // ...
  metadata: EventBusService.createMetadata({
    correlationId: requestContext.correlationId,
    userId: currentUser.id,
    marketplaceId: requestContext.marketplaceId,
  }),
});
```

### 4. Handle Errors Gracefully
Event emission should not break the main flow:

```typescript
try {
  this.eventBus.emit({ /* ... */ });
} catch (error) {
  this.logger.error('Failed to emit event', error);
  // Don't throw - the main operation already succeeded
}
```

## Testing Events

### Unit Tests
Test that events are emitted with correct payloads:

```typescript
it('should emit TOPUP_CREATED event', async () => {
  const emitSpy = jest.spyOn(eventBus, 'emit');
  
  await service.createTopUp(userId, dto);
  
  expect(emitSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: EVENT_CATALOG.TOPUP_CREATED,
      aggregateId: expect.stringMatching(/^topup_/),
      payload: expect.objectContaining({
        userId,
        amount: dto.amount,
      }),
    })
  );
});
```

### Integration Tests
Test that event handlers receive events:

```typescript
it('should trigger audit log on order creation', async () => {
  const auditLogSpy = jest.fn();
  eventEmitter.on(EVENT_CATALOG.ORDER_CREATED, auditLogSpy);
  
  await service.createOrder(dto);
  
  expect(auditLogSpy).toHaveBeenCalled();
});
```

## Module Configuration

Don't forget to import EventsModule in your feature module:

```typescript
@Module({
  imports: [
    EventsModule, // Add this
    // ... other imports
  ],
  providers: [TopUpsService],
  exports: [TopUpsService],
})
export class TopUpsModule {}
```

## Next Steps

1. Integrate EventBusService into TopUpsService
2. Integrate into OrdersService
3. Integrate into WithdrawalsService
4. Integrate into BalanceService
5. Integrate into ResolutionService
6. Create SSE streaming endpoint (Issue 6.2)
7. Create audit log listener (Issue 6.3)
