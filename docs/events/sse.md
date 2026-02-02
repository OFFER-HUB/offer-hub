# Server-Sent Events (SSE) Guide

The OFFER-HUB Orchestrator provides a real-time event stream via Server-Sent Events (SSE). This allows clients (marketplaces, dashboards, etc.) to receive updates about users, orders, balances, and system events in real-time without polling.

## Endpoint

**GET** `/api/v1/events`

### Authentication & Authorization

The endpoint is protected by:
1.  **ApiKeyGuard**: Requires a valid API key passed in the `Authorization` header as `Bearer <key>`.
2.  **ScopeGuard**: Requires the `events.read` scope.

#### Master Scope (`*`)
Administrative API keys can be granted the master scope `*`. This scope allows bypassing individual scope checks for all endpoints, including the event stream.

## Connection Parameters

You can filter the event stream using query parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `types` | `string[]` | comma-separated list of event types (e.g., `user.created,order.created`) |
| `resourceTypes` | `string[]` | comma-separated list of aggregate types (e.g., `User,Order,Balance`) |

### Reconnection Support (Event Replay)

The SSE service persists the last 1000 events in a Redis Sorted Set for 1 hour. If a client disconnects, they can recover missed events by passing the standard `Last-Event-ID` header.

**Header**: `Last-Event-ID: <timestamp_or_eventId>`

The system will replay events that occurred after the specified timestamp.

## Event Format

Clients receive events in the standard SSE format:

```text
id: 2026-02-02T20:43:52.832Z
event: user.created
data: {
  "eventId": "evt_n_8yumeOFwqPnSbhvemqJ",
  "occurredAt": "2026-02-02T20:43:52.832Z",
  "eventType": "user.created",
  "aggregateId": "usr_jF5tBLUBhuSqdkU4Ryct8B1Oj4va4RiV",
  "aggregateType": "User",
  "payload": {
    "userId": "usr_jF5tBLUBhuSqdkU4Ryct8B1Oj4va4RiV",
    "externalUserId": "test-viva-05",
    "email": "viva5@test.com",
    "status": "ACTIVE"
  },
  "metadata": {
    "userId": "usr_jF5tBLUBhuSqdkU4Ryct8B1Oj4va4RiV"
  }
}
```

## Internal Architecture

1.  **EventBusService**: Services emit domain events here.
2.  **EventEmitter2**: Internal NestJS mechanism that propagates events within the process.
3.  **SseService**: Listens to all domain events (`**`), broadcasts them to active connections, and persists them to Redis.
4.  **EventsController**: Exposes the `@Sse()` endpoint and handles the handshake and filtering.

### Reliability & DI

The services use explicit `@Inject()` decorators for `EventBusService`, `RedisService`, and `EventEmitter2` to ensure stability across different execution environments (like `tsx watch`).

## Examples

### 1. Listen to all events (Admin)
```bash
curl -N -H "Authorization: Bearer <ADMIN_KEY>" \
     "http://localhost:4000/api/v1/events"
```

### 2. Listen only to User events
```bash
curl -N -H "Authorization: Bearer <KEY>" \
     "http://localhost:4000/api/v1/events?resourceTypes=User"
```

### 3. Reconnect and replay missed events
```bash
curl -N -H "Authorization: Bearer <KEY>" \
     -H "Last-Event-ID: 2026-02-02T14:40:00Z" \
     "http://localhost:4000/api/v1/events"
```
