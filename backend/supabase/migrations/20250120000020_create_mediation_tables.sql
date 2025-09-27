-- Migration: Create Mediation System Tables
-- Comprehensive mediation system with mediators, sessions, and settlement agreements
-- Created: 2025-01-20

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mediators table
CREATE TABLE mediators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    bio TEXT,
    profile_image TEXT,
    expertise_areas JSONB DEFAULT '[]',
    languages TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_mediations INTEGER DEFAULT 0 CHECK (total_mediations >= 0),
    successful_mediations INTEGER DEFAULT 0 CHECK (successful_mediations >= 0),
    average_resolution_time DECIMAL(8,2) DEFAULT 0.0 CHECK (average_resolution_time >= 0),
    hourly_rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]',
    specializations TEXT[] DEFAULT '{}',
    certifications JSONB DEFAULT '[]',
    experience JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Create mediation_sessions table
CREATE TABLE mediation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    mediator_id UUID NOT NULL REFERENCES mediators(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',
        'in_progress',
        'paused',
        'completed',
        'cancelled',
        'escalated',
        'failed'
    )),
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'individual',
        'group',
        'shuttle',
        'caucus',
        'hybrid'
    )),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in minutes
    location TEXT,
    meeting_type VARCHAR(20) NOT NULL CHECK (meeting_type IN (
        'in_person',
        'video_call',
        'phone_call',
        'chat',
        'hybrid'
    )),
    meeting_url TEXT,
    participants JSONB DEFAULT '[]',
    agenda JSONB DEFAULT '[]',
    notes JSONB DEFAULT '[]',
    evidence JSONB DEFAULT '[]',
    proposals JSONB DEFAULT '[]',
    outcome VARCHAR(20) CHECK (outcome IN (
        'settled',
        'partially_settled',
        'not_settled',
        'escalated',
        'cancelled'
    )),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mediation_assignments table
CREATE TABLE mediation_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL,
    mediator_id UUID NOT NULL REFERENCES mediators(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN (
        'automatic',
        'manual',
        'self_selected'
    )),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'accepted',
        'declined',
        'in_progress',
        'completed',
        'cancelled'
    )),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN (
        'low',
        'normal',
        'high',
        'urgent'
    )),
    estimated_duration INTEGER DEFAULT 4, -- in hours
    actual_duration INTEGER, -- in hours
    reason TEXT,
    notes TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    decline_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settlement_agreements table
CREATE TABLE settlement_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mediation_session_id UUID NOT NULL REFERENCES mediation_sessions(id) ON DELETE CASCADE,
    dispute_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    terms JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',
        'pending_signatures',
        'signed',
        'active',
        'completed',
        'breached',
        'terminated',
        'expired'
    )),
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    signed_by JSONB DEFAULT '[]',
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    template_id UUID,
    custom_clauses JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mediation_notifications table
CREATE TABLE mediation_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'session_scheduled',
        'session_starting',
        'session_ended',
        'proposal_submitted',
        'proposal_voted',
        'agreement_ready',
        'agreement_signed',
        'evidence_submitted',
        'deadline_approaching',
        'deadline_expired',
        'escalation_required',
        'assignment_received',
        'assignment_accepted',
        'assignment_declined'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low',
        'medium',
        'high',
        'urgent'
    )),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mediation_escalations table
CREATE TABLE mediation_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mediation_session_id UUID NOT NULL REFERENCES mediation_sessions(id) ON DELETE CASCADE,
    dispute_id UUID NOT NULL,
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN (
        'mediation_failed',
        'deadline_expired',
        'participant_unresponsive',
        'complex_issues',
        'legal_requirements',
        'participant_request',
        'mediator_recommendation',
        'other'
    )),
    escalated_by UUID NOT NULL REFERENCES users(id),
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'resolved',
        'cancelled'
    )),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mediation_analytics table for caching
