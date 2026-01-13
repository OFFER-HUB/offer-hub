# Audit Logs Endpoint

## GET /audit/logs

Returns the audit trail for compliance and debugging.

### Request

```http
GET /api/v1/audit/logs?limit=50&cursor=aud_abc123
Authorization: Bearer ohk_live_xxx
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 50 | Items per page (max 100) |
| `cursor` | string | - | Pagination cursor |
| `resource_type` | string | - | Filter by resource type |
| `resource_id` | string | - | Filter by resource ID |
| `action` | string | - | Filter by action |
| `created_after` | string | - | ISO timestamp |
| `created_before` | string | - | ISO timestamp |

### Response

```json
{
  "data": [
    {
      "id": "aud_...",
      "occurred_at": "2026-01-12T12:00:00Z",
      "action": "ORDER_CREATE",
      "resource": { "type": "order", "id": "ord_..." },
      "result": "SUCCESS"
    }
  ],
  "pagination": { "has_more": true, "next_cursor": "aud_def456" }
}
```

### Notes

- This endpoint is read-only and requires `read` scope.
- Sensitive fields are redacted in the audit log.
