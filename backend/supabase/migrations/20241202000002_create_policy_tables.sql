-- Migration: Create Policy Management Tables
-- Description: Creates tables for policy management, violations, and testing
-- Date: 2024-12-02

-- Create policy categories enum
CREATE TYPE policy_category AS ENUM (
    'user_behavior',
    'content_moderation',
    'transaction',
    'security',
    'compliance',
    'performance',
    'feature_access',
    'data_protection',
    'communication',
    'system'
);

-- Create policy types enum
CREATE TYPE policy_type AS ENUM (
    'prevention',
    'detection',
    'response',
    'enforcement',
    'validation',
    'notification',
    'escalation',
    'audit'
);

-- Create policy status enum
CREATE TYPE policy_status AS ENUM (
    'draft',
    'active',
    'inactive',
    'deprecated',
    'testing',
    'suspended'
);

-- Create policy priority enum
CREATE TYPE policy_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Create policy scope enum
CREATE TYPE policy_scope AS ENUM (
    'global',
    'user_group',
    'individual_user',
    'feature',
    'transaction_type',
    'content_type',
    'geographic',
    'time_based'
);

-- Create rule types enum
CREATE TYPE rule_type AS ENUM (
    'comparison',
    'pattern_match',
    'range_check',
    'existence_check',
    'custom_function',
    'api_call',
    'database_query'
);

-- Create rule operators enum
CREATE TYPE rule_operator AS ENUM (
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'greater_than_or_equal',
    'less_than_or_equal',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'regex_match',
    'in_list',
    'not_in_list',
    'is_null',
    'is_not_null',
    'is_empty',
    'is_not_empty'
);

-- Create condition types enum
CREATE TYPE condition_type AS ENUM (
    'user_attribute',
    'system_attribute',
    'time_based',
    'geographic',
    'device_based',
    'network_based',
    'content_based',
    'behavioral',
    'risk_score',
    'custom'
);

-- Create condition operators enum
CREATE TYPE condition_operator AS ENUM (
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'contains',
    'matches',
    'exists',
    'not_exists',
    'in_range',
    'out_of_range'
);

-- Create logical operators enum
CREATE TYPE logical_operator AS ENUM (
    'AND',
    'OR',
    'NOT'
);

-- Create action types enum
CREATE TYPE action_type AS ENUM (
    'allow',
    'deny',
    'block',
    'redirect',
    'notify',
    'log',
    'escalate',
    'quarantine',
    'rate_limit',
    'captcha',
    'mfa_required',
    'suspend',
    'ban',
    'flag',
    'auto_moderate',
    'custom_function',
    'webhook',
    'email',
    'sms',
    'push_notification'
);

-- Create dependency types enum
CREATE TYPE dependency_type AS ENUM (
    'prerequisite',
    'conflict',
    'override',
    'enhancement',
    'fallback'
);

-- Create dependency conditions enum
CREATE TYPE dependency_condition AS ENUM (
    'must_be_active',
    'must_be_inactive',
    'must_be_triggered_first',
    'must_not_conflict',
    'must_be_compatible'
);

-- Create violation types enum
CREATE TYPE violation_type AS ENUM (
    'rule_breach',
    'threshold_exceeded',
    'suspicious_behavior',
    'unauthorized_access',
    'content_violation',
    'transaction_anomaly',
    'security_threat',
    'compliance_breach'
);

-- Create violation severity enum
CREATE TYPE violation_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Create violation status enum
CREATE TYPE violation_status AS ENUM (
    'detected',
    'investigating',
    'escalated',
    'resolved',
    'false_positive',
    'ignored',
    'pending_review'
);

-- Create test status enum
CREATE TYPE test_status AS ENUM (
    'pending',
    'running',
    'passed',
    'failed',
    'error'
);

-- Create policy metrics enum
CREATE TYPE policy_metric AS ENUM (
    'violation_count',
    'violation_rate',
    'false_positive_rate',
    'detection_accuracy',
    'response_time',
    'action_success_rate',
    'user_impact_score',
    'system_performance_impact'
);

-- Create audit actions enum (reusing from configuration)
CREATE TYPE policy_audit_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'activate',
    'deactivate',
    'test',
    'violate',
    'resolve',
    'escalate'
);

-- Create performance metrics enum
CREATE TYPE policy_performance_metric AS ENUM (
    'evaluation_time',
    'memory_usage',
    'cpu_usage',
    'violation_detection_time',
    'action_execution_time',
    'false_positive_rate'
);

-- Create performance status enum (reusing from configuration)
CREATE TYPE policy_performance_status AS ENUM (
    'good',
    'warning',
    'critical'
);

-- Create error types enum
CREATE TYPE policy_error_type AS ENUM (
    'rule_evaluation_error',
    'action_execution_error',
    'dependency_error',
    'validation_error',
    'performance_error',
    'integration_error',
    'unknown_error'
);

-- Create validation status enum (reusing from configuration)
CREATE TYPE policy_validation_status AS ENUM (
    'valid',
    'invalid',
    'warning',
    'pending'
);