CREATE TABLE mediation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_type VARCHAR(50) NOT NULL CHECK (analytics_type IN (
        'platform_wide',
        'mediator_specific',
        'category_specific',
        'time_range'
    )),
    time_range VARCHAR(20) DEFAULT '30d' CHECK (time_range IN (
        '7d',
        '30d',
        '90d',
        '1y'
    )),
    mediator_id UUID REFERENCES mediators(id),
    category VARCHAR(50),
    analytics_data JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_mediators_user_id ON mediators(user_id);
CREATE INDEX idx_mediators_is_active ON mediators(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_mediators_is_verified ON mediators(is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_mediators_rating ON mediators(rating);
CREATE INDEX idx_mediators_expertise_areas ON mediators USING GIN(expertise_areas);
CREATE INDEX idx_mediators_languages ON mediators USING GIN(languages);
CREATE INDEX idx_mediators_specializations ON mediators USING GIN(specializations);

CREATE INDEX idx_mediation_sessions_dispute_id ON mediation_sessions(dispute_id);
CREATE INDEX idx_mediation_sessions_mediator_id ON mediation_sessions(mediator_id);
CREATE INDEX idx_mediation_sessions_status ON mediation_sessions(status);
CREATE INDEX idx_mediation_sessions_scheduled_at ON mediation_sessions(scheduled_at);
CREATE INDEX idx_mediation_sessions_started_at ON mediation_sessions(started_at);
CREATE INDEX idx_mediation_sessions_ended_at ON mediation_sessions(ended_at);
CREATE INDEX idx_mediation_sessions_type ON mediation_sessions(type);
CREATE INDEX idx_mediation_sessions_meeting_type ON mediation_sessions(meeting_type);

CREATE INDEX idx_mediation_assignments_dispute_id ON mediation_assignments(dispute_id);
CREATE INDEX idx_mediation_assignments_mediator_id ON mediation_assignments(mediator_id);
CREATE INDEX idx_mediation_assignments_status ON mediation_assignments(status);
CREATE INDEX idx_mediation_assignments_priority ON mediation_assignments(priority);
CREATE INDEX idx_mediation_assignments_assigned_at ON mediation_assignments(assigned_at);

CREATE INDEX idx_settlement_agreements_mediation_session_id ON settlement_agreements(mediation_session_id);
CREATE INDEX idx_settlement_agreements_dispute_id ON settlement_agreements(dispute_id);
CREATE INDEX idx_settlement_agreements_status ON settlement_agreements(status);
CREATE INDEX idx_settlement_agreements_effective_date ON settlement_agreements(effective_date);
CREATE INDEX idx_settlement_agreements_expiry_date ON settlement_agreements(expiry_date);

CREATE INDEX idx_mediation_notifications_user_id ON mediation_notifications(user_id);
CREATE INDEX idx_mediation_notifications_type ON mediation_notifications(type);
CREATE INDEX idx_mediation_notifications_is_read ON mediation_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_mediation_notifications_priority ON mediation_notifications(priority);
CREATE INDEX idx_mediation_notifications_sent_at ON mediation_notifications(sent_at);
CREATE INDEX idx_mediation_notifications_created_at ON mediation_notifications(created_at);

CREATE INDEX idx_mediation_escalations_mediation_session_id ON mediation_escalations(mediation_session_id);
CREATE INDEX idx_mediation_escalations_dispute_id ON mediation_escalations(dispute_id);
CREATE INDEX idx_mediation_escalations_status ON mediation_escalations(status);
CREATE INDEX idx_mediation_escalations_escalated_at ON mediation_escalations(escalated_at);
CREATE INDEX idx_mediation_escalations_reason ON mediation_escalations(reason);

CREATE INDEX idx_mediation_analytics_type ON mediation_analytics(analytics_type);
CREATE INDEX idx_mediation_analytics_mediator_id ON mediation_analytics(mediator_id) WHERE mediator_id IS NOT NULL;
CREATE INDEX idx_mediation_analytics_category ON mediation_analytics(category) WHERE category IS NOT NULL;
CREATE INDEX idx_mediation_analytics_expires_at ON mediation_analytics(expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mediators_updated_at 
    BEFORE UPDATE ON mediators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mediation_sessions_updated_at 
    BEFORE UPDATE ON mediation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mediation_assignments_updated_at 
    BEFORE UPDATE ON mediation_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlement_agreements_updated_at 
    BEFORE UPDATE ON settlement_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update mediator statistics
CREATE OR REPLACE FUNCTION update_mediator_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update mediator statistics when mediation session is completed
    IF TG_TABLE_NAME = 'mediation_sessions' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
        UPDATE mediators 
        SET 
            total_mediations = total_mediations + 1,
            successful_mediations = successful_mediations + CASE 
                WHEN NEW.outcome IN ('settled', 'partially_settled') THEN 1 
                ELSE 0 
            END,
            average_resolution_time = CASE 
                WHEN total_mediations = 0 THEN 
                    EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 3600
                ELSE 
                    (average_resolution_time * total_mediations + EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 3600) / (total_mediations + 1)
            END,
            rating = CASE 
                WHEN total_mediations = 0 THEN 5.0
                ELSE (rating * total_mediations + 5.0) / (total_mediations + 1)
            END,
            updated_at = NOW()
        WHERE id = NEW.mediator_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic mediator stats updates
CREATE TRIGGER trigger_update_mediator_stats
    AFTER UPDATE ON mediation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_mediator_stats();

-- Create function to send mediation notifications automatically
CREATE OR REPLACE FUNCTION send_mediation_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification when mediation session status changes
    IF TG_TABLE_NAME = 'mediation_sessions' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Notify mediator
        INSERT INTO mediation_notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            NEW.mediator_id,
            'session_' || NEW.status,
            'Mediation Session ' || INITCAP(REPLACE(NEW.status, '_', ' ')),
            'Mediation session ' || NEW.id || ' status changed to ' || NEW.status,
            jsonb_build_object('sessionId', NEW.id, 'disputeId', NEW.dispute_id, 'status', NEW.status),
            CASE 
                WHEN NEW.status IN ('in_progress', 'completed', 'escalated') THEN 'high'
                ELSE 'medium'
            END
        );
        
        -- Notify participants
        FOR i IN 0..jsonb_array_length(NEW.participants) - 1 LOOP
            INSERT INTO mediation_notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority
            ) VALUES (
                (NEW.participants->i->>'userId')::uuid,
                'session_' || NEW.status,
                'Mediation Session ' || INITCAP(REPLACE(NEW.status, '_', ' ')),
                'Mediation session ' || NEW.id || ' status changed to ' || NEW.status,
                jsonb_build_object('sessionId', NEW.id, 'disputeId', NEW.dispute_id, 'status', NEW.status),
                CASE 
                    WHEN NEW.status IN ('in_progress', 'completed', 'escalated') THEN 'high'
                    ELSE 'medium'
                END
            );
        END LOOP;
    END IF;
    
    -- Send notification when mediation assignment is created
    IF TG_TABLE_NAME = 'mediation_assignments' AND TG_OP = 'INSERT' THEN
        INSERT INTO mediation_notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            NEW.mediator_id,
            'assignment_received',
            'New Mediation Assignment',
            'You have been assigned to mediate dispute ' || NEW.dispute_id,
            jsonb_build_object('assignmentId', NEW.id, 'disputeId', NEW.dispute_id),
            'high'
        );
    END IF;
    
    -- Send notification when settlement agreement is ready for signing
    IF TG_TABLE_NAME = 'settlement_agreements' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'pending_signatures' THEN
        -- Get mediation session participants
        SELECT participants INTO NEW.participants FROM mediation_sessions WHERE id = NEW.mediation_session_id;
        
        -- Notify participants
        FOR i IN 0..jsonb_array_length(NEW.participants) - 1 LOOP
            INSERT INTO mediation_notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority
            ) VALUES (
                (NEW.participants->i->>'userId')::uuid,
                'agreement_ready',
                'Settlement Agreement Ready for Signing',
                'Settlement agreement for mediation session ' || NEW.mediation_session_id || ' is ready for your signature',
                jsonb_build_object('agreementId', NEW.id, 'sessionId', NEW.mediation_session_id),
                'high'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic notifications
CREATE TRIGGER trigger_send_mediation_notifications_sessions
    AFTER UPDATE ON mediation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION send_mediation_notification();

CREATE TRIGGER trigger_send_mediation_notifications_assignments
    AFTER INSERT ON mediation_assignments
    FOR EACH ROW
    EXECUTE FUNCTION send_mediation_notification();

CREATE TRIGGER trigger_send_mediation_notifications_agreements
    AFTER UPDATE ON settlement_agreements
    FOR EACH ROW
    EXECUTE FUNCTION send_mediation_notification();

-- Create function to clean up expired analytics
CREATE OR REPLACE FUNCTION cleanup_expired_mediation_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM mediation_analytics WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for security
ALTER TABLE mediators ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediation_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediation_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediation_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for mediators
CREATE POLICY "Users can view active mediators" ON mediators
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view their own mediator profile" ON mediators
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all mediators" ON mediators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for mediation_sessions
CREATE POLICY "Users can view sessions they participate in" ON mediation_sessions
    FOR SELECT USING (
        mediator_id IN (
            SELECT id FROM mediators WHERE user_id = auth.uid()
        ) OR
        participants @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
    );

CREATE POLICY "Mediators can manage their sessions" ON mediation_sessions
    FOR ALL USING (
        mediator_id IN (
            SELECT id FROM mediators WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all sessions" ON mediation_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for mediation_assignments
CREATE POLICY "Mediators can view their assignments" ON mediation_assignments
    FOR SELECT USING (
        mediator_id IN (
            SELECT id FROM mediators WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage assignments" ON mediation_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for settlement_agreements
CREATE POLICY "Users can view agreements they participate in" ON settlement_agreements
    FOR SELECT USING (
        mediation_session_id IN (
            SELECT id FROM mediation_sessions 
            WHERE mediator_id IN (
                SELECT id FROM mediators WHERE user_id = auth.uid()
            ) OR
            participants @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
        )
    );

CREATE POLICY "Mediators can manage agreements for their sessions" ON settlement_agreements
    FOR ALL USING (
        mediation_session_id IN (
            SELECT id FROM mediation_sessions 
            WHERE mediator_id IN (
                SELECT id FROM mediators WHERE user_id = auth.uid()
            )
        )
    );

-- Create policies for mediation_notifications
CREATE POLICY "Users can view their notifications" ON mediation_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON mediation_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Create policies for mediation_escalations
CREATE POLICY "Users can view escalations for their sessions" ON mediation_escalations
    FOR SELECT USING (
        mediation_session_id IN (
            SELECT id FROM mediation_sessions 
            WHERE mediator_id IN (
                SELECT id FROM mediators WHERE user_id = auth.uid()
            ) OR
            participants @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
        )
    );

CREATE POLICY "Admins can manage escalations" ON mediation_escalations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for mediation_analytics
CREATE POLICY "Admins can view analytics" ON mediation_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE mediators IS 'Stores mediator profiles with expertise, availability, and performance data';
COMMENT ON TABLE mediation_sessions IS 'Tracks individual mediation sessions with participants, agenda, and outcomes';
COMMENT ON TABLE mediation_assignments IS 'Records mediator assignments to disputes with status and priority';
COMMENT ON TABLE settlement_agreements IS 'Stores settlement agreements with terms, signatures, and status';
COMMENT ON TABLE mediation_notifications IS 'Manages all mediation-related notifications sent to users';
COMMENT ON TABLE mediation_escalations IS 'Tracks escalation events from mediation to arbitration';
COMMENT ON TABLE mediation_analytics IS 'Caches mediation analytics data for performance optimization';
