-- Migration: Create admin API keys table
CREATE TABLE admin_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  rate_limit JSONB NOT NULL DEFAULT '{"requests_per_minute": 60, "requests_per_hour": 1000, "requests_per_day": 10000, "burst_limit": 10}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Migration: Create webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_policy JSONB NOT NULL DEFAULT '{"max_retries": 3, "retry_delay_ms": 1000, "backoff_multiplier": 2, "max_delay_ms": 30000}',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_triggered_at TIMESTAMP,
  failure_count INTEGER DEFAULT 0
);

-- Migration: Create webhook deliveries table
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  payload_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Create webhook payloads table
CREATE TABLE webhook_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  data JSONB NOT NULL,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  attempt INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Create integration providers table
CREATE TABLE integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('webhook', 'api', 'sdk', 'plugin')),
  config_schema JSONB NOT NULL DEFAULT '{}',
  auth_method TEXT NOT NULL CHECK (auth_method IN ('api_key', 'oauth', 'jwt', 'basic')),
  supported_events JSONB NOT NULL DEFAULT '[]',
  documentation_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Create integration instances table
CREATE TABLE integration_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES integration_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  credentials TEXT NOT NULL, -- Encrypted credentials
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP
);

-- Migration: Create integration syncs table
CREATE TABLE integration_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES integration_instances(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'event_driven')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  records_processed INTEGER DEFAULT 0,
  records_synced INTEGER DEFAULT 0,
  error_message TEXT
);

-- Migration: Create admin audit logs table
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  changes JSONB,
  metadata JSONB
);

-- Migration: Create admin API logs table
CREATE TABLE admin_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES admin_api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);

-- Migration: Create admin system health table
CREATE TABLE admin_system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical')),
  components JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Create admin API rate limits table
CREATE TABLE admin_api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES admin_api_keys(id) ON DELETE CASCADE,
  window_start TIMESTAMP NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('minute', 'hour', 'day')),
  request_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(api_key_id, window_start, window_type)
);

-- Migration: Create admin notifications table
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('system_alert', 'security_alert', 'performance_alert', 'integration_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Migration: Create admin API quotas table
CREATE TABLE admin_api_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES admin_api_keys(id) ON DELETE CASCADE,
  quota_type TEXT NOT NULL CHECK (quota_type IN ('requests_per_minute', 'requests_per_hour', 'requests_per_day')),
  limit_value INTEGER NOT NULL,
  current_usage INTEGER DEFAULT 0,
  reset_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Create indexes for better performance
CREATE INDEX idx_admin_api_keys_key_hash ON admin_api_keys(key_hash);
CREATE INDEX idx_admin_api_keys_created_by ON admin_api_keys(created_by);
CREATE INDEX idx_admin_api_keys_is_active ON admin_api_keys(is_active);
CREATE INDEX idx_admin_api_keys_expires_at ON admin_api_keys(expires_at);

CREATE INDEX idx_webhooks_created_by ON webhooks(created_by);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN(events);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);

CREATE INDEX idx_webhook_payloads_event_type ON webhook_payloads(event_type);
CREATE INDEX idx_webhook_payloads_webhook_id ON webhook_payloads(webhook_id);
CREATE INDEX idx_webhook_payloads_timestamp ON webhook_payloads(timestamp);

CREATE INDEX idx_integration_providers_type ON integration_providers(type);
CREATE INDEX idx_integration_providers_is_active ON integration_providers(is_active);

CREATE INDEX idx_integration_instances_provider_id ON integration_instances(provider_id);
CREATE INDEX idx_integration_instances_created_by ON integration_instances(created_by);
CREATE INDEX idx_integration_instances_is_active ON integration_instances(is_active);

CREATE INDEX idx_integration_syncs_instance_id ON integration_syncs(instance_id);
CREATE INDEX idx_integration_syncs_status ON integration_syncs(status);
CREATE INDEX idx_integration_syncs_started_at ON integration_syncs(started_at);

CREATE INDEX idx_admin_audit_logs_performed_by ON admin_audit_logs(performed_by);
CREATE INDEX idx_admin_audit_logs_resource_type ON admin_audit_logs(resource_type);
CREATE INDEX idx_admin_audit_logs_performed_at ON admin_audit_logs(performed_at);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);

CREATE INDEX idx_admin_api_logs_api_key_id ON admin_api_logs(api_key_id);
CREATE INDEX idx_admin_api_logs_endpoint ON admin_api_logs(endpoint);
CREATE INDEX idx_admin_api_logs_timestamp ON admin_api_logs(timestamp);
CREATE INDEX idx_admin_api_logs_status_code ON admin_api_logs(status_code);

CREATE INDEX idx_admin_system_health_created_at ON admin_system_health(created_at);
CREATE INDEX idx_admin_system_health_status ON admin_system_health(status);

