-- Migration: Create Feature Toggle Tables
-- Description: Creates tables for feature toggle management, evaluation, and analytics
-- Date: 2024-12-02

-- Create feature categories enum
CREATE TYPE feature_category AS ENUM (
    'ui',
    'backend',
    'api',
    'payment',
    'notification',
    'analytics',
    'security',
    'performance',
    'integration',
    'experimental',
    'beta',
    'maintenance'
);

-- Create feature types enum
CREATE TYPE feature_type AS ENUM (
    'boolean',
    'percentage',
    'gradual',
    'canary',
    'blue_green',
    'a_b_test',
    'multivariate',
    'experimental',
    'kill_switch'
);

-- Create feature status enum
CREATE TYPE feature_status AS ENUM (
    'draft',
    'development',
    'testing',
    'staging',
    'production',
    'deprecated',
    'archived'
);

-- Create rollout strategies enum
CREATE TYPE rollout_strategy AS ENUM (
    'immediate',
    'gradual',
    'canary',
    'blue_green',
    'percentage',
    'user_based',
    'time_based',
    'geographic',
    'device_based'
);

-- Create audience types enum
CREATE TYPE audience_type AS ENUM (
    'all_users',
    'user_segment',
    'user_group',
    'user_role',
    'beta_users',
    'premium_users',
    'new_users',
    'returning_users',
    'geographic',
    'device_based',
    'custom'
);

-- Create feature condition types enum
CREATE TYPE feature_condition_type AS ENUM (
    'user_attribute',
    'user_group',
    'user_role',
    'user_segment',
    'geographic',
    'device_type',
    'browser',
    'operating_system',
    'time_based',
    'date_range',
    'custom_attribute',
    'experiment_group',
    'cohort',
    'risk_score'
);

-- Create feature condition operators enum
CREATE TYPE feature_condition_operator AS ENUM (
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'in_list',
    'not_in_list',
    'regex_match',
    'exists',
    'not_exists',
    'is_null',
    'is_not_null'
);

-- Create feature dependency types enum
CREATE TYPE feature_dependency_type AS ENUM (
    'prerequisite',
    'conflict',
    'enhancement',
    'override',
    'fallback',
    'mutual_exclusion'
);

-- Create feature dependency conditions enum
CREATE TYPE feature_dependency_condition AS ENUM (
    'must_be_active',
    'must_be_inactive',
    'must_be_enabled',
    'must_be_disabled',
    'must_be_compatible',
    'must_not_conflict'
);

-- Create change types enum for feature toggles
CREATE TYPE feature_change_type AS ENUM (
    'created',
    'updated',
    'activated',
    'deactivated',
    'rollout_changed',
    'audience_changed',
    'condition_added',
    'condition_removed',
    'dependency_added',
    'dependency_removed',
    'deleted'
);

-- Create feature metrics enum
CREATE TYPE feature_metric AS ENUM (
    'adoption_rate',
    'usage_frequency',
    'user_satisfaction',
    'performance_impact',
    'error_rate',
    'conversion_rate',
    'retention_rate',
    'revenue_impact',
    'system_load',
    'memory_usage',
    'response_time',
    'bounce_rate',
    'engagement_rate',
    'feature_completion_rate'
);

-- Create metric status enum
CREATE TYPE metric_status AS ENUM (
    'good',
    'warning',
    'critical',
    'unknown'
);

-- Create feature toggle audit actions enum
CREATE TYPE feature_audit_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'activate',
    'deactivate',
    'evaluate',
    'rollout',
    'rollback',
    'export',
    'import'
);

-- Create feature toggle performance metrics enum
CREATE TYPE feature_performance_metric AS ENUM (
    'evaluation_time',
    'memory_usage',
    'cpu_usage',
    'cache_hit_rate',
    'api_response_time',
    'database_query_time',
    'error_rate'
);

-- Create feature toggle error types enum
CREATE TYPE feature_error_type AS ENUM (
    'evaluation_error',
    'condition_error',
    'dependency_error',
    'validation_error',
    'performance_error',
    'integration_error',
    'unknown_error'
);

-- Create feature toggle validation types enum
CREATE TYPE feature_validation_type AS ENUM (
    'condition_validation',
    'dependency_validation',
    'audience_validation',
    'rollout_validation',
    'conflict_validation',
    'performance_validation',
    'security_validation'
);