-- Create policies table
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category policy_category NOT NULL,
    type policy_type NOT NULL,
    status policy_status NOT NULL DEFAULT 'draft',
    priority policy_priority NOT NULL DEFAULT 'medium',
    version INTEGER NOT NULL DEFAULT 1,
    environment environment_type NOT NULL DEFAULT 'production',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_global BOOLEAN NOT NULL DEFAULT false,
    scope policy_scope NOT NULL DEFAULT 'global',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_until TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_policy_name CHECK (name ~ '^[a-zA-Z0-9\s._-]+$'),
    CONSTRAINT valid_version CHECK (version > 0),
    CONSTRAINT valid_effective_period CHECK (effective_until IS NULL OR effective_from IS NULL OR effective_until > effective_from)
);

-- Create policy rules table
CREATE TABLE policy_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type rule_type NOT NULL,
    operator rule_operator NOT NULL,
    value JSONB NOT NULL,
    field VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create policy conditions table
CREATE TABLE policy_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type condition_type NOT NULL,
    operator condition_operator NOT NULL,
    value JSONB NOT NULL,
    field VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    logical_operator logical_operator,
    parent_condition_id UUID REFERENCES policy_conditions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create policy actions table
CREATE TABLE policy_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type action_type NOT NULL,
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    execution_order INTEGER NOT NULL DEFAULT 1,
    fallback_action_id UUID REFERENCES policy_actions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create policy dependencies table
CREATE TABLE policy_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    depends_on_policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    type dependency_type NOT NULL,
    condition dependency_condition NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT no_self_dependency CHECK (policy_id != depends_on_policy_id)
);

-- Create policy violations table
CREATE TABLE policy_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    policy_name VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id UUID,
    violation_type violation_type NOT NULL,
    severity violation_severity NOT NULL,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    status violation_status NOT NULL DEFAULT 'detected',
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolution TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Create violation actions table
CREATE TABLE violation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    violation_id UUID NOT NULL REFERENCES policy_violations(id) ON DELETE CASCADE,
    type action_type NOT NULL,
    executed BOOLEAN NOT NULL DEFAULT false,
    executed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create policy tests table
CREATE TABLE policy_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    test_data JSONB NOT NULL,
    expected_result JSONB NOT NULL,
    actual_result JSONB,
    status test_status NOT NULL DEFAULT 'pending',
    executed_at TIMESTAMP WITH TIME ZONE,
    executed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create policy analytics table
CREATE TABLE policy_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    metric policy_metric NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Create policy templates table
CREATE TABLE policy_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category policy_category NOT NULL,
    type policy_type NOT NULL,
    template_data JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Constraints
    CONSTRAINT valid_template_name CHECK (name ~ '^[a-zA-Z0-9\s._-]+$')
);

-- Create policy audit logs table
CREATE TABLE policy_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    action policy_audit_action NOT NULL,
    details JSONB DEFAULT '{}',
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL
);

-- Create policy performance table
CREATE TABLE policy_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    metric policy_performance_metric NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    threshold DECIMAL(15,4),
    status policy_performance_status NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL
);

-- Create policy errors table
CREATE TABLE policy_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    error_type policy_error_type NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255)
);

-- Create policy validations table
CREATE TABLE policy_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    validation_type VARCHAR(50) NOT NULL,
    status policy_validation_status NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_type ON policies(type);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_priority ON policies(priority);
CREATE INDEX idx_policies_environment ON policies(environment);
CREATE INDEX idx_policies_active ON policies(is_active);
CREATE INDEX idx_policies_global ON policies(is_global);
CREATE INDEX idx_policies_created_at ON policies(created_at);
CREATE INDEX idx_policies_created_by ON policies(created_by);

CREATE INDEX idx_policy_rules_policy_id ON policy_rules(policy_id);
CREATE INDEX idx_policy_rules_type ON policy_rules(type);
CREATE INDEX idx_policy_rules_active ON policy_rules(is_active);

CREATE INDEX idx_policy_conditions_policy_id ON policy_conditions(policy_id);
CREATE INDEX idx_policy_conditions_type ON policy_conditions(type);
CREATE INDEX idx_policy_conditions_active ON policy_conditions(is_active);
CREATE INDEX idx_policy_conditions_parent ON policy_conditions(parent_condition_id);

CREATE INDEX idx_policy_actions_policy_id ON policy_actions(policy_id);
CREATE INDEX idx_policy_actions_type ON policy_actions(type);
CREATE INDEX idx_policy_actions_active ON policy_actions(is_active);
CREATE INDEX idx_policy_actions_order ON policy_actions(execution_order);

CREATE INDEX idx_policy_dependencies_policy_id ON policy_dependencies(policy_id);
CREATE INDEX idx_policy_dependencies_depends_on ON policy_dependencies(depends_on_policy_id);

CREATE INDEX idx_policy_violations_policy_id ON policy_violations(policy_id);
CREATE INDEX idx_policy_violations_type ON policy_violations(violation_type);
CREATE INDEX idx_policy_violations_severity ON policy_violations(severity);
CREATE INDEX idx_policy_violations_status ON policy_violations(status);
CREATE INDEX idx_policy_violations_detected_at ON policy_violations(detected_at);
CREATE INDEX idx_policy_violations_user_id ON policy_violations(user_id);

