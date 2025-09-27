-- Migration: Create Configuration Management Tables
-- Description: Creates tables for system configuration, policies, and feature toggles
-- Date: 2024-12-02

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create configuration categories enum
CREATE TYPE configuration_category AS ENUM (
    'general',
    'security', 
    'payments',
    'features',
    'notifications',
    'ui',
    'performance',
    'integration',
    'analytics',
    'maintenance'
);

-- Create configuration data types enum
CREATE TYPE configuration_data_type AS ENUM (
    'string',
    'number',
    'boolean',
    'json',
    'array',
    'object'
);

-- Create environment enum
CREATE TYPE environment_type AS ENUM (
    'development',
    'staging',
    'production',
    'testing'
);

-- Create validation types enum
CREATE TYPE validation_type AS ENUM (
    'required',
    'minLength',
    'maxLength',
    'minValue',
    'maxValue',
    'pattern',
    'email',
    'url',
    'uuid',
    'json',
    'array',
    'object',
    'custom'
);

-- Create dependency conditions enum
CREATE TYPE dependency_condition AS ENUM (
    'equals',
    'notEquals',
    'greaterThan',
    'lessThan',
    'contains',
    'exists',
    'notExists'
);

-- Create change types enum
CREATE TYPE change_type AS ENUM (
    'create',
    'update',
    'delete',
    'rollback'
);

-- Create change status enum
CREATE TYPE change_status AS ENUM (
    'pending',
    'approved',
    'applied',
    'failed',
    'rolled_back'
);

-- Create change impact enum
CREATE TYPE change_impact AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Create audit actions enum
CREATE TYPE audit_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'export',
    'import',
    'backup',
    'restore',
    'validate',
    'rollback'
);

-- Create validation status enum
CREATE TYPE validation_status AS ENUM (
    'valid',
    'invalid',
    'warning',
    'pending'
);

-- Create performance status enum
CREATE TYPE performance_status AS ENUM (
    'good',
    'warning',
    'critical'
);

-- Create error types enum
CREATE TYPE error_type AS ENUM (
    'validation_error',
    'dependency_error',
    'performance_error',
    'security_error',
    'integration_error',
    'unknown_error'
);

-- Create system configurations table
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category configuration_category NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT NOT NULL,
    data_type configuration_data_type NOT NULL,
    is_editable BOOLEAN NOT NULL DEFAULT true,
    is_required BOOLEAN NOT NULL DEFAULT false,
    default_value JSONB,
    environment environment_type NOT NULL DEFAULT 'production',
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT unique_config_key_env UNIQUE (key, environment),
    CONSTRAINT valid_key_format CHECK (key ~ '^[a-zA-Z0-9._-]+$'),
    CONSTRAINT valid_version CHECK (version > 0)
);

-- Create validation rules table
CREATE TABLE validation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    type validation_type NOT NULL,
    value JSONB,
    message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create configuration dependencies table
CREATE TABLE configuration_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    depends_on_configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    condition dependency_condition NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT no_self_dependency CHECK (configuration_id != depends_on_configuration_id)
);

-- Create configuration changes table
CREATE TABLE configuration_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    previous_value JSONB,
    new_value JSONB NOT NULL,
    change_type change_type NOT NULL,
    reason TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    status change_status NOT NULL DEFAULT 'pending',
    impact change_impact NOT NULL DEFAULT 'low',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    rollback_reason TEXT
);

-- Create configuration history table
CREATE TABLE configuration_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    change_id UUID NOT NULL REFERENCES configuration_changes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    value JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Create configuration analytics table
CREATE TABLE configuration_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Create configuration templates table
CREATE TABLE configuration_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category configuration_category NOT NULL,
    configurations JSONB NOT NULL,
    environment environment_type NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Constraints
    CONSTRAINT valid_template_name CHECK (name ~ '^[a-zA-Z0-9\s._-]+$')
);

-- Create configuration backups table
CREATE TABLE configuration_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    environment environment_type NOT NULL,
    configurations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    
    -- Constraints
    CONSTRAINT valid_backup_name CHECK (name ~ '^[a-zA-Z0-9\s._-]+$')
);

-- Create configuration audit logs table
CREATE TABLE configuration_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    action audit_action NOT NULL,
    details JSONB DEFAULT '{}',
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL
);