CREATE INDEX idx_admin_api_rate_limits_api_key_id ON admin_api_rate_limits(api_key_id);
CREATE INDEX idx_admin_api_rate_limits_window_start ON admin_api_rate_limits(window_start);
CREATE INDEX idx_admin_api_rate_limits_window_type ON admin_api_rate_limits(window_type);

CREATE INDEX idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX idx_admin_notifications_severity ON admin_notifications(severity);
CREATE INDEX idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX idx_admin_notifications_created_at ON admin_notifications(created_at);

CREATE INDEX idx_admin_api_quotas_api_key_id ON admin_api_quotas(api_key_id);
CREATE INDEX idx_admin_api_quotas_quota_type ON admin_api_quotas(quota_type);
CREATE INDEX idx_admin_api_quotas_reset_time ON admin_api_quotas(reset_time);

-- Migration: Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_api_keys_updated_at BEFORE UPDATE ON admin_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_providers_updated_at BEFORE UPDATE ON integration_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_instances_updated_at BEFORE UPDATE ON integration_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_api_quotas_updated_at BEFORE UPDATE ON admin_api_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration: Insert default integration providers
INSERT INTO integration_providers (id, name, type, config_schema, auth_method, supported_events, documentation_url, is_active) VALUES
  (gen_random_uuid(), 'Slack', 'webhook', '{"webhook_url": {"type": "string", "required": true, "description": "Slack webhook URL"}}', 'api_key', '["user.created", "project.completed", "dispute.opened"]', 'https://api.slack.com/messaging/webhooks', true),
  (gen_random_uuid(), 'Discord', 'webhook', '{"webhook_url": {"type": "string", "required": true, "description": "Discord webhook URL"}}', 'api_key', '["user.created", "project.completed", "dispute.opened"]', 'https://discord.com/developers/docs/resources/webhook', true),
  (gen_random_uuid(), 'Microsoft Teams', 'webhook', '{"webhook_url": {"type": "string", "required": true, "description": "Teams webhook URL"}}', 'api_key', '["user.created", "project.completed", "dispute.opened"]', 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors', true),
  (gen_random_uuid(), 'Zapier', 'api', '{"api_key": {"type": "string", "required": true, "description": "Zapier API key"}}', 'api_key', '["user.created", "user.updated", "project.created", "project.completed", "contract.created", "dispute.opened"]', 'https://zapier.com/developer', true),
  (gen_random_uuid(), 'IFTTT', 'webhook', '{"webhook_url": {"type": "string", "required": true, "description": "IFTTT webhook URL"}}', 'api_key', '["user.created", "project.completed", "dispute.opened"]', 'https://ifttt.com/maker_webhooks', true),
  (gen_random_uuid(), 'PagerDuty', 'api', '{"api_key": {"type": "string", "required": true, "description": "PagerDuty API key"}, "service_key": {"type": "string", "required": true, "description": "PagerDuty service key"}}', 'api_key', '["system.error", "security_alert", "performance_alert"]', 'https://developer.pagerduty.com', true),
  (gen_random_uuid(), 'DataDog', 'api', '{"api_key": {"type": "string", "required": true, "description": "DataDog API key"}, "app_key": {"type": "string", "required": true, "description": "DataDog application key"}}', 'api_key', '["system.error", "performance_alert", "integration_alert"]', 'https://docs.datadoghq.com/api', true),
  (gen_random_uuid(), 'New Relic', 'api', '{"api_key": {"type": "string", "required": true, "description": "New Relic API key"}}', 'api_key', '["system.error", "performance_alert", "integration_alert"]', 'https://docs.newrelic.com/docs/apis', true);

-- Migration: Create RLS policies for admin tables
ALTER TABLE admin_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_api_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_api_keys
CREATE POLICY "Admins can view all API keys" ON admin_api_keys FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can create API keys" ON admin_api_keys FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update API keys" ON admin_api_keys FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete API keys" ON admin_api_keys FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for webhooks
CREATE POLICY "Admins can view all webhooks" ON webhooks FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can create webhooks" ON webhooks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update webhooks" ON webhooks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete webhooks" ON webhooks FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for integration_instances
CREATE POLICY "Admins can view all integration instances" ON integration_instances FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can create integration instances" ON integration_instances FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update integration instances" ON integration_instances FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete integration instances" ON integration_instances FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for admin_audit_logs
CREATE POLICY "Admins can view all audit logs" ON admin_audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for admin_api_logs
CREATE POLICY "Admins can view all API logs" ON admin_api_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for admin_system_health
CREATE POLICY "Admins can view system health" ON admin_system_health FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can view all notifications" ON admin_notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update notifications" ON admin_notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
