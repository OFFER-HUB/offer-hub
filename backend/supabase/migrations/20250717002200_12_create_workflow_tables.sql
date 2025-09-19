-- Migration: Create Workflow Tables for Dispute Resolution System
-- Based on PRD.md specifications
-- Created: 2025-01-17

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workflow_stages table
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    stage_name VARCHAR(50) NOT NULL CHECK (stage_name IN (
        'dispute_initiation',
        'mediator_assignment', 
        'evidence_collection',
        'mediation_process',
        'resolution_or_escalation',
        'arbitration',
        'resolution_implementation'
    )),
    stage_order INTEGER NOT NULL CHECK (stage_order >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'completed',
        'skipped',
        'failed',
        'escalated'
    )),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_progress table
    -- Unique identifier for each progress entry
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to the dispute this progress belongs to
    dispute_id UUID NOT NULL,
    
    -- Reference to the specific workflow stage
    stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    
    -- Progress percentage (0-100)
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Milestone description for this progress update
    milestone VARCHAR(100),
    
    -- Additional notes about the progress
    notes TEXT,
    
    -- When this progress entry was last updated
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User who made this progress update
    updated_by UUID NOT NULL REFERENCES users(id),
    
    -- When this progress entry was created
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_notifications table
CREATE TABLE workflow_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'stage_transition',
        'deadline_alert',
        'action_required',
        'resolution_update',
        'system_alert',
        'evidence_request',
        'mediator_assignment',
        'arbitration_escalation'
    )),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_method VARCHAR(20) NOT NULL DEFAULT 'in_app' CHECK (delivery_method IN (
        'in_app',
        'email',
        'sms',
        'push'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_audit_trail table
CREATE TABLE workflow_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    old_state JSONB,
    new_state JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT
);

-- Create workflow_deadlines table
CREATE TABLE workflow_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    stage_name VARCHAR(50) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    is_overdue BOOLEAN DEFAULT FALSE,
    escalation_triggered BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_deadline_extensions table
CREATE TABLE workflow_deadline_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deadline_id UUID NOT NULL REFERENCES workflow_deadlines(id) ON DELETE CASCADE,
    extended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    extended_by UUID NOT NULL REFERENCES users(id),
    original_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    new_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    extension_hours INTEGER NOT NULL CHECK (extension_hours > 0),
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_configurations table
CREATE TABLE workflow_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_type VARCHAR(50) NOT NULL UNIQUE,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_analytics table for caching
CREATE TABLE workflow_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID,
    analytics_type VARCHAR(50) NOT NULL CHECK (analytics_type IN (
        'dispute_specific',
        'platform_wide',
        'time_range'
    )),
    time_range VARCHAR(20) DEFAULT '30d' CHECK (time_range IN (
        '7d',
        '30d', 
        '90d',
        '1y'
    )),
    analytics_data JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_escalations table
CREATE TABLE workflow_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN (
        'timeout',
        'manual',
        'condition'
    )),
    trigger_condition TEXT,
    escalated_by UUID NOT NULL REFERENCES users(id),
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_workflow_stages_dispute_id ON workflow_stages(dispute_id);
CREATE INDEX idx_workflow_stages_stage_name ON workflow_stages(stage_name);
CREATE INDEX idx_workflow_stages_status ON workflow_stages(status);
CREATE INDEX idx_workflow_stages_deadline ON workflow_stages(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_workflow_stages_assigned_to ON workflow_stages(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX idx_workflow_progress_dispute_id ON workflow_progress(dispute_id);
CREATE INDEX idx_workflow_progress_stage_id ON workflow_progress(stage_id);
CREATE INDEX idx_workflow_progress_updated_by ON workflow_progress(updated_by);
CREATE INDEX idx_workflow_progress_updated_at ON workflow_progress(updated_at);

CREATE INDEX idx_workflow_notifications_dispute_id ON workflow_notifications(dispute_id);
CREATE INDEX idx_workflow_notifications_user_id ON workflow_notifications(user_id);
CREATE INDEX idx_workflow_notifications_type ON workflow_notifications(notification_type);
CREATE INDEX idx_workflow_notifications_sent_at ON workflow_notifications(sent_at);
CREATE INDEX idx_workflow_notifications_read_at ON workflow_notifications(read_at) WHERE read_at IS NULL;

CREATE INDEX idx_workflow_audit_trail_dispute_id ON workflow_audit_trail(dispute_id);
CREATE INDEX idx_workflow_audit_trail_performed_by ON workflow_audit_trail(performed_by);
CREATE INDEX idx_workflow_audit_trail_performed_at ON workflow_audit_trail(performed_at);
CREATE INDEX idx_workflow_audit_trail_action ON workflow_audit_trail(action);

CREATE INDEX idx_workflow_deadlines_dispute_id ON workflow_deadlines(dispute_id);
CREATE INDEX idx_workflow_deadlines_stage_id ON workflow_deadlines(stage_id);
CREATE INDEX idx_workflow_deadlines_deadline ON workflow_deadlines(deadline);
CREATE INDEX idx_workflow_deadlines_overdue ON workflow_deadlines(is_overdue) WHERE is_overdue = TRUE;

CREATE INDEX idx_workflow_deadline_extensions_deadline_id ON workflow_deadline_extensions(deadline_id);
CREATE INDEX idx_workflow_deadline_extensions_extended_by ON workflow_deadline_extensions(extended_by);
CREATE INDEX idx_workflow_deadline_extensions_extended_at ON workflow_deadline_extensions(extended_at);

CREATE INDEX idx_workflow_configurations_dispute_type ON workflow_configurations(dispute_type);
CREATE INDEX idx_workflow_configurations_is_active ON workflow_configurations(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_workflow_analytics_dispute_id ON workflow_analytics(dispute_id) WHERE dispute_id IS NOT NULL;
CREATE INDEX idx_workflow_analytics_type ON workflow_analytics(analytics_type);
CREATE INDEX idx_workflow_analytics_expires_at ON workflow_analytics(expires_at);

CREATE INDEX idx_workflow_escalations_dispute_id ON workflow_escalations(dispute_id);
CREATE INDEX idx_workflow_escalations_from_stage ON workflow_escalations(from_stage);
CREATE INDEX idx_workflow_escalations_escalated_at ON workflow_escalations(escalated_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_stages_updated_at 
    BEFORE UPDATE ON workflow_stages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_deadlines_updated_at 
    BEFORE UPDATE ON workflow_deadlines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_configurations_updated_at 
    BEFORE UPDATE ON workflow_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update overdue status
CREATE OR REPLACE FUNCTION update_overdue_deadlines()
RETURNS TRIGGER AS $$
BEGIN
    -- Update overdue status for deadlines
    UPDATE workflow_deadlines 
    SET is_overdue = TRUE, updated_at = NOW()
    WHERE deadline < NOW() 
    AND is_overdue = FALSE 
    AND escalation_triggered = FALSE;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run overdue check on deadline updates
CREATE TRIGGER trigger_update_overdue_deadlines
    AFTER UPDATE ON workflow_deadlines
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_overdue_deadlines();

-- Create function to log audit trail automatically
CREATE OR REPLACE FUNCTION log_workflow_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Log stage transitions
    IF TG_TABLE_NAME = 'workflow_stages' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO workflow_audit_trail (
                dispute_id,
                action,
                performed_by,
                old_state,
                new_state,
                metadata
            ) VALUES (
                NEW.dispute_id,
                'stage_status_change',
                COALESCE(NEW.assigned_to, 'system'),
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status),
                jsonb_build_object('stage_name', NEW.stage_name)
            );
        END IF;
        
        IF OLD.stage_name IS DISTINCT FROM NEW.stage_name THEN
            INSERT INTO workflow_audit_trail (
                dispute_id,
                action,
                performed_by,
                old_state,
                new_state,
                metadata
            ) VALUES (
                NEW.dispute_id,
                'stage_transition',
                COALESCE(NEW.assigned_to, 'system'),
                jsonb_build_object('stage', OLD.stage_name),
                jsonb_build_object('stage', NEW.stage_name),
                jsonb_build_object('transition_time', NOW())
            );
        END IF;
    END IF;
    
    -- Log progress updates
    IF TG_TABLE_NAME = 'workflow_progress' THEN
        INSERT INTO workflow_audit_trail (
            dispute_id,
            action,
            performed_by,
            old_state,
            new_state,
            metadata
        ) VALUES (
            NEW.dispute_id,
            'progress_update',
            NEW.updated_by,
            jsonb_build_object('percentage', OLD.progress_percentage),
            jsonb_build_object('percentage', NEW.progress_percentage),
            jsonb_build_object('milestone', NEW.milestone, 'stage_id', NEW.stage_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER trigger_log_workflow_stages_audit
    AFTER UPDATE ON workflow_stages
    FOR EACH ROW
    EXECUTE FUNCTION log_workflow_audit();

CREATE TRIGGER trigger_log_workflow_progress_audit
    AFTER INSERT OR UPDATE ON workflow_progress
    FOR EACH ROW
    EXECUTE FUNCTION log_workflow_audit();

-- Create function to send notifications automatically
CREATE OR REPLACE FUNCTION send_workflow_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification on stage transition
    IF TG_TABLE_NAME = 'workflow_stages' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- This would integrate with your notification system
        -- For now, we'll just log it
        INSERT INTO workflow_notifications (
            dispute_id,
            user_id,
            notification_type,
            title,
            message,
            delivery_method
        ) VALUES (
            NEW.dispute_id,
            NEW.assigned_to,
            'stage_transition',
            'Stage Status Updated',
            'Stage ' || NEW.stage_name || ' status changed to ' || NEW.status,
            'in_app'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic notifications
CREATE TRIGGER trigger_send_workflow_notifications
    AFTER UPDATE ON workflow_stages
    FOR EACH ROW
    EXECUTE FUNCTION send_workflow_notification();

-- Create function to clean up expired analytics
CREATE OR REPLACE FUNCTION cleanup_expired_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM workflow_analytics WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert default workflow configuration
INSERT INTO workflow_configurations (dispute_type, configuration, created_by) VALUES (
    'standard',
    '{
        "stages": [
            {
                "stageName": "dispute_initiation",
                "duration": 2,
                "requirements": ["Valid dispute reason", "Project identification", "Initial description"],
                "actions": ["Submit dispute form", "Receive confirmation", "Await mediator assignment"],
                "autoAdvance": false
            },
            {
                "stageName": "mediator_assignment", 
                "duration": 24,
                "requirements": ["Automatic mediator assignment", "Manual assignment by admin", "Mediator acceptance"],
                "actions": ["Mediator receives notification", "Mediator reviews details", "Mediator accepts/declines"],
                "autoAdvance": false,
                "escalationAfter": 24
            },
            {
                "stageName": "evidence_collection",
                "duration": 72,
                "requirements": ["Both parties submit evidence", "Mediator reviews evidence", "Evidence validation"],
                "actions": ["Upload supporting documents", "Request additional evidence", "Review and categorize"],
                "autoAdvance": false,
                "escalationAfter": 72
            },
            {
                "stageName": "mediation_process",
                "duration": 168,
                "requirements": ["Mediator facilitates communication", "Settlement negotiation", "Progress documentation"],
                "actions": ["Conduct mediation sessions", "Negotiate settlement terms", "Document progress"],
                "autoAdvance": false,
                "escalationAfter": 168
            },
            {
                "stageName": "resolution_or_escalation",
                "duration": 24,
                "requirements": ["Mediation outcome documentation", "Escalation decision", "Resolution implementation"],
                "actions": ["Execute settlement agreement", "Escalate to arbitration", "Implement resolution"],
                "autoAdvance": false
            },
            {
                "stageName": "arbitration",
                "duration": 336,
                "requirements": ["Arbitrator assignment", "Final evidence review", "Binding decision"],
                "actions": ["Assign arbitrator", "Review evidence", "Make final decision"],
                "autoAdvance": false,
                "escalationAfter": 336
            },
            {
                "stageName": "resolution_implementation",
                "duration": 48,
                "requirements": ["Fund release execution", "Resolution documentation", "Final notifications"],
                "actions": ["Release funds", "Distribute according to decision", "Close dispute"],
                "autoAdvance": true
            }
        ],
        "timeouts": {
            "dispute_initiation": 2,
            "mediator_assignment": 24,
            "evidence_collection": 72,
            "mediation_process": 168,
            "resolution_or_escalation": 24,
            "arbitration": 336,
            "resolution_implementation": 48
        },
        "escalationRules": [
            {
                "fromStage": "mediator_assignment",
                "toStage": "evidence_collection", 
                "trigger": "timeout"
            },
            {
                "fromStage": "evidence_collection",
                "toStage": "mediation_process",
                "trigger": "timeout"
            },
            {
                "fromStage": "mediation_process",
                "toStage": "arbitration",
                "trigger": "condition",
                "condition": "mediation_failed"
            },
            {
                "fromStage": "arbitration",
                "toStage": "resolution_implementation",
                "trigger": "timeout"
            }
        ],
        "notificationSettings": {
            "enabled": true,
            "channels": ["in_app", "email", "push"],
            "timing": {
                "immediate": ["stage_transition", "action_required", "deadline_alert"],
                "daily": ["evidence_request", "mediator_assignment"],
                "weekly": ["resolution_update"]
            }
        }
    }'::jsonb,
    NULL
);

-- Create RLS policies for security
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_deadline_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_escalations ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_stages
-- Note: These policies reference a 'disputes' table that doesn't exist yet
-- CREATE POLICY "Users can view stages for their disputes" ON workflow_stages
--     FOR SELECT USING (
--         dispute_id IN (
--             SELECT id FROM disputes 
--             WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
--         )
--     );

CREATE POLICY "Admins can manage all stages" ON workflow_stages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for workflow_progress
-- Note: These policies reference a 'disputes' table that doesn't exist yet
-- CREATE POLICY "Users can view progress for their disputes" ON workflow_progress
--     FOR SELECT USING (
--         dispute_id IN (
--             SELECT id FROM disputes 
--             WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
--         )
--     );

-- CREATE POLICY "Users can update progress for their disputes" ON workflow_progress
--     FOR INSERT WITH CHECK (
--         dispute_id IN (
--             SELECT id FROM disputes 
--             WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
--         )
--     );

-- Create policies for workflow_notifications
CREATE POLICY "Users can view their notifications" ON workflow_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage notifications" ON workflow_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'system')
        )
    );

-- Create policies for workflow_audit_trail
-- Note: These policies reference a 'disputes' table that doesn't exist yet
-- CREATE POLICY "Users can view audit trail for their disputes" ON workflow_audit_trail
--     FOR SELECT USING (
--         dispute_id IN (
--             SELECT id FROM disputes 
--             WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
--         )
--     );

-- Create policies for workflow_deadlines
-- Note: These policies reference a 'disputes' table that doesn't exist yet
-- CREATE POLICY "Users can view deadlines for their disputes" ON workflow_deadlines
--     FOR SELECT USING (
--         dispute_id IN (
--             SELECT id FROM disputes 
--             WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
--         )
--     );

-- Create policies for workflow_configurations
CREATE POLICY "Admins can manage configurations" ON workflow_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for workflow_analytics
-- Note: These policies reference a 'disputes' table that doesn't exist yet
-- CREATE POLICY "Users can view analytics for their disputes" ON workflow_analytics
--     FOR SELECT USING (
--         dispute_id IS NULL OR dispute_id IN (
--             SELECT id FROM disputes 
--             WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
--         )
--     );

-- Add comments for documentation
COMMENT ON TABLE workflow_stages IS 'Tracks the stages of dispute resolution workflow';
COMMENT ON TABLE workflow_progress IS 'Records progress milestones and updates within each stage';
COMMENT ON TABLE workflow_notifications IS 'Stores all workflow-related notifications sent to users';
COMMENT ON TABLE workflow_audit_trail IS 'Comprehensive audit log of all workflow activities and changes';
COMMENT ON TABLE workflow_deadlines IS 'Tracks deadlines for each workflow stage';
COMMENT ON TABLE workflow_deadline_extensions IS 'Records deadline extensions with reasons';
COMMENT ON TABLE workflow_configurations IS 'Stores workflow configurations for different dispute types';
COMMENT ON TABLE workflow_analytics IS 'Caches analytics data for performance optimization';
COMMENT ON TABLE workflow_escalations IS 'Tracks escalation events between workflow stages';