-- Create feature toggles table
CREATE TABLE feature_toggles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category feature_category NOT NULL,
    type feature_type NOT NULL,
    status feature_status NOT NULL DEFAULT 'draft',
    environment environment_type NOT NULL DEFAULT 'production',
    is_active BOOLEAN NOT NULL DEFAULT false,
    rollout_strategy rollout_strategy NOT NULL DEFAULT 'immediate',
    rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_audience_id UUID,
    metadata JSONB DEFAULT '{}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_until TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Constraints
    CONSTRAINT unique_feature_key_env UNIQUE (key, environment),
    CONSTRAINT valid_feature_key CHECK (key ~ '^[a-zA-Z0-9._-]+$'),
    CONSTRAINT valid_feature_name CHECK (name ~ '^[a-zA-Z0-9\s._-]+$'),
    CONSTRAINT valid_version CHECK (version > 0),
    CONSTRAINT valid_effective_period CHECK (effective_until IS NULL OR effective_from IS NULL OR effective_until > effective_from)
);

-- Create target audiences table
CREATE TABLE target_audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type audience_type NOT NULL,
    criteria JSONB NOT NULL DEFAULT '[]',
    size INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_audience_name CHECK (name ~ '^[a-zA-Z0-9\s._-]+$')
);

-- Create feature conditions table
CREATE TABLE feature_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type feature_condition_type NOT NULL,
    operator feature_condition_operator NOT NULL,
    value JSONB NOT NULL,
    field VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0 AND weight <= 100),
    logical_operator logical_operator,
    parent_condition_id UUID REFERENCES feature_conditions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create feature dependencies table
CREATE TABLE feature_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    depends_on_feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    type feature_dependency_type NOT NULL,
    condition feature_dependency_condition NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT no_self_dependency CHECK (feature_toggle_id != depends_on_feature_toggle_id)
);

-- Create feature evaluations table
CREATE TABLE feature_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    session_id UUID,
    context JSONB NOT NULL DEFAULT '{}',
    result JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Create feature toggle history table
CREATE TABLE feature_toggle_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    change_type feature_change_type NOT NULL,
    previous_value JSONB,
    new_value JSONB NOT NULL,
    reason TEXT,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Create feature toggle analytics table
CREATE TABLE feature_toggle_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    breakdown JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create feature metrics table
CREATE TABLE feature_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    metric feature_metric NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    baseline DECIMAL(15,4),
    target DECIMAL(15,4),
    threshold DECIMAL(15,4),
    status metric_status NOT NULL DEFAULT 'unknown',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Create feature toggle templates table
CREATE TABLE feature_toggle_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category feature_category NOT NULL,
    type feature_type NOT NULL,
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

-- Create feature toggle audit logs table
CREATE TABLE feature_toggle_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    action feature_audit_action NOT NULL,
    details JSONB DEFAULT '{}',
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL
);

-- Create feature toggle performance table
CREATE TABLE feature_toggle_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    metric feature_performance_metric NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    threshold DECIMAL(15,4),
    status performance_status NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL
);

-- Create feature toggle errors table
CREATE TABLE feature_toggle_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    error_type feature_error_type NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    environment environment_type NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255)
);

-- Create feature toggle validations table
CREATE TABLE feature_toggle_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    validation_type feature_validation_type NOT NULL,
    status validation_status NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint for target audience
ALTER TABLE feature_toggles 
ADD CONSTRAINT fk_feature_toggles_target_audience 
FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_feature_toggles_key ON feature_toggles(key);
CREATE INDEX idx_feature_toggles_category ON feature_toggles(category);
CREATE INDEX idx_feature_toggles_type ON feature_toggles(type);
CREATE INDEX idx_feature_toggles_status ON feature_toggles(status);
CREATE INDEX idx_feature_toggles_environment ON feature_toggles(environment);
CREATE INDEX idx_feature_toggles_active ON feature_toggles(is_active);
CREATE INDEX idx_feature_toggles_rollout_strategy ON feature_toggles(rollout_strategy);
CREATE INDEX idx_feature_toggles_created_at ON feature_toggles(created_at);
CREATE INDEX idx_feature_toggles_created_by ON feature_toggles(created_by);

