# Webhooks Endpoints

## POST /webhooks/airtm

Receives Airtm events and updates top-ups, withdrawals, and balances.

### Request

```http
POST /api/v1/webhooks/airtm
Content-Type: application/json
Airtm-Signature: {signature}
```

### Behavior

- Verify the HMAC signature.
- Deduplicate using `(provider=airtm, event_id)`.
- Respond `200 OK` for duplicates without reprocessing.

---

## POST /webhooks/trustless-work

Receives Trustless Work events and updates escrow state.

### Request

```http
POST /api/v1/webhooks/trustless-work
Content-Type: application/json
TW-Signature: {signature}
```

### Behavior

- Verify the HMAC signature.
- Deduplicate using `(provider=trustless_work, event_id)`.
- Respond `200 OK` for duplicates without reprocessing.