-- Create configuration performance table
CREATE TABLE configuration_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    threshold DECIMAL(15,4),
    status performance_status NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL
);

-- Create configuration errors table
CREATE TABLE configuration_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    error_type error_type NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255)
);

-- Create configuration validations table
CREATE TABLE configuration_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES system_configurations(id) ON DELETE CASCADE,
    validation_rule_id UUID NOT NULL REFERENCES validation_rules(id) ON DELETE CASCADE,
    status validation_status NOT NULL,
    message TEXT NOT NULL,
    value JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_system_configurations_category ON system_configurations(category);
CREATE INDEX idx_system_configurations_environment ON system_configurations(environment);
CREATE INDEX idx_system_configurations_key ON system_configurations(key);
CREATE INDEX idx_system_configurations_updated_at ON system_configurations(updated_at);
CREATE INDEX idx_system_configurations_updated_by ON system_configurations(updated_by);

CREATE INDEX idx_validation_rules_configuration_id ON validation_rules(configuration_id);
CREATE INDEX idx_validation_rules_type ON validation_rules(type);
CREATE INDEX idx_validation_rules_active ON validation_rules(is_active);

CREATE INDEX idx_configuration_dependencies_config_id ON configuration_dependencies(configuration_id);
CREATE INDEX idx_configuration_dependencies_depends_on ON configuration_dependencies(depends_on_configuration_id);

CREATE INDEX idx_configuration_changes_config_id ON configuration_changes(configuration_id);
CREATE INDEX idx_configuration_changes_status ON configuration_changes(status);
CREATE INDEX idx_configuration_changes_created_at ON configuration_changes(created_at);
CREATE INDEX idx_configuration_changes_created_by ON configuration_changes(created_by);

CREATE INDEX idx_configuration_history_config_id ON configuration_history(configuration_id);
CREATE INDEX idx_configuration_history_change_id ON configuration_history(change_id);
CREATE INDEX idx_configuration_history_version ON configuration_history(version);

CREATE INDEX idx_configuration_analytics_config_id ON configuration_analytics(configuration_id);
CREATE INDEX idx_configuration_analytics_metric ON configuration_analytics(metric);
CREATE INDEX idx_configuration_analytics_timestamp ON configuration_analytics(timestamp);

CREATE INDEX idx_configuration_templates_category ON configuration_templates(category);
CREATE INDEX idx_configuration_templates_environment ON configuration_templates(environment);
CREATE INDEX idx_configuration_templates_default ON configuration_templates(is_default);

CREATE INDEX idx_configuration_backups_environment ON configuration_backups(environment);
CREATE INDEX idx_configuration_backups_created_at ON configuration_backups(created_at);

CREATE INDEX idx_configuration_audit_logs_config_id ON configuration_audit_logs(configuration_id);
CREATE INDEX idx_configuration_audit_logs_action ON configuration_audit_logs(action);
CREATE INDEX idx_configuration_audit_logs_user_id ON configuration_audit_logs(user_id);
CREATE INDEX idx_configuration_audit_logs_timestamp ON configuration_audit_logs(timestamp);

CREATE INDEX idx_configuration_performance_config_id ON configuration_performance(configuration_id);
CREATE INDEX idx_configuration_performance_metric ON configuration_performance(metric);
CREATE INDEX idx_configuration_performance_timestamp ON configuration_performance(timestamp);
CREATE INDEX idx_configuration_performance_status ON configuration_performance(status);

CREATE INDEX idx_configuration_errors_config_id ON configuration_errors(configuration_id);
CREATE INDEX idx_configuration_errors_type ON configuration_errors(error_type);
CREATE INDEX idx_configuration_errors_timestamp ON configuration_errors(timestamp);
CREATE INDEX idx_configuration_errors_resolved ON configuration_errors(resolved);

CREATE INDEX idx_configuration_validations_config_id ON configuration_validations(configuration_id);
CREATE INDEX idx_configuration_validations_rule_id ON configuration_validations(validation_rule_id);
CREATE INDEX idx_configuration_validations_status ON configuration_validations(status);
CREATE INDEX idx_configuration_validations_timestamp ON configuration_validations(timestamp);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_configurations_updated_at 
    BEFORE UPDATE ON system_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at 
    BEFORE UPDATE ON validation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuration_templates_updated_at 
    BEFORE UPDATE ON configuration_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment version on configuration updates
