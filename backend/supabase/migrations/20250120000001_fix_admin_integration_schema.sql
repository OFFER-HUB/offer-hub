-- Migration: Fix admin integration schema issues
-- Addresses CodeRabbit security and functionality concerns

-- 1. Fix timestamp columns to use TIMESTAMPTZ
ALTER TABLE admin_api_keys 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_used_at TYPE TIMESTAMPTZ,
  ALTER COLUMN expires_at TYPE TIMESTAMPTZ;

ALTER TABLE webhooks 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_triggered_at TYPE TIMESTAMPTZ;

ALTER TABLE webhook_deliveries 
  ALTER COLUMN delivered_at TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE webhook_payloads 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE integration_providers 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

ALTER TABLE integration_instances 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_sync_at TYPE TIMESTAMPTZ;

ALTER TABLE integration_syncs 
  ALTER COLUMN started_at TYPE TIMESTAMPTZ,
  ALTER COLUMN completed_at TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_audit_logs 
  ALTER COLUMN performed_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_logs 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_system_health 
  ALTER COLUMN checked_at TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_rate_limits 
  ALTER COLUMN window_start TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_notifications 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN read_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_quotas 
  ALTER COLUMN reset_time TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

-- 2. Fix webhook_deliveries payload_id to be UUID with FK
ALTER TABLE webhook_deliveries 
  ALTER COLUMN payload_id TYPE UUID USING payload_id::UUID;

ALTER TABLE webhook_deliveries 
  ADD CONSTRAINT fk_webhook_deliveries_payload_id 
  FOREIGN KEY (payload_id) REFERENCES webhook_payloads(id) ON DELETE CASCADE;

-- 3. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_payload_id ON webhook_deliveries(payload_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_admin_api_rate_limits_api_key_window ON admin_api_rate_limits(api_key_id, window_type, window_start);
CREATE INDEX IF NOT EXISTS idx_admin_api_quotas_api_key_type ON admin_api_quotas(api_key_id, quota_type, reset_time);

-- 4. Add RLS policies for tables that were missing them
-- Webhook deliveries
CREATE POLICY "Admins can view webhook deliveries"
ON webhook_deliveries FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert webhook deliveries"
ON webhook_deliveries FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update webhook deliveries"
ON webhook_deliveries FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Webhook payloads
CREATE POLICY "Admins can view webhook payloads"
ON webhook_payloads FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert webhook payloads"
ON webhook_payloads FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Integration providers
CREATE POLICY "Admins can view integration providers"
ON integration_providers FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert integration providers"
ON integration_providers FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update integration providers"
ON integration_providers FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Integration syncs
CREATE POLICY "Admins can view integration syncs"
ON integration_syncs FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert integration syncs"
ON integration_syncs FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update integration syncs"
ON integration_syncs FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin API rate limits
CREATE POLICY "Admins can view admin API rate limits"
ON admin_api_rate_limits FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert admin API rate limits"
ON admin_api_rate_limits FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update admin API rate limits"
ON admin_api_rate_limits FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin API quotas
CREATE POLICY "Admins can view admin API quotas"
ON admin_api_quotas FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert admin API quotas"
ON admin_api_quotas FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update admin API quotas"
ON admin_api_quotas FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- 5. Add comments for security
COMMENT ON COLUMN webhooks.secret IS 'Webhook secret for signature verification (should be encrypted at rest)';
COMMENT ON COLUMN integration_instances.credentials IS 'Encrypted integration credentials (should be encrypted at rest)';
COMMENT ON TABLE admin_api_rate_limits IS 'Rate limiting counters for admin API keys';
COMMENT ON TABLE admin_api_quotas IS 'Usage quotas for admin API keys';
