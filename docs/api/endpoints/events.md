# Events Endpoint

## GET /events

Streams events for real-time UI updates (SSE recommended).

### Request

```http
GET /api/v1/events?user_id=usr_123&cursor=evt_900
Authorization: Bearer ohk_live_xxx
Accept: text/event-stream
```

### Query Params

| Param | Type | Description |
|-------|------|-------------|
| `user_id` | string | Filter events for a user |
| `types` | string | Comma-separated list like `order.*`, `topup.*` |
| `cursor` | string | Last received `event.id` |

### SSE Format

```
id: evt_901
event: order.state_changed
data: {"id":"evt_901","type":"order.state_changed",...}
```

### Notes

- Send a short backlog when a cursor is provided.
- Support reconnection via `Last-Event-ID` or `cursor`.
- Include heartbeat events every 15 to 30 seconds (e.g. `event: ping`).
- Respect `read` scope and tenant authorization.