CREATE OR REPLACE FUNCTION increment_configuration_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_configuration_version_trigger
    BEFORE UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION increment_configuration_version();

-- Create function to automatically create configuration history entries
CREATE OR REPLACE FUNCTION create_configuration_history_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO configuration_history (
            configuration_id,
            change_id,
            version,
            value,
            created_by
        ) VALUES (
            NEW.id,
            uuid_generate_v4(), -- This would be replaced with actual change_id from application
            OLD.version,
            OLD.value,
            NEW.updated_by
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_configuration_history_trigger
    AFTER UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION create_configuration_history_entry();

-- Create RLS (Row Level Security) policies
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_validations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (assuming admin role exists)
-- Note: These policies should be adjusted based on your actual authentication system

-- System configurations policies
CREATE POLICY "Admins can view all configurations" ON system_configurations
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Admins can insert configurations" ON system_configurations
    FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can update configurations" ON system_configurations
    FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Admins can delete configurations" ON system_configurations
    FOR DELETE USING (auth.role() = 'admin');

-- Similar policies for other tables (abbreviated for brevity)
-- In a real implementation, you would create policies for all tables

-- Insert some default configurations
INSERT INTO system_configurations (
    category, key, value, description, data_type, is_editable, is_required, environment, updated_by
) VALUES 
(
    'general', 
    'app.name', 
    '"Offer Hub"', 
    'Application name', 
    'string', 
    true, 
    true, 
    'production', 
    'system'
),
(
    'general', 
    'app.version', 
    '"1.0.0"', 
    'Application version', 
    'string', 
    true, 
    false, 
    'production', 
    'system'
),
(
    'security', 
    'password.min_length', 
    '8', 
    'Minimum password length', 
    'number', 
    true, 
    true, 
    'production', 
    'system'
),
(
    'security', 
    'session.timeout', 
    '3600', 
    'Session timeout in seconds', 
    'number', 
    true, 
    true, 
    'production', 
    'system'
),
(
    'features', 
    'enable_notifications', 
    'true', 
    'Enable notifications feature', 
    'boolean', 
    true, 
    false, 
    'production', 
    'system'
),
(
    'payments', 
    'default_currency', 
    '"USD"', 
    'Default currency for payments', 
    'string', 
    true, 
    true, 
    'production', 
    'system'
);

-- Insert some default validation rules
INSERT INTO validation_rules (configuration_id, type, value, message) 
SELECT 
    sc.id,
    'minLength',
    '3',
    'Key must be at least 3 characters long'
FROM system_configurations sc 
WHERE sc.key = 'app.name' AND sc.environment = 'production';

-- Create a view for configuration statistics
CREATE VIEW configuration_statistics AS
SELECT 
    category,
    environment,
    COUNT(*) as total_configurations,
    COUNT(CASE WHEN is_editable THEN 1 END) as editable_configurations,
    COUNT(CASE WHEN is_required THEN 1 END) as required_configurations,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_configurations
FROM system_configurations
GROUP BY category, environment;

-- Create a view for configuration health
CREATE VIEW configuration_health AS
SELECT 
    sc.id,
    sc.key,
    sc.category,
    sc.environment,
    sc.is_active,
    COUNT(ce.id) as error_count,
    COUNT(cp.id) as performance_issues,
    CASE 
        WHEN COUNT(ce.id) = 0 AND COUNT(CASE WHEN cp.status = 'critical' THEN 1 END) = 0 THEN 'healthy'
        WHEN COUNT(ce.id) > 0 OR COUNT(CASE WHEN cp.status = 'critical' THEN 1 END) > 0 THEN 'critical'
        ELSE 'warning'
    END as health_status
FROM system_configurations sc
LEFT JOIN configuration_errors ce ON sc.id = ce.configuration_id AND ce.resolved = false
LEFT JOIN configuration_performance cp ON sc.id = cp.configuration_id AND cp.status IN ('warning', 'critical')
GROUP BY sc.id, sc.key, sc.category, sc.environment, sc.is_active;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
