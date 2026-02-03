# Audit Logs Endpoint

## GET /audit/logs

Returns the audit trail for compliance and debugging. Requires `support` scope.

### Request

```http
GET /api/v1/audit/logs?limit=50&cursor=aud_abc123
Authorization: Bearer ohk_live_xxx
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 20 | Items per page (max 100) |
| `cursor` | string | - | Pagination cursor (aud_ id) |
| `resourceType` | string | - | Filter by resource type (e.g. Order, TopUp) |
| `resourceId` | string | - | Filter by resource ID |
| `action` | string | - | Filter by action: CREATE, UPDATE, DELETE |
| `userId` | string | - | Filter by user ID |
| `from` | string | - | ISO timestamp (occurredAt >= from) |
| `to` | string | - | ISO timestamp (occurredAt <= to) |

### Response

```json
{
  "data": [
    {
      "id": "aud_abc123",
      "occurredAt": "2024-01-20T12:00:00Z",
      "action": "UPDATE",
      "resourceType": "Order",
      "resourceId": "ord_xyz789",
      "payloadBefore": { "status": "FUNDS_RESERVED" },
      "payloadAfter": { "status": "ESCROW_FUNDED" },
      "actorType": "WEBHOOK",
      "actorId": "trustless_work",
      "result": "SUCCESS",
      "correlationId": "req_123abc"
    }
  ],
  "pagination": { "hasMore": true, "nextCursor": "aud_def456" }
}
```

### Notes

- This endpoint is read-only and requires **`support`** scope.
- Sensitive fields are redacted before storage (API keys, emails, etc.).
- Results are ordered by `occurredAt` descending (newest first).