CREATE INDEX idx_target_audiences_type ON target_audiences(type);
CREATE INDEX idx_target_audiences_active ON target_audiences(is_active);
CREATE INDEX idx_target_audiences_created_by ON target_audiences(created_by);

CREATE INDEX idx_feature_conditions_feature_id ON feature_conditions(feature_toggle_id);
CREATE INDEX idx_feature_conditions_type ON feature_conditions(type);
CREATE INDEX idx_feature_conditions_active ON feature_conditions(is_active);
CREATE INDEX idx_feature_conditions_parent ON feature_conditions(parent_condition_id);

CREATE INDEX idx_feature_dependencies_feature_id ON feature_dependencies(feature_toggle_id);
CREATE INDEX idx_feature_dependencies_depends_on ON feature_dependencies(depends_on_feature_toggle_id);

CREATE INDEX idx_feature_evaluations_feature_id ON feature_evaluations(feature_toggle_id);
CREATE INDEX idx_feature_evaluations_user_id ON feature_evaluations(user_id);
CREATE INDEX idx_feature_evaluations_timestamp ON feature_evaluations(timestamp);
CREATE INDEX idx_feature_evaluations_environment ON feature_evaluations(environment);

CREATE INDEX idx_feature_toggle_history_feature_id ON feature_toggle_history(feature_toggle_id);
CREATE INDEX idx_feature_toggle_history_change_type ON feature_toggle_history(change_type);
CREATE INDEX idx_feature_toggle_history_changed_at ON feature_toggle_history(changed_at);

CREATE INDEX idx_feature_toggle_analytics_feature_id ON feature_toggle_analytics(feature_toggle_id);
CREATE INDEX idx_feature_toggle_analytics_metric ON feature_toggle_analytics(metric);
CREATE INDEX idx_feature_toggle_analytics_timestamp ON feature_toggle_analytics(timestamp);

CREATE INDEX idx_feature_metrics_feature_id ON feature_metrics(feature_toggle_id);
CREATE INDEX idx_feature_metrics_metric ON feature_metrics(metric);
CREATE INDEX idx_feature_metrics_timestamp ON feature_metrics(timestamp);
CREATE INDEX idx_feature_metrics_status ON feature_metrics(status);

CREATE INDEX idx_feature_toggle_templates_category ON feature_toggle_templates(category);
CREATE INDEX idx_feature_toggle_templates_type ON feature_toggle_templates(type);
CREATE INDEX idx_feature_toggle_templates_public ON feature_toggle_templates(is_public);

CREATE INDEX idx_feature_toggle_audit_logs_feature_id ON feature_toggle_audit_logs(feature_toggle_id);
CREATE INDEX idx_feature_toggle_audit_logs_action ON feature_toggle_audit_logs(action);
CREATE INDEX idx_feature_toggle_audit_logs_user_id ON feature_toggle_audit_logs(user_id);
CREATE INDEX idx_feature_toggle_audit_logs_timestamp ON feature_toggle_audit_logs(timestamp);

CREATE INDEX idx_feature_toggle_performance_feature_id ON feature_toggle_performance(feature_toggle_id);
CREATE INDEX idx_feature_toggle_performance_metric ON feature_toggle_performance(metric);
CREATE INDEX idx_feature_toggle_performance_timestamp ON feature_toggle_performance(timestamp);
CREATE INDEX idx_feature_toggle_performance_status ON feature_toggle_performance(status);

CREATE INDEX idx_feature_toggle_errors_feature_id ON feature_toggle_errors(feature_toggle_id);
CREATE INDEX idx_feature_toggle_errors_type ON feature_toggle_errors(error_type);
CREATE INDEX idx_feature_toggle_errors_timestamp ON feature_toggle_errors(timestamp);
CREATE INDEX idx_feature_toggle_errors_resolved ON feature_toggle_errors(resolved);

CREATE INDEX idx_feature_toggle_validations_feature_id ON feature_toggle_validations(feature_toggle_id);
CREATE INDEX idx_feature_toggle_validations_type ON feature_toggle_validations(validation_type);
CREATE INDEX idx_feature_toggle_validations_status ON feature_toggle_validations(status);
CREATE INDEX idx_feature_toggle_validations_timestamp ON feature_toggle_validations(timestamp);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_feature_toggles_updated_at 
    BEFORE UPDATE ON feature_toggles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_audiences_updated_at 
    BEFORE UPDATE ON target_audiences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_conditions_updated_at 
    BEFORE UPDATE ON feature_conditions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_toggle_templates_updated_at 
    BEFORE UPDATE ON feature_toggle_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment feature toggle version