CREATE INDEX idx_violation_actions_violation_id ON violation_actions(violation_id);
CREATE INDEX idx_violation_actions_type ON violation_actions(type);
CREATE INDEX idx_violation_actions_executed ON violation_actions(executed);

CREATE INDEX idx_policy_tests_policy_id ON policy_tests(policy_id);
CREATE INDEX idx_policy_tests_status ON policy_tests(status);
CREATE INDEX idx_policy_tests_executed_at ON policy_tests(executed_at);

CREATE INDEX idx_policy_analytics_policy_id ON policy_analytics(policy_id);
CREATE INDEX idx_policy_analytics_metric ON policy_analytics(metric);
CREATE INDEX idx_policy_analytics_timestamp ON policy_analytics(timestamp);

CREATE INDEX idx_policy_templates_category ON policy_templates(category);
CREATE INDEX idx_policy_templates_type ON policy_templates(type);
CREATE INDEX idx_policy_templates_public ON policy_templates(is_public);

CREATE INDEX idx_policy_audit_logs_policy_id ON policy_audit_logs(policy_id);
CREATE INDEX idx_policy_audit_logs_action ON policy_audit_logs(action);
CREATE INDEX idx_policy_audit_logs_user_id ON policy_audit_logs(user_id);
CREATE INDEX idx_policy_audit_logs_timestamp ON policy_audit_logs(timestamp);

CREATE INDEX idx_policy_performance_policy_id ON policy_performance(policy_id);
CREATE INDEX idx_policy_performance_metric ON policy_performance(metric);
CREATE INDEX idx_policy_performance_timestamp ON policy_performance(timestamp);
CREATE INDEX idx_policy_performance_status ON policy_performance(status);

CREATE INDEX idx_policy_errors_policy_id ON policy_errors(policy_id);
CREATE INDEX idx_policy_errors_type ON policy_errors(error_type);
CREATE INDEX idx_policy_errors_timestamp ON policy_errors(timestamp);
CREATE INDEX idx_policy_errors_resolved ON policy_errors(resolved);

CREATE INDEX idx_policy_validations_policy_id ON policy_validations(policy_id);
CREATE INDEX idx_policy_validations_type ON policy_validations(validation_type);
CREATE INDEX idx_policy_validations_status ON policy_validations(status);
CREATE INDEX idx_policy_validations_timestamp ON policy_validations(timestamp);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_policies_updated_at 
    BEFORE UPDATE ON policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_rules_updated_at 
    BEFORE UPDATE ON policy_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_conditions_updated_at 
    BEFORE UPDATE ON policy_conditions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_actions_updated_at 
    BEFORE UPDATE ON policy_actions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_templates_updated_at 
    BEFORE UPDATE ON policy_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment policy version
CREATE OR REPLACE FUNCTION increment_policy_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_policy_version_trigger
    BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION increment_policy_version();

-- Create function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE policy_templates 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable RLS on all tables
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_validations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all policies" ON policies
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Admins can insert policies" ON policies
    FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can update policies" ON policies
    FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Admins can delete policies" ON policies
    FOR DELETE USING (auth.role() = 'admin');

-- Similar policies for other tables (abbreviated for brevity)

-- Insert some default policies
INSERT INTO policies (
    name, description, category, type, priority, environment, created_by, updated_by
) VALUES 
(
    'User Registration Policy',
    'Policy for user registration validation and approval',
    'user_behavior',
    'validation',
    'high',
    'production',
    'system',
    'system'
),
(
    'Content Moderation Policy',
    'Policy for automatic content moderation and filtering',
    'content_moderation',
    'detection',
    'critical',
    'production',
    'system',
    'system'
),
(
    'Transaction Security Policy',
    'Policy for transaction security and fraud detection',
    'transaction',
    'security',
    'critical',
    'production',
    'system',
    'system'
),
(
    'Password Security Policy',
    'Policy for password strength and security requirements',
    'security',
    'enforcement',
    'high',
    'production',
    'system',
    'system'
);

-- Create a view for policy statistics
CREATE VIEW policy_statistics AS
SELECT 
    category,
    type,
    status,
    environment,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN is_active THEN 1 END) as active_policies,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_policies,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_policies
FROM policies
GROUP BY category, type, status, environment;

-- Create a view for policy health
CREATE VIEW policy_health AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.status,
    p.is_active,
    COUNT(pv.id) as violation_count,
    COUNT(pe.id) as error_count,
    CASE 
        WHEN COUNT(pe.id) = 0 AND p.status = 'active' THEN 'healthy'
        WHEN COUNT(pe.id) > 0 OR p.status != 'active' THEN 'critical'
        ELSE 'warning'
    END as health_status
FROM policies p
LEFT JOIN policy_violations pv ON p.id = pv.policy_id AND pv.status = 'detected'
LEFT JOIN policy_errors pe ON p.id = pe.policy_id AND pe.resolved = false
GROUP BY p.id, p.name, p.category, p.status, p.is_active;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
