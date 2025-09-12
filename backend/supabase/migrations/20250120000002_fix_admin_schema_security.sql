-- Migration: Fix admin integration schema security and data types
-- Addresses CodeRabbit security concerns

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
  ALTER COLUMN window_start TYPE TIMESTAMPTZ;

ALTER TABLE admin_notifications
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN read_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_quotas
  ALTER COLUMN reset_time TYPE TIMESTAMPTZ;

-- 2. Encrypt secrets using BYTEA (for pgcrypto)
-- Note: This requires pgcrypto extension to be enabled
-- ALTER EXTENSION pgcrypto;

-- Store webhook secrets encrypted
ALTER TABLE webhooks
  ALTER COLUMN secret TYPE BYTEA;

-- Store integration credentials encrypted
ALTER TABLE integration_instances
  ALTER COLUMN credentials TYPE BYTEA;

-- 3. Fix webhook_deliveries payload_id foreign key
ALTER TABLE webhook_deliveries
  ALTER COLUMN payload_id TYPE UUID;

-- Add the foreign key constraint
ALTER TABLE webhook_deliveries
  ADD CONSTRAINT fk_webhook_deliveries_payload_id
  FOREIGN KEY (payload_id) REFERENCES webhook_payloads(id) ON DELETE CASCADE;

-- 4. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_payload_id ON webhook_deliveries(payload_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_syncs_instance_id ON integration_syncs(instance_id);
CREATE INDEX IF NOT EXISTS idx_admin_api_rate_limits_api_key_window ON admin_api_rate_limits(api_key_id, window_type, window_start);
CREATE INDEX IF NOT EXISTS idx_admin_api_quotas_api_key_type_reset ON admin_api_quotas(api_key_id, quota_type, reset_time);

-- 5. Add missing RLS policies for all tables
-- Webhook deliveries
CREATE POLICY "Admins can view webhook deliveries"
ON webhook_deliveries FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage webhook deliveries"
ON webhook_deliveries FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Webhook payloads
CREATE POLICY "Admins can view webhook payloads"
ON webhook_payloads FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage webhook payloads"
ON webhook_payloads FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Integration providers
CREATE POLICY "Admins can view integration providers"
ON integration_providers FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage integration providers"
ON integration_providers FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Integration syncs
CREATE POLICY "Admins can view integration syncs"
ON integration_syncs FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage integration syncs"
ON integration_syncs FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin API rate limits
CREATE POLICY "Admins can view API rate limits"
ON admin_api_rate_limits FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage API rate limits"
ON admin_api_rate_limits FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin API quotas
CREATE POLICY "Admins can view API quotas"
ON admin_api_quotas FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage API quotas"
ON admin_api_quotas FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin notifications
CREATE POLICY "Admins can view notifications"
ON admin_notifications FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage notifications"
ON admin_notifications FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin API logs
CREATE POLICY "Admins can view API logs"
ON admin_api_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage API logs"
ON admin_api_logs FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin system health
CREATE POLICY "Admins can view system health"
ON admin_system_health FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage system health"
ON admin_system_health FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- 6. Add helper functions for encryption/decryption
-- Note: These require pgcrypto extension
CREATE OR REPLACE FUNCTION encrypt_webhook_secret(secret TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(secret, current_setting('app.encryption_key', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_webhook_secret(encrypted_secret BYTEA)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_secret, current_setting('app.encryption_key', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add secret preview columns (last 4 characters)
ALTER TABLE webhooks ADD COLUMN secret_last4 TEXT;
ALTER TABLE integration_instances ADD COLUMN credentials_preview TEXT;

-- 8. Add secret_set boolean flags
ALTER TABLE webhooks ADD COLUMN secret_set BOOLEAN DEFAULT false;
ALTER TABLE integration_instances ADD COLUMN credentials_set BOOLEAN DEFAULT false;