CREATE OR REPLACE FUNCTION increment_feature_toggle_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_feature_toggle_version_trigger
    BEFORE UPDATE ON feature_toggles
    FOR EACH ROW EXECUTE FUNCTION increment_feature_toggle_version();

-- Create function to automatically create feature toggle history entries
CREATE OR REPLACE FUNCTION create_feature_toggle_history_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO feature_toggle_history (
            feature_toggle_id,
            change_type,
            previous_value,
            new_value,
            changed_by,
            environment
        ) VALUES (
            NEW.id,
            'updated',
            row_to_json(OLD),
            row_to_json(NEW),
            NEW.updated_by,
            NEW.environment
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO feature_toggle_history (
            feature_toggle_id,
            change_type,
            new_value,
            changed_by,
            environment
        ) VALUES (
            NEW.id,
            'created',
            row_to_json(NEW),
            NEW.created_by,
            NEW.environment
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_feature_toggle_history_trigger
    AFTER INSERT OR UPDATE ON feature_toggles
    FOR EACH ROW EXECUTE FUNCTION create_feature_toggle_history_entry();

-- Enable RLS on all tables
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggle_validations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all feature toggles" ON feature_toggles
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Admins can insert feature toggles" ON feature_toggles
    FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can update feature toggles" ON feature_toggles
    FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Admins can delete feature toggles" ON feature_toggles
    FOR DELETE USING (auth.role() = 'admin');

-- Similar policies for other tables (abbreviated for brevity)

-- Insert some default feature toggles
INSERT INTO feature_toggles (
    key, name, description, category, type, status, environment, is_active, rollout_strategy, rollout_percentage, created_by, updated_by
) VALUES 
(
    'enable_dark_mode',
    'Enable Dark Mode',
    'Feature toggle for enabling dark mode UI',
    'ui',
    'boolean',
    'production',
    'production',
    true,
    'immediate',
    100,
    'system',
    'system'
),
(
    'enable_notifications',
    'Enable Notifications',
    'Feature toggle for enabling push notifications',
    'notification',
    'boolean',
    'production',
    'production',
    true,
    'gradual',
    50,
    'system',
    'system'
),
(
    'new_payment_flow',
    'New Payment Flow',
    'Feature toggle for the new payment processing flow',
    'payment',
    'percentage',
    'testing',
    'production',
    false,
    'canary',
    10,
    'system',
    'system'
),
(
    'beta_features',
    'Beta Features',
    'Feature toggle for accessing beta features',
    'beta',
    'user_based',
    'production',
    'production',
    true,
    'user_based',
    25,
    'system',
    'system'
);

-- Create a view for feature toggle statistics
CREATE VIEW feature_toggle_statistics AS
SELECT 
    category,
    type,
    status,
    environment,
    COUNT(*) as total_feature_toggles,
    COUNT(CASE WHEN is_active THEN 1 END) as active_feature_toggles,
    COUNT(CASE WHEN status = 'production' THEN 1 END) as production_feature_toggles,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_feature_toggles,
    AVG(rollout_percentage) as avg_rollout_percentage
FROM feature_toggles
GROUP BY category, type, status, environment;

-- Create a view for feature toggle health
CREATE VIEW feature_toggle_health AS
SELECT 
    ft.id,
    ft.key,
    ft.name,
    ft.category,
    ft.status,
    ft.is_active,
    COUNT(fe.id) as error_count,
    COUNT(fp.id) as performance_issues,
    CASE 
        WHEN COUNT(fe.id) = 0 AND ft.is_active = true AND ft.status = 'production' THEN 'healthy'
        WHEN COUNT(fe.id) > 0 OR ft.is_active = false OR ft.status != 'production' THEN 'critical'
        ELSE 'warning'
    END as health_status
FROM feature_toggles ft
LEFT JOIN feature_toggle_errors fe ON ft.id = fe.feature_toggle_id AND fe.resolved = false
LEFT JOIN feature_toggle_performance fp ON ft.id = fp.feature_toggle_id AND fp.status IN ('warning', 'critical')
GROUP BY ft.id, ft.key, ft.name, ft.category, ft.status, ft.is_active;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
